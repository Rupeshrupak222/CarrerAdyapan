import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendInterviewScheduledEmail, sendRejectionEmail } from '../services/emailService.js';
import { notificationService } from '../services/notificationService.js';
import { secureTokenService } from '../services/secureTokenService.js';

/**
 * Get Eligible Candidates for a specific Interview Round (Strict Backend Enforcement)
 * Round 1: Shortlisted candidates who haven't been rejected.
 * Round R (> 1): Candidates who were marked "SELECTED" in Round R-1 and haven't been rejected.
 */
export const getEligibleCandidatesForRound = async (req, res) => {
  try {
    const roundNumber = parseInt(req.query.roundNumber || '1', 10);
    const jobId = req.query.jobId ? String(req.query.jobId) : undefined;

    let applications = [];

    if (roundNumber === 1) {
      // Eligible for Round 1: Status is SHORTLISTED or AI_SCREENED / PENDING, not REJECTED
      applications = await prisma.application.findMany({
        where: {
          ...(jobId && { jobId }),
          status: { in: ['SHORTLISTED', 'AI_SCREENED', 'PENDING', 'APPLIED'] },
          NOT: {
            status: 'REJECTED',
          },
        },
        include: {
          candidate: true,
          job: true,
          interviews: {
            orderBy: { roundNumber: 'asc' },
          },
        },
      });
    } else {
      // Eligible for Round R: Must have passed Round R-1 with result "SELECTED"
      const prevRoundNumber = roundNumber - 1;

      // Find applications that have passed previous round
      applications = await prisma.application.findMany({
        where: {
          ...(jobId && { jobId }),
          NOT: {
            status: 'REJECTED',
          },
          interviews: {
            some: {
              roundNumber: prevRoundNumber,
              result: 'SELECTED',
            },
            none: {
              result: 'REJECTED',
            },
          },
        },
        include: {
          candidate: true,
          job: true,
          interviews: {
            orderBy: { roundNumber: 'asc' },
          },
        },
      });
    }

    // Filter out candidates already scheduled for this exact round (optional flag)
    const candidates = applications.map((app) => {
      const existingInterviewForThisRound = app.interviews.find((i) => i.roundNumber === roundNumber);
      return {
        ...app.candidate,
        applicationId: app.id,
        jobId: app.jobId,
        jobTitle: app.job?.title || 'Applicant',
        currentRound: app.currentRound,
        maxRounds: app.maxRounds,
        finalSelected: app.finalSelected,
        applicationStatus: app.status,
        alreadyScheduledInThisRound: !!existingInterviewForThisRound,
        existingInterviewId: existingInterviewForThisRound?.id,
        interviews: app.interviews,
      };
    });

    res.json({
      success: true,
      roundNumber,
      count: candidates.length,
      candidates,
    });
  } catch (error: any) {
    logger.error('Get Eligible Candidates Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch eligible candidates: ' + error.message });
  }
};

/**
 * Dynamic Round-Robin HR Allocation & Multi-Round Scheduling
 * 1. Validates candidates eligible for the given round.
 * 2. Fetches all currently active HR team members (dynamic count: 1, 2, 5, 10, 20+).
 * 3. Evenly distributes candidates across active HRs (Round-Robin).
 * 4. Assigns each interview the HR's database-stored Google Meet link.
 * 5. Dispatches interview invitation emails in parallel.
 */
