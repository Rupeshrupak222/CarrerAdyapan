import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendInterviewScheduledEmail } from '../services/emailService.js';

// Create Interview
export const createInterview = async (req, res) => {
  try {
    const { id, candidateName, candidateEmail, jobTitle, candidateId, jobId, applicationId, type, scheduledAt, duration, location, meetingLink, notes, status } = req.body;

    const targetId = id || `int-${Date.now()}`;

    const interview = await prisma.interview.upsert({
      where: { id: targetId },
      update: {
        candidateName,
        candidateEmail,
        jobTitle,
        candidateId: candidateId || undefined,
        jobId: jobId || undefined,
        type: type || 'VIDEO',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        duration: duration ? parseInt(duration) : 30,
        location,
        meetingLink,
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
        type: type || 'VIDEO',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        duration: duration ? parseInt(duration) : 30,
        location,
        meetingLink,
        notes,
        status: status || 'SCHEDULED',
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    const targetEmail = candidateEmail || interview?.application?.candidate?.email;
    const targetName = candidateName || (interview?.application?.candidate ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}` : 'Candidate');
    const targetJob = jobTitle || interview?.application?.job?.title || 'Business Development Associate (BDA)';
    const targetCandId = candidateId || interview?.candidateId || interview?.application?.candidateId;

    if (targetCandId) {
      const updatedCandStatus = status === 'COMPLETED' ? 'INTERVIEWED' : 'SCHEDULED';
      await prisma.application.updateMany({
        where: { candidateId: targetCandId },
        data: { status: updatedCandStatus },
      }).catch(() => { });
    }

    if (targetEmail && (interview.status === 'SCHEDULED' || status === 'SCHEDULED')) {
      sendInterviewScheduledEmail({
        candidateName: targetName,
        candidateEmail: targetEmail,
        jobTitle: targetJob,
        scheduledAt: scheduledAt || new Date().toISOString(),
        meetingLink: meetingLink || 'https://meet.google.com/adyapan-interview',
      }).catch((err) => logger.error('Async Resend Interview Email Error:', err));
    }

    res.status(201).json({ success: true, interview });
  } catch (error) {
    logger.error('Create Interview Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create interview: ' + error.message });
  }
};

// Get All Interviews
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    }).catch((e) => {
      logger.warn('Interviews findMany pooler warning: ' + (e?.message || String(e)));
      return [];
    });

    res.json({ success: true, interviews });
  } catch (error) {
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
  } catch (error) {
    logger.error('Get Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch interview: ' + error.message });
  }
};

// Update Interview
export const updateInterview = async (req, res) => {
  try {
    const { status, feedback, rating, notes, scheduledAt, type, meetingLink, candidateName, candidateEmail, jobTitle, candidateId, jobId } = req.body;

    const updateData = {};
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

    let interview = await prisma.interview.findUnique({ where: { id: req.params.id } }).catch(() => null);

    if (interview) {
      interview = await prisma.interview.update({
        where: { id: req.params.id },
        data: updateData,
      });
    } else {
      interview = await prisma.interview.create({
        data: {
          id: req.params.id,
          candidateName: candidateName || 'Candidate',
          candidateEmail: candidateEmail || '',
          jobTitle: jobTitle || 'Business Development Associate (BDA)',
          candidateId: candidateId || null,
          jobId: jobId || null,
          type: type || 'VIDEO',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
          status: status || 'COMPLETED',
          feedback,
          rating,
          notes,
        },
      });
    }

    logger.info(`Interview ${req.params.id} updated in PostgreSQL DB! Status: ${interview.status}`);
    res.json({ success: true, interview });
  } catch (error) {
    logger.error('Update Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update interview: ' + error.message });
  }
};

// Update Interview Feedback / Complete Interview
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { feedback, rating, status } = req.body;

    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        feedback,
        rating,
        status: status || 'COMPLETED',
      },
    });

    if (interview.candidateId) {
      await prisma.application.updateMany({
        where: { candidateId: interview.candidateId },
        data: { status: 'INTERVIEWED' },
      }).catch(() => { });
    }

    logger.info(`Interview ${req.params.id} marked as COMPLETED in PostgreSQL DB!`);
    res.json({ success: true, interview });
  } catch (error) {
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
  } catch (error) {
    logger.error('Delete Interview Error:', error.message);
    res.json({ success: true, message: 'Interview deleted successfully' });
  }
};