export const allocateAndScheduleRound = async (req, res) => {
  try {
    const {
      roundNumber = 1,
      roundName,
      candidateIds = [],
      applicationIds = [],
      type = 'VIDEO',
      scheduledAt,
      duration = 30,
      notes,
      specificHrId, // Optional manual override, otherwise automatic balanced round-robin
    } = req.body;

    const roundNum = parseInt(String(roundNumber), 10) || 1;
    const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date();
    const durationNum = parseInt(String(duration), 10) || 30;
    const targetRoundName = roundName || `Round ${roundNum}`;

    // 1. Fetch Candidates/Applications
    let targetApplications = [];
    if (applicationIds && applicationIds.length > 0) {
      targetApplications = await prisma.application.findMany({
        where: { id: { in: applicationIds } },
        include: { candidate: true, job: true, interviews: true },
      });
    } else if (candidateIds && candidateIds.length > 0) {
      targetApplications = await prisma.application.findMany({
        where: { candidateId: { in: candidateIds } },
        include: { candidate: true, job: true, interviews: true },
      });
    }

    if (targetApplications.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid candidate applications found to schedule.' });
    }

    // 2. Strict Backend Eligibility Check
    if (roundNum > 1) {
      const prevRoundNum = roundNum - 1;
      const disqualified = targetApplications.filter((app) => {
        const prevInterview = app.interviews.find((i) => i.roundNumber === prevRoundNum);
        return !prevInterview || prevInterview.result !== 'SELECTED' || app.status === 'REJECTED';
      });

      if (disqualified.length > 0) {
        const names = disqualified.map((a) => `${a.candidate?.firstName} ${a.candidate?.lastName}`).join(', ');
        return res.status(400).json({
          success: false,
          message: `The following candidates are NOT eligible for Round ${roundNum} because they were not selected in Round ${prevRoundNum}: ${names}`,
        });
      }
    }

    // 3. Fetch Currently Active HRs from PostgreSQL DB
    let activeHRs = [];
    if (specificHrId) {
      const singleHr = await prisma.user.findUnique({ where: { id: specificHrId } });
      if (singleHr) activeHRs = [singleHr];
    }

    if (activeHRs.length === 0) {
      activeHRs = await prisma.user.findMany({
        where: {
          isActive: true,
          role: { in: ['HR', 'ADMIN', 'RECRUITER'] },
        },
        orderBy: { name: 'asc' },
      });
    }

    // Fallback if no active HR is marked in DB
    if (activeHRs.length === 0) {
      const adminFallback = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      if (adminFallback) {
        activeHRs = [adminFallback];
      } else {
        activeHRs = [{
          id: 'hr-default-1',
          name: 'Talent Acquisition Team',
          email: 'hr@adyapan.com',
          meetLink: 'https://meet.google.com/adyapan-interview',
        }];
      }
    }

    logger.info(`Distributing ${targetApplications.length} candidates across ${activeHRs.length} active HRs for ${targetRoundName}...`);

    // 4. Balanced Round-Robin Allocation
    const createdInterviews = [];

    for (let i = 0; i < targetApplications.length; i++) {
      const app = targetApplications[i];
      const assignedHr = activeHRs[i % activeHRs.length]; // Balanced round-robin modulo
      const hrMeetLink = assignedHr.meetLink || 'https://meet.google.com/adyapan-interview';
      const candName = `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim() || 'Candidate';
      const candEmail = app.candidate?.email || '';
      const jobTitle = app.job?.title || 'Business Development Associate (BDA)';
      const interviewId = `int-${app.id}-r${roundNum}-${Date.now()}`;

      // Create or update interview record in DB
      const interview = await prisma.interview.create({
        data: {
          id: interviewId,
          applicationId: app.id,
          candidateId: app.candidateId,
          jobId: app.jobId,
          candidateName: candName,
          candidateEmail: candEmail,
          jobTitle: jobTitle,
          roundNumber: roundNum,
          roundName: targetRoundName,
          type: type || 'VIDEO',
          scheduledAt: scheduledDate,
          duration: durationNum,
          location: 'Google Meet',
          meetingLink: hrMeetLink,
          hrId: assignedHr.id !== 'hr-default-1' ? assignedHr.id : null,
          status: 'SCHEDULED',
          result: 'PENDING',
          notes: notes || `${targetRoundName} scheduled with HR ${assignedHr.name}`,
        },
        include: {
          hr: {
            select: { id: true, name: true, email: true, designation: true, meetLink: true },
          },
          application: {
            include: { candidate: true, job: true },
          },
        },
      });

      // Update application currentRound & status in DB
      await prisma.application.update({
        where: { id: app.id },
        data: {
          currentRound: roundNum,
          status: 'INTERVIEW_SCHEDULED',
        },
      });

      createdInterviews.push(interview);

      // 5. Send Interview Scheduled Email with Assigned HR Details & Meet Link
      if (candEmail && !candEmail.includes('example.com')) {
        let secureInterviewToken = interview.id;
        try {
          secureInterviewToken = await secureTokenService.createSecureToken({
            candidateId: app.candidateId,
            applicationId: app.id,
            tokenType: 'INTERVIEW',
            data: { interviewId: interview.id, roundNumber: roundNum },
          });
        } catch (tokErr) {
          logger.warn('Token creation notice:', tokErr);
        }

        sendInterviewScheduledEmail({
          candidateName: candName,
          candidateEmail: candEmail,
          jobTitle: jobTitle,
          roundNumber: roundNum,
          roundName: targetRoundName,
          assignedHrName: assignedHr.name,
          scheduledAt: scheduledDate.toISOString(),
          meetingLink: hrMeetLink,
          secureToken: secureInterviewToken,
        }).catch((err) => logger.error(`Email dispatch error for ${candEmail}:`, err));
      }
    }

    return res.status(201).json({
      success: true,
      message: `Successfully allocated & scheduled ${targetRoundName} for ${createdInterviews.length} candidates across ${activeHRs.length} active HRs!`,
      roundNumber: roundNum,
      activeHrCount: activeHRs.length,
      interviews: createdInterviews,
    });
  } catch (error: any) {
    logger.error('Allocate & Schedule Round Error:', error);
    res.status(500).json({ success: false, message: 'Failed to allocate and schedule round: ' + error.message });
  }
};

// Create or Upsert Single Interview
export const createInterview = async (req, res) => {
  try {
    const {
      id,
      candidateName,
      candidateEmail,
      jobTitle,
      candidateId,
      jobId,
      applicationId,
      type,
      scheduledAt,
      duration,
      location,
      meetingLink,
      notes,
      status,
      roundNumber = 1,
      roundName,
      result = 'PENDING',
      hrId,
    } = req.body;

    const targetId = id || `int-${Date.now()}`;
    const roundNum = parseInt(String(roundNumber), 10) || 1;
    const targetRoundName = roundName || `Round ${roundNum}`;

    // Auto-fetch assigned HR's meet link if not explicitly provided
    let finalMeetingLink = meetingLink;
    let assignedHrId = hrId || null;

    if (hrId) {
      const hrUser = await prisma.user.findUnique({ where: { id: hrId } }).catch(() => null);
      if (hrUser && !meetingLink) {
        finalMeetingLink = hrUser.meetLink;
      }
    }

    if (!finalMeetingLink) {
      finalMeetingLink = 'https://meet.google.com/adyapan-interview';
    }

    // Strict Rejection Check: Prevent scheduling rejected candidates
    if (applicationId) {
      const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { interviews: true },
      });
      if (app && (app.status === 'REJECTED' || app.overallStatus === 'REJECTED' || app.interviews.some((i) => i.result === 'REJECTED'))) {
        return res.status(400).json({
          success: false,
          message: 'Cannot schedule interview: Candidate has been REJECTED in a previous round.',
        });
      }
    }

    const interview = await prisma.interview.upsert({
      where: { id: targetId },
      update: {
        candidateName,
        candidateEmail,
        jobTitle,
        candidateId: candidateId || undefined,
        jobId: jobId || undefined,
        roundNumber: roundNum,
        roundName: targetRoundName,
        result: result || undefined,
        type: type || 'VIDEO',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        duration: duration ? parseInt(String(duration)) : 30,
        location: location || 'Google Meet',
        meetingLink: finalMeetingLink,
        hrId: assignedHrId,
        notes,
        status: status || 'SCHEDULED',
      },
      create: {
        id: targetId,
        candidateName,
        candidateEmail,
        jobTitle,
        candidateId: candidateId || null,
        jobId: jobId || null,
        applicationId: applicationId || null,
        roundNumber: roundNum,
        roundName: targetRoundName,
        result: result || 'PENDING',
        type: type || 'VIDEO',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        duration: duration ? parseInt(String(duration)) : 30,
        location: location || 'Google Meet',
        meetingLink: finalMeetingLink,
        hrId: assignedHrId,
        notes,
        status: status || 'SCHEDULED',
      },
      include: {
        hr: {
          select: { id: true, name: true, email: true, designation: true, meetLink: true },
        },
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    // Update the specific application status based on round number
    const targetAppId = applicationId || interview?.applicationId;
    if (targetAppId) {
      const roundStatus = status === 'COMPLETED' ? 'INTERVIEWED' : (roundNum === 1 ? 'ROUND_1_PENDING' : roundNum === 2 ? 'ROUND_2_PENDING' : 'INTERVIEW_SCHEDULED');
      await prisma.application.update({
        where: { id: targetAppId },
        data: { status: roundStatus, currentRound: roundNum },
      }).catch(() => { });
    }

    const targetEmail = candidateEmail || interview?.application?.candidate?.email;
    const targetName = candidateName || (interview?.application?.candidate ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}` : 'Candidate');
    const targetJob = jobTitle || interview?.application?.job?.title || 'Business Development Associate (BDA)';

    if (targetEmail && (interview.status === 'SCHEDULED' || status === 'SCHEDULED')) {
      sendInterviewScheduledEmail({
        candidateName: targetName,
        candidateEmail: targetEmail,
        jobTitle: targetJob,
        roundNumber: roundNum,
        roundName: targetRoundName,
        assignedHrName: interview.hr?.name || 'HR Team',
        scheduledAt: scheduledAt || new Date().toISOString(),
        meetingLink: finalMeetingLink,
      }).catch((emailErr: any) => {
        logger.error('Interview Schedule Email Error:', emailErr?.message || emailErr);
      });
    }

    res.status(201).json({ success: true, interview });
  } catch (error: any) {
    logger.error('Create Interview Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create interview: ' + error.message });
  }
};

// Bulk Schedule Interviews
export const bulkScheduleInterviews = async (req, res) => {
  return allocateAndScheduleRound(req, res);
};

// Get All Interviews
export const getAllInterviews = async (req, res) => {
  try {
    const { roundNumber, result, status } = req.query;
    const where: any = {};
    if (roundNumber) where.roundNumber = parseInt(String(roundNumber), 10);
    if (result && result !== 'ALL') where.result = String(result);
    if (status && status !== 'ALL') where.status = String(status);

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        hr: {
          select: { id: true, name: true, email: true, designation: true, meetLink: true, phone: true },
        },
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    res.json({ success: true, interviews });
  } catch (error: any) {
    logger.warn('Get Interviews Error: ' + (error?.message || String(error)));
    res.json({ success: true, interviews: [] });
  }
};

// Get Interview by ID
export const getInterviewById = async (req, res) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: {
        hr: {
          select: { id: true, name: true, email: true, designation: true, meetLink: true, phone: true },
        },
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, interview });
  } catch (error: any) {
    logger.error('Get Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch interview: ' + error.message });
  }
};

/**
 * Public: Get Interview Details by Secure Candidate Token (NO LOGIN REQUIRED)
 */
export const getInterviewByToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing token' });
    }

    // 1. Check secure token service
    const verification = await secureTokenService.verifyToken(token, 'INTERVIEW');
    if (verification.valid && verification.data?.interviewId) {
      const interview = await prisma.interview.findUnique({
        where: { id: verification.data.interviewId },
        include: {
          hr: { select: { id: true, name: true, email: true, designation: true, meetLink: true } },
          application: { include: { candidate: true, job: true } },
        },
      });
      if (interview) {
        return res.json({
          success: true,
          interview,
          candidate: verification.candidate || interview.application?.candidate,
          job: interview.application?.job || { title: interview.jobTitle },
        });
      }
    }

    // 2. Direct fallback lookup by interview ID or candidate ID
    const interview = await prisma.interview.findFirst({
      where: { OR: [{ id: token }, { applicationId: token }, { candidateId: token }] },
      include: {
        hr: { select: { id: true, name: true, email: true, designation: true, meetLink: true } },
        application: { include: { candidate: true, job: true } },
      },
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found or link has expired.' });
    }

    return res.json({
      success: true,
      interview,
      candidate: interview.application?.candidate || { firstName: interview.candidateName, email: interview.candidateEmail },
      job: interview.application?.job || { title: interview.jobTitle },
    });
  } catch (error: any) {
    logger.error('Get Interview by Token Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify interview link: ' + error.message });
  }
};

// Update Interview
export const updateInterview = async (req, res) => {
  try {
    const { status, feedback, rating, notes, scheduledAt, type, meetingLink, candidateName, candidateEmail, jobTitle, candidateId, jobId, roundNumber, roundName, result, hrId } = req.body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (type !== undefined) updateData.type = type;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (candidateName !== undefined) updateData.candidateName = candidateName;
    if (candidateEmail !== undefined) updateData.candidateEmail = candidateEmail;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (candidateId !== undefined) updateData.candidateId = candidateId;
    if (jobId !== undefined) updateData.jobId = jobId;
    if (roundNumber !== undefined) updateData.roundNumber = parseInt(String(roundNumber), 10);
    if (roundName !== undefined) updateData.roundName = roundName;
    if (result !== undefined) updateData.result = result;
    if (hrId !== undefined) updateData.hrId = hrId;

    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        hr: {
          select: { id: true, name: true, email: true, designation: true, meetLink: true },
        },
        application: {
          include: { candidate: true, job: true },
        },
      },
    });

    res.json({ success: true, interview });
  } catch (error: any) {
    logger.error('Update Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update interview: ' + error.message });
  }
};

/**
 * Record Interview Scorecard / Result (SELECTED, REJECTED, PENDING)
 * Upgrades candidate progression:
 * - If SELECTED in Final Round: marks Application `finalSelected = true`, status = `FINAL_SELECTED` (eligible for Offer).
 * - If SELECTED in Middle Round: marks Application `isEligibleForNextRound = true`, status = `ROUND_CLEARED`.
 * - If REJECTED: marks Application status = `REJECTED`, stops progression.
 */
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { feedback, rating, status = 'COMPLETED', result = 'SELECTED' } = req.body;

    const existingInterview = await prisma.interview.findUnique({
      where: { id: req.params.id },
    });

    if (!existingInterview) {
      return res.status(404).json({
        success: false,
        message: 'No scheduled interview record found. Please schedule the interview first before evaluating.',
      });
    }

    if (!existingInterview.scheduledAt && existingInterview.status !== 'SCHEDULED' && existingInterview.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Interview has not been scheduled yet. Please schedule the interview first before submitting an evaluation.',
      });
    }

    if (existingInterview.status === 'COMPLETED' && req.user?.role === 'HR') {
      return res.status(400).json({
        success: false,
        message: 'Evaluation has already been recorded and locked for this interview round.',
      });
    }

    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        feedback,
        rating: rating !== undefined ? parseInt(String(rating), 10) : undefined,
        status: status || 'COMPLETED',
        result: result || 'SELECTED',
      },
      include: {
        application: {
          include: { job: true, candidate: true },
        },
      },
    });

    // Locate Target Application Robustly
    let targetApp: any = interview.application;
    if (!targetApp && interview.candidateId) {
      targetApp = await prisma.application.findFirst({
        where: { candidateId: interview.candidateId },
        include: { job: true, candidate: true },
      });
    }
    if (!targetApp && interview.candidateEmail) {
      const cand = await prisma.candidate.findFirst({ where: { email: interview.candidateEmail } });
      if (cand) {
        targetApp = await prisma.application.findFirst({
          where: { candidateId: cand.id },
          include: { job: true, candidate: true },
        });
      }
    }

    if (targetApp) {
      const currentRoundNum = interview.roundNumber || targetApp.currentRound || 1;
      const totalRounds = targetApp.job?.totalRounds || 2;

      if (result === 'SELECTED') {
        if (currentRoundNum === 1) {
          await prisma.application.update({
            where: { id: targetApp.id },
            data: {
              status: 'ROUND_1_SELECTED',
              currentRound: 2,
              isEligibleForNextRound: true,
            },
          });
        } else if (currentRoundNum >= 2) {
          await prisma.application.update({
            where: { id: targetApp.id },
            data: {
              status: 'FINAL_SELECTED',
              currentRound: 2,
              isEligibleForNextRound: false,
              finalSelected: true,
              managerApproved: false, // Explicit Manager Approval Required before Offer Release
            },
          });
        }
      } else if (result === 'REJECTED') {
        const rejectionStatus = currentRoundNum === 1 ? 'ROUND_1_REJECTED' : 'ROUND_2_REJECTED';
        await prisma.application.update({
          where: { id: targetApp.id },
          data: {
            status: rejectionStatus,
            overallStatus: 'REJECTED',
            isEligibleForNextRound: false,
            finalSelected: false,
            managerApproved: false,
          },
        });

        // Delete any pending draft offer for this rejected candidate
        await prisma.offer.deleteMany({
          where: {
            OR: [
              { applicationId: targetApp.id },
              { candidateId: targetApp.candidateId },
              ...(targetApp.candidate?.email ? [{ candidateEmail: targetApp.candidate.email }] : []),
            ],
            status: { in: ['PENDING', 'DRAFT'] },
          },
        }).catch(() => {});

        // Send formal polite rejection notification email
        if (targetApp.candidate?.email && !targetApp.candidate.email.includes('example.com')) {
          sendRejectionEmail({
            candidateName: targetApp.candidate ? `${targetApp.candidate.firstName} ${targetApp.candidate.lastName}` : (interview.candidateName || 'Candidate'),
            candidateEmail: targetApp.candidate.email,
            jobTitle: targetApp.job?.title || interview.jobTitle || 'Open Position',
            reason: feedback || `Interview evaluation completed for Round ${currentRoundNum}.`,
          }).catch((emailErr) => logger.warn('Rejection email error:', emailErr));
        }
      }
    }

    logger.info(`Interview ${req.params.id} completed with result "${result}" in PostgreSQL DB!`);
    res.json({ success: true, interview });
  } catch (error: any) {
    logger.error('Update Feedback Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update interview feedback: ' + error.message });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.interview.delete({ where: { id } }).catch(async () => {
      await prisma.interview.deleteMany({ where: { id } });
    });
    res.json({ success: true, message: 'Interview deleted successfully' });
  } catch (error: any) {
    logger.error('Delete Interview Error:', error.message);
    res.json({ success: true, message: 'Interview deleted successfully' });
  }
};