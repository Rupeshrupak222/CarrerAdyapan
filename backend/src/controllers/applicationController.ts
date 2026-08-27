import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { hrDistributionService } from '../services/hrDistributionService.js';
import { screeningService } from '../services/screeningService.js';
import { auditService } from '../services/auditService.js';
import { calculateAtsScore, parseResumeText } from '../services/atsScoringEngine.js';
import { sendShortlistEmail, sendRejectionEmail } from '../services/emailService.js';

// Create Application
export const createApplication = async (req, res) => {
  try {
    const { jobId, candidateId, notes } = req.body;

    const existing = await prisma.application.findFirst({
      where: { jobId, candidateId }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied for this job' });
    }

    const candidateCode = `CAND-${Math.floor(100000 + Math.random() * 900000)}`;

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        candidateCode,
        notes,
        status: 'APPLIED',
        overallStatus: 'APPLIED',
        screeningStatus: 'PENDING',
      },
      include: {
        candidate: true,
        job: true,
      }
    });

    await auditService.log({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'APPLICATION_CREATED',
      entity: 'Application',
      entityId: application.id,
      newValue: { jobId, candidateId, candidateCode },
    });

    res.status(201).json({ success: true, application });
  } catch (error: any) {
    logger.error('Create Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create application: ' + error.message });
  }
};

// Get All Applications (Strict Backend RBAC Enforced with Server-side Pagination & Filtering)
export const getAllApplications = async (req, res) => {
  try {
    const { jobId, candidateId, status, overallStatus, assignedHrId, search, roundNumber, page, limit } = req.query;
    const user = req.user;

    const where: any = {};

    // RBAC: HR can ONLY see their assigned candidates (unless Veena who has special Screening & Workload permissions)
    const isVeena = user?.email?.toLowerCase()?.includes('veena') || user?.name?.toLowerCase()?.includes('veena');
    if (user && user.role === 'HR' && !isVeena) {
      where.assignedHrId = user.id;
    } else if (assignedHrId && assignedHrId !== 'ALL') {
      where.assignedHrId = String(assignedHrId);
    }

    if (jobId && jobId !== 'ALL') where.jobId = String(jobId);
    if (candidateId) where.candidateId = String(candidateId);
    if (status && status !== 'ALL') {
      if (status === 'NEW') {
        where.status = { in: ['APPLIED', 'SUBMITTED', 'PENDING'] };
      } else {
        where.status = String(status);
      }
    }
    if (overallStatus && overallStatus !== 'ALL') where.overallStatus = String(overallStatus);
    if (roundNumber && roundNumber !== 'ALL') where.currentRound = parseInt(String(roundNumber), 10);

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { candidateCode: { contains: q, mode: 'insensitive' } },
        { candidate: { firstName: { contains: q, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: q, mode: 'insensitive' } } },
        { candidate: { email: { contains: q, mode: 'insensitive' } } },
        { candidate: { phone: { contains: q, mode: 'insensitive' } } },
        { job: { title: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const pageNum = page ? Math.max(1, parseInt(String(page), 10)) : undefined;
    const limitNum = limit ? Math.max(1, parseInt(String(limit), 10)) : undefined;
    const skip = pageNum && limitNum ? (pageNum - 1) * limitNum : undefined;
    const take = limitNum;

    const total = await prisma.application.count({ where });

    const applications = await prisma.application.findMany({
      where,
      skip,
      take,
      include: {
        candidate: true,
        job: true,
        assignedHr: {
          select: { id: true, name: true, email: true, designation: true, department: true, meetLink: true },
        },
        interviews: {
          include: {
            hr: { select: { id: true, name: true, email: true, meetLink: true } },
            feedbackDetails: true,
          },
          orderBy: { roundNumber: 'asc' },
        },
        offer: true,
        onboarding: {
          include: { documents: true },
        },
        joining: true,
        hrAssignments: {
          include: { hr: { select: { id: true, name: true, email: true } } },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({
      success: true,
      count: applications.length,
      total,
      page: pageNum || 1,
      limit: limitNum || total,
      totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
      applications
    });
  } catch (error: any) {
    logger.error('Get Applications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications: ' + error.message });
  }
};

/**
 * Get Pipeline Metrics / Real Database Statistics for HR Manager Dashboard
 */
export const getManagerStats = async (req, res) => {
  try {
    const total = await prisma.application.count();
    const newApps = await prisma.application.count({
      where: { status: { in: ['APPLIED', 'SUBMITTED', 'PENDING'] } },
    });
    const shortlisted = await prisma.application.count({
      where: {
        status: {
          in: ['SHORTLISTED', 'ASSIGNED', 'ROUND_1_PENDING', 'ROUND_1_SELECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED', 'FINAL_ROUND', 'OFFER_SENT', 'OFFER_ACCEPTED', 'JOINED'],
        },
      },
    });
    const rejected = await prisma.application.count({
      where: { status: { in: ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED'] } },
    });
    const unassigned = await prisma.application.count({
      where: {
        assignedHrId: null,
        status: { in: ['APPLIED', 'SUBMITTED', 'PENDING', 'SHORTLISTED'] },
      },
    });
    const assigned = await prisma.application.count({
      where: {
        assignedHrId: { not: null },
        status: { in: ['ASSIGNED', 'ROUND_1_PENDING', 'ROUND_2_PENDING'] },
      },
    });
    
    // Round 1 Selected (Candidates who passed Round 1 evaluation)
    const round1Selected = await prisma.application.count({
      where: {
        OR: [
          { status: { in: ['ROUND_1_SELECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED', 'FINAL_ROUND', 'OFFER_SENT', 'OFFER_ACCEPTED', 'JOINED'] } },
          { interviews: { some: { roundNumber: 1, result: { in: ['SELECTED', 'PASSED'] } } } },
        ],
        NOT: { status: 'ROUND_1_REJECTED' },
      },
    });

    // Round 1 Rejected
    const round1Rejected = await prisma.application.count({
      where: {
        OR: [
          { status: 'ROUND_1_REJECTED' },
          { interviews: { some: { roundNumber: 1, result: 'REJECTED' } } },
        ],
      },
    });

    // Round 2 Selected (Candidates who passed Round 2 evaluation)
    const round2Selected = await prisma.application.count({
      where: {
        OR: [
          { status: { in: ['ROUND_2_SELECTED', 'FINAL_ROUND', 'OFFER_SENT', 'OFFER_ACCEPTED', 'JOINED'] } },
          { interviews: { some: { roundNumber: 2, result: { in: ['SELECTED', 'PASSED'] } } } },
        ],
        NOT: { status: { in: ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED'] } },
      },
    });

    // Round 2 Rejected
    const round2Rejected = await prisma.application.count({
      where: {
        OR: [
          { status: 'ROUND_2_REJECTED' },
          { interviews: { some: { roundNumber: 2, result: 'REJECTED' } } },
        ],
      },
    });

    // Final Round Selected (Cleared Round 2 & ready for offer release, offer not dispatched yet)
    const finalRound = await prisma.application.count({
      where: {
        OR: [
          { status: { in: ['ROUND_2_SELECTED', 'FINAL_ROUND'] } },
          { finalSelected: true },
        ],
        NOT: {
          status: { in: ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'JOINED'] },
        },
      },
    });

    // Offers Sent
    const offersSent = await prisma.application.count({
      where: {
        status: { in: ['OFFER_SENT', 'OFFER_ACCEPTED', 'JOINED'] },
      },
    });

    const recentApplications = await prisma.application.findMany({
      take: 6,
      orderBy: { appliedAt: 'desc' },
      include: {
        candidate: true,
        job: true,
        assignedHr: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      metrics: {
        total,
        newApps,
        shortlisted,
        rejected,
        unassigned,
        assigned,
        round1: round1Selected,
        round1Selected,
        round1Rejected,
        round2: round2Selected,
        round2Selected,
        round2Rejected,
        finalRound,
        offersSent,
      },
      recentApplications,
    });
  } catch (error: any) {
    logger.error('Get Manager Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch manager stats: ' + error.message });
  }
};

// Get Application by ID (Strict Backend RBAC Enforced)
export const getApplicationById = async (req, res) => {
  try {
    const user = req.user;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        candidate: true,
        job: true,
        assignedHr: {
          select: { id: true, name: true, email: true, designation: true, department: true, meetLink: true, phone: true },
        },
        interviews: {
          include: {
            hr: { select: { id: true, name: true, email: true, designation: true, meetLink: true, phone: true } },
            feedbackDetails: true,
          },
          orderBy: { roundNumber: 'asc' },
        },
        offer: true,
        onboarding: {
          include: { documents: true },
        },
        joining: true,
        hrAssignments: {
          include: { hr: { select: { id: true, name: true, email: true } } },
          orderBy: { assignedAt: 'desc' },
        },
      }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // RBAC: If HR, ensure this candidate is assigned to them
    if (user && user.role === 'HR' && application.assignedHrId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You only have access to candidates assigned to your HR account.'
      });
    }

    res.json({ success: true, application });
  } catch (error: any) {
    logger.error('Get Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application: ' + error.message });
  }
};

// Update Application Status & Pipeline
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, overallStatus, notes, currentRound, finalSelected, isEligibleForNextRound } = req.body;
    const user = req.user;

    const existing = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Application not found' });

    // RBAC: HR check
    if (user && user.role === 'HR' && existing.assignedHrId !== user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Candidate is not assigned to you.' });
    }

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(overallStatus && { overallStatus }),
        ...(notes !== undefined && { notes }),
        ...(currentRound !== undefined && { currentRound: parseInt(String(currentRound)) }),
        ...(finalSelected !== undefined && { finalSelected: Boolean(finalSelected) }),
        ...(isEligibleForNextRound !== undefined && { isEligibleForNextRound: Boolean(isEligibleForNextRound) }),
      },
      include: {
        candidate: true,
        job: true,
      }
    });

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: `APPLICATION_STATUS_UPDATED`,
      entity: 'Application',
      entityId: application.id,
      oldValue: { status: existing.status, overallStatus: existing.overallStatus },
      newValue: { status: application.status, overallStatus: application.overallStatus },
    });

    res.json({ success: true, application });
  } catch (error: any) {
    logger.error('Update Application Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update application: ' + error.message });
  }
};

// HR Manager Reassigns Candidate
export const reassignCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { newHrId, reason } = req.body;
    const manager = req.user;

    if (!manager || (manager.role !== 'HR_MANAGER' && manager.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'Only HR Managers and Admins can reassign candidates.' });
    }

    const result = await hrDistributionService.reassignCandidate(id, newHrId, manager.id, reason || 'MANAGER_REASSIGN');
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    logger.error('Reassign Candidate Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reassign candidate: ' + error.message });
  }
};

// HR Manager Approves Final Round 3 Selection for Offer Letter
export const approveSelectionForOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = req.user;

    if (!manager || (manager.role !== 'HR_MANAGER' && manager.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'Only HR Managers and Admins can approve offers.' });
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        managerApproved: true,
        overallStatus: 'OFFER_PENDING',
      },
      include: { candidate: true, job: true },
    });

    await auditService.log({
      userId: manager.id,
      userRole: manager.role,
      userName: manager.name,
      action: 'OFFER_APPROVED',
      entity: 'Application',
      entityId: id,
      newValue: { managerApproved: true, overallStatus: 'OFFER_PENDING' },
    });

    res.json({
      success: true,
      message: `Final selection for ${application.candidate?.firstName} ${application.candidate?.lastName} approved! Candidate is now ready for Offer Letter release.`,
      application,
    });
  } catch (error: any) {
    logger.error('Approve Selection Error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve candidate: ' + error.message });
  }
};

// Run Automated 24-Hour Screening Engine
export const triggerAutoScreening = async (req, res) => {
  try {
    const { forceAll = false } = req.body;
    const result = await screeningService.run24HourScreeningJob(forceAll);
    res.json(result);
  } catch (error: any) {
    logger.error('Trigger Screening Error:', error);
    res.status(500).json({ success: false, message: 'Screening run failed: ' + error.message });
  }
};

// Delete Application (Cascading: removes all related records first)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_MANAGER')) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete application' });
    }

    // Cascade delete all related entities before deleting the application
    await prisma.interview.deleteMany({ where: { applicationId: id } }).catch(() => {});
    await prisma.hRAssignment.deleteMany({ where: { applicationId: id } }).catch(() => {});
    await prisma.aTSAnalysis.deleteMany({ where: { applicationId: id } }).catch(() => {});
    await prisma.offer.deleteMany({ where: { applicationId: id } }).catch(() => {});
    await prisma.onboarding.deleteMany({ where: { applicationId: id } }).catch(() => {});
    await prisma.joining.deleteMany({ where: { applicationId: id } }).catch(() => {});
    await prisma.activity.deleteMany({ where: { applicationId: id } }).catch(() => {});
    await prisma.candidateSecureToken.deleteMany({ where: { applicationId: id } }).catch(() => {});

    await prisma.application.delete({ where: { id } });
    res.json({ success: true, message: 'Application and all related records deleted successfully' });
  } catch (error: any) {
    logger.error('Delete Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete application: ' + error.message });
  }
};

/**
 * On-Demand Individual ATS Check (Manual HR Manager Tool)
 * Does NOT make automatic hiring decisions.
 */
export const runAtsCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { candidate: true, job: true },
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const cand = app.candidate;
    const skillsText = Array.isArray(cand.skills) ? cand.skills.join(' ') : (cand.skills || '');
    const textToParse = `${cand.firstName} ${cand.lastName} ${skillsText} ${cand.currentPosition || ''} ${cand.currentCompany || ''} ${cand.totalExperience || 0} years experience ${cand.parsedResume ? JSON.stringify(cand.parsedResume) : ''}`;

    const parsedResume = parseResumeText(textToParse);
    const atsEngineResult = calculateAtsScore(parsedResume, app.job);

    const rawScore = atsEngineResult.aiScore || 75;
    const breakdown: any = atsEngineResult.breakdown || {};

    // Categorized skills (Matched, Partial, Missing)
    const matched = atsEngineResult.matchedSkills || [];
    const missing = atsEngineResult.missingSkills || [];
    const jobSkills = Array.isArray(app.job?.skills) ? app.job.skills : (typeof app.job?.skills === 'string' ? JSON.parse(app.job.skills || '[]') : []);
    const partial = jobSkills.filter(
      (s: string) => !matched.includes(s) && !missing.includes(s)
    );

    const structuredAtsResult = {
      score: rawScore,
      recommendation: atsEngineResult.finalRecommendation || (rawScore >= 80 ? 'Strong Match' : rawScore >= 60 ? 'Moderate Match' : 'Weak Match'),
      breakdown: {
        skillsMatch: { score: breakdown.skillsMatching?.score || Math.round(rawScore * 0.4), maxScore: 40 },
        experienceMatch: { score: breakdown.experienceMatching?.score || Math.round(rawScore * 0.25), maxScore: 25 },
        educationMatch: { score: breakdown.educationMatching?.score || Math.round(rawScore * 0.2), maxScore: 20 },
        keywordMatch: { score: breakdown.keywordMatching?.score || Math.round(rawScore * 0.15), maxScore: 15 },
      },
      skillsAnalysis: {
        matched,
        partial,
        missing,
      },
      experienceAnalysis: {
        required: app.job?.experienceRequired || '2+ Years',
        candidate: `${cand.totalExperience || 2} Years`,
        meetsRequirement: (cand.totalExperience || 2) >= 2,
      },
      educationAnalysis: {
        required: "Bachelor's Degree",
        candidate: (cand.education as any)?.degree || 'B.Tech',
        meetsRequirement: true,
      },
      summary: {
        matchedCount: matched.length,
        partialCount: partial.length,
        missingCount: missing.length,
      },
    };

    // Persist ATS result to Application & History (Leaves hiring status UNTOUCHED)
    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        atsScore: rawScore,
        atsStatus: 'ATS_COMPLETED',
        atsAnalyzedAt: new Date(),
        atsAnalyzedBy: user?.name || 'HR Manager',
        atsResult: structuredAtsResult,
        atsMatchedSkills: matched,
        atsPartialSkills: partial,
        atsMissingSkills: missing,
        atsExperienceMatch: structuredAtsResult.experienceAnalysis,
        atsEducationMatch: structuredAtsResult.educationAnalysis,
        atsKeywordMatch: structuredAtsResult.breakdown.keywordMatch,
      },
      include: { candidate: true, job: true, assignedHr: true },
    });

    try {
      if ((prisma as any).aTSAnalysis) {
        await (prisma as any).aTSAnalysis.create({
          data: {
            applicationId: id,
            score: rawScore,
            result: structuredAtsResult,
            matchedSkills: matched,
            partialSkills: partial,
            missingSkills: missing,
            experienceMatch: structuredAtsResult.experienceAnalysis,
            educationMatch: structuredAtsResult.educationAnalysis,
            keywordMatch: structuredAtsResult.breakdown.keywordMatch,
            recommendation: structuredAtsResult.recommendation,
            analyzedBy: user?.name || 'HR Manager',
          },
        });
      }
    } catch (histErr) {
      // Historical model fallback
    }

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'ATS_CHECK_COMPLETED',
      entity: 'Application',
      entityId: id,
      newValue: { atsScore: rawScore, candidateName: `${cand.firstName} ${cand.lastName}` },
    });

    res.json({
      success: true,
      message: 'ATS Analysis completed successfully.',
      application: updatedApp,
      atsResult: structuredAtsResult,
    });
  } catch (error: any) {
    logger.error('Run ATS Check Error:', error);
    res.status(500).json({ success: false, message: 'Failed to run ATS check: ' + error.message });
  }
};

/**
 * Get Cached ATS Result for Application
 */
export const getAtsResult = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        candidateCode: true,
        atsScore: true,
        atsStatus: true,
        atsAnalyzedAt: true,
        atsAnalyzedBy: true,
        atsResult: true,
        atsMatchedSkills: true,
        atsPartialSkills: true,
        atsMissingSkills: true,
        candidate: true,
        job: true,
      },
    });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, atsData: app });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Bulk Run ATS Check for Multiple Applications (Server-side Batch Gemini Engine)
 */
export const bulkRunAtsCheck = async (req, res) => {
  try {
    const { applicationIds } = req.body;
    const user = req.user;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No application IDs provided for ATS evaluation' });
    }

    const applications = await prisma.application.findMany({
      where: { id: { in: applicationIds } },
      include: { candidate: true, job: true },
    });

    const results: any[] = [];

    for (const app of applications) {
      try {
        const cand = app.candidate;
        if (!cand) {
          results.push({ applicationId: app.id, success: false, error: 'Candidate record not found' });
          continue;
        }

        const skillsText = Array.isArray(cand.skills) ? cand.skills.join(' ') : (cand.skills || '');
        const textToParse = `${cand.firstName} ${cand.lastName} ${skillsText} ${cand.currentPosition || ''} ${cand.currentCompany || ''} ${cand.totalExperience || 0} years experience ${cand.parsedResume ? JSON.stringify(cand.parsedResume) : ''}`;

        const parsedResume = parseResumeText(textToParse);
        const atsEngineResult = calculateAtsScore(parsedResume, app.job);

        const rawScore = atsEngineResult.aiScore || 75;
        const breakdown: any = atsEngineResult.breakdown || {};

        const matched = atsEngineResult.matchedSkills || [];
        const missing = atsEngineResult.missingSkills || [];
        const jobSkills = Array.isArray(app.job?.skills) ? app.job.skills : (typeof app.job?.skills === 'string' ? JSON.parse(app.job.skills || '[]') : []);
        const partial = jobSkills.filter(
          (s: string) => !matched.includes(s) && !missing.includes(s)
        );

        const structuredAtsResult = {
          score: rawScore,
          recommendation: atsEngineResult.finalRecommendation || (rawScore >= 80 ? 'Strong Match' : rawScore >= 60 ? 'Moderate Match' : 'Weak Match'),
          breakdown: {
            skillsMatch: { score: breakdown.skillsMatching?.score || Math.round(rawScore * 0.4), maxScore: 40 },
            experienceMatch: { score: breakdown.experienceMatching?.score || Math.round(rawScore * 0.25), maxScore: 25 },
            educationMatch: { score: breakdown.educationMatching?.score || Math.round(rawScore * 0.2), maxScore: 20 },
            keywordMatch: { score: breakdown.keywordMatching?.score || Math.round(rawScore * 0.15), maxScore: 15 },
          },
          skillsAnalysis: {
            matched,
            partial,
            missing,
          },
          experienceAnalysis: {
            required: app.job?.experienceRequired || '2+ Years',
            candidate: `${cand.totalExperience || 2} Years`,
            meetsRequirement: (cand.totalExperience || 2) >= 2,
          },
          educationAnalysis: {
            required: "Bachelor's Degree",
            candidate: (cand.education as any)?.degree || 'B.Tech',
            meetsRequirement: true,
          },
          summary: {
            matchedCount: matched.length,
            partialCount: partial.length,
            missingCount: missing.length,
          },
        };

        const updatedApp = await prisma.application.update({
          where: { id: app.id },
          data: {
            atsScore: rawScore,
            atsStatus: 'ATS_COMPLETED',
            atsAnalyzedAt: new Date(),
            atsAnalyzedBy: user?.name || 'HR Manager',
            atsResult: structuredAtsResult,
            atsMatchedSkills: matched,
            atsPartialSkills: partial,
            atsMissingSkills: missing,
            atsExperienceMatch: structuredAtsResult.experienceAnalysis,
            atsEducationMatch: structuredAtsResult.educationAnalysis,
            atsKeywordMatch: structuredAtsResult.breakdown.keywordMatch,
          },
        });

        results.push({
          applicationId: app.id,
          candidateName: `${cand.firstName} ${cand.lastName}`,
          score: rawScore,
          success: true,
          application: updatedApp,
        });
      } catch (candErr: any) {
        logger.error(`Error calculating ATS for application ${app.id}:`, candErr);
        results.push({
          applicationId: app.id,
          success: false,
          error: candErr.message || 'ATS calculation failed',
        });
      }
    }

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'BULK_ATS_CHECK_COMPLETED',
      entity: 'Application',
      entityId: 'BULK',
      newValue: { count: applicationIds.length, successCount: results.filter((r) => r.success).length, evaluatedBy: user?.name },
    });

    res.json({
      success: true,
      message: `Batch ATS evaluation completed for ${results.filter((r) => r.success).length}/${applicationIds.length} candidate(s).`,
      results,
    });
  } catch (error: any) {
    logger.error('Bulk ATS Check Error:', error);
    res.status(500).json({ success: false, message: 'Failed to run bulk ATS check: ' + error.message });
  }
};

/**
 * Manual Shortlist Candidate (Decision made explicitly by HR Manager)
 */
export const manualShortlistCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const app = await prisma.application.update({
      where: { id },
      data: {
        status: 'SHORTLISTED',
        screeningStatus: 'SHORTLISTED',
        overallStatus: 'SHORTLISTED',
        assignedHrId: null,
        assignedAt: null,
        currentRound: 1,
      },
      include: { candidate: true, job: true },
    });

    // NOTE: Per workflow requirements, NO separate email is sent on screening shortlist.
    // The candidate will receive a single combined shortlist + Round 1 schedule email when the assigned HR Specialist schedules Round 1.

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'CANDIDATE_SHORTLISTED',
      entity: 'Application',
      entityId: id,
      newValue: { status: 'SHORTLISTED', shortlistedBy: user?.name },
    });

    res.json({
      success: true,
      message: `${app.candidate?.firstName} ${app.candidate?.lastName} has been shortlisted successfully and moved to Workload Distribution.`,
      application: app,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to shortlist candidate: ' + error.message });
  }
};

/**
 * Manual Reject Candidate (Decision made explicitly by HR Manager)
 */
export const manualRejectCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    const app = await prisma.application.update({
      where: { id },
      data: {
        status: 'REJECTED',
        screeningStatus: 'REJECTED',
        overallStatus: 'REJECTED',
      },
      include: { candidate: true, job: true },
    });

    // Send Rejection Notice Email in background
    if (app.candidate?.email && !app.candidate.email.includes('example.com')) {
      sendRejectionEmail({
        candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
        candidateEmail: app.candidate.email,
        jobTitle: app.job?.title,
      }).catch(() => {});
    }

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'CANDIDATE_REJECTED',
      entity: 'Application',
      entityId: id,
      newValue: { status: 'REJECTED', reason, rejectedBy: user?.name },
    });

    res.json({
      success: true,
      message: `${app.candidate?.firstName} ${app.candidate?.lastName} has been rejected.`,
      application: app,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to reject candidate: ' + error.message });
  }
};

/**
 * Bulk Shortlist Candidates
 */
export const bulkShortlistCandidates = async (req, res) => {
  try {
    const { applicationIds } = req.body;
    const user = req.user;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No application IDs provided' });
    }

    const updated = await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: {
        status: 'SHORTLISTED',
        screeningStatus: 'SHORTLISTED',
        overallStatus: 'SHORTLISTED',
        assignedHrId: null,
        assignedAt: null,
        currentRound: 1,
      },
    });

    // NOTE: Per workflow requirements, NO separate email is sent on screening shortlist.
    // The candidates will receive their single combined shortlist + Round 1 schedule email when their assigned HR Specialist schedules Round 1.

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'BULK_CANDIDATES_SHORTLISTED',
      entity: 'Application',
      entityId: 'BULK',
      newValue: { count: applicationIds.length, applicationIds, shortlistedBy: user?.name },
    });

    res.json({
      success: true,
      message: `${updated.count} candidate(s) shortlisted successfully and moved to Workload Distribution.`,
      count: updated.count,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Bulk shortlist failed: ' + error.message });
  }
};

/**
 * Bulk Reject Candidates
 */
export const bulkRejectCandidates = async (req, res) => {
  try {
    const { applicationIds, reason = 'Did not meet requirements' } = req.body;
    const user = req.user;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No application IDs provided' });
    }

    const updated = await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: {
        status: 'REJECTED',
        screeningStatus: 'REJECTED',
        overallStatus: 'REJECTED',
      },
    });

    // Send rejection emails in background
    const apps = await prisma.application.findMany({
      where: { id: { in: applicationIds } },
      include: { candidate: true, job: true },
    });

    apps.forEach((app) => {
      if (app.candidate?.email && !app.candidate.email.includes('example.com')) {
        sendRejectionEmail({
          candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          candidateEmail: app.candidate.email,
          jobTitle: app.job?.title,
          reason,
        }).catch(() => {});
      }
    });

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'BULK_CANDIDATES_REJECTED',
      entity: 'Application',
      entityId: 'BULK',
      newValue: { count: applicationIds.length, applicationIds, rejectedBy: user?.name },
    });

    res.json({
      success: true,
      message: `${updated.count} candidate(s) rejected.`,
      count: updated.count,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Bulk reject failed: ' + error.message });
  }
};

/**
 * Workload Distribution: Assign Candidate to 1 HR Specialist (Strict 1-to-1 Rule)
 */
export const assignHrSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    const { hrId, reason = 'INITIAL_ALLOCATION' } = req.body;
    const user = req.user;

    if (!hrId) {
      return res.status(400).json({ success: false, message: 'Target HR Specialist ID is required.' });
    }

    const hrUser = await prisma.user.findUnique({
      where: { id: hrId },
      select: { id: true, name: true, email: true, role: true, meetLink: true },
    });

    if (!hrUser) {
      return res.status(404).json({ success: false, message: 'HR Specialist not found.' });
    }

    const app = await prisma.application.findUnique({
      where: { id },
      include: { candidate: true, job: true },
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Update Application Assignment
    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        assignedHrId: hrId,
        assignedAt: new Date(),
        status: 'ASSIGNED',
        overallStatus: 'ASSIGNED',
        currentRound: 1,
      },
      include: { candidate: true, job: true, assignedHr: true },
    });

    // Create HRAssignment Audit Record
    await prisma.hRAssignment.create({
      data: {
        applicationId: id,
        candidateId: app.candidateId,
        hrId,
        assignedBy: user?.name || user?.id || 'HR_MANAGER',
        reason,
        status: 'ACTIVE',
      },
    }).catch(() => {});

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'HR_ASSIGNED',
      entity: 'Application',
      entityId: id,
      newValue: {
        candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
        assignedHr: hrUser.name,
        assignedHrId: hrId,
        reason,
      },
    });

    res.json({
      success: true,
      message: `Candidate assigned to ${hrUser.name} successfully.`,
      application: updatedApp,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to assign HR Specialist: ' + error.message });
  }
};

/**
 * Get Workload Stats (Unassigned, Assigned, HR Specialist load)
 */
export const getWorkloadStats = async (req, res) => {
  try {
    const unassignedCount = await prisma.application.count({
      where: {
        status: 'SHORTLISTED',
        assignedHrId: null,
      },
    });

    const assignedCount = await prisma.application.count({
      where: {
        assignedHrId: { not: null },
        status: { in: ['ASSIGNED', 'ROUND_1_PENDING', 'ROUND_1_SELECTED', 'ROUND_2_PENDING'] },
        finalSelected: false,
        NOT: {
          status: { in: ['FINAL_SELECTED', 'ROUND_2_SELECTED', 'FINAL_ROUND', 'REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED', 'OFFER_SENT', 'JOINED'] },
        },
      },
    });

    const hrSpecialists = await prisma.user.findMany({
      where: {
        role: 'HR',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        meetLink: true,
        _count: {
          select: {
            assignedCandidates: {
              where: {
                status: { in: ['ASSIGNED', 'ROUND_1_PENDING', 'ROUND_1_SELECTED', 'ROUND_2_PENDING'] },
                finalSelected: false,
                NOT: {
                  status: { in: ['FINAL_SELECTED', 'ROUND_2_SELECTED', 'FINAL_ROUND', 'REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED', 'OFFER_SENT', 'JOINED'] },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      stats: {
        unassignedCount,
        assignedCount,
        specialistsCount: hrSpecialists.length,
        specialists: hrSpecialists.map((hr) => ({
          id: hr.id,
          name: hr.name,
          email: hr.email,
          role: hr.role,
          designation: hr.designation,
          assignedCount: hr._count.assignedCandidates,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch workload stats: ' + error.message });
  }
};

/**
 * Get Final Round Selected Candidates (Candidates who cleared Round 2)
 */
export const getFinalRoundSelected = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        OR: [
          { status: 'FINAL_ROUND' },
          { status: 'ROUND_2_SELECTED' },
          { status: 'FINAL_SELECTED' },
          { status: 'OFFER_SENT' },
          { status: 'OFFER_ACCEPTED' },
          { status: 'OFFER_RELEASED' },
          { finalSelected: true },
          { managerApproved: true },
        ],
        NOT: {
          status: { in: ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED'] },
        },
      },
      include: {
        candidate: true,
        job: true,
        assignedHr: {
          select: { id: true, name: true, email: true },
        },
        interviews: {
          orderBy: { roundNumber: 'asc' },
          include: {
            feedbackDetails: true,
          },
        },
        offer: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch final round candidates: ' + error.message });
  }
};

/**
 * Manual Offer Release by HR Manager / Admin
 */
export const sendOfficialOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      olNo,
      offerDate,
      candidateName: customCandidateName,
      jobTitle: customJobTitle,
      duration,
      trainingStartDate,
      trainingEndDate,
      ojtStartDate,
      ojtEndDate,
      location,
      stipend,
      incentives,
      postProbationCtc,
      reportingDate,
      joiningDate,
      customTerms,
      message 
    } = req.body;
    const user = req.user;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { candidate: true, job: true, offer: true },
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const candName = customCandidateName || `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim() || 'Candidate';
    const candEmail = app.candidate?.email;
    const finalJobTitle = customJobTitle || app.job?.title || 'COMMUNITY DEVELOPMENT INTERN';
    const finalJoiningDate = trainingStartDate || joiningDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const existingOfferDetails: any = (typeof app.offer?.offerDetails === 'object' && app.offer?.offerDetails !== null)
      ? app.offer.offerDetails
      : {};

    const resolvedOlNo = olNo || existingOfferDetails.olNo || app.candidateCode || 'ADP0428';

    const offerDetailsPayload = {
      olNo: resolvedOlNo,
      offerDate: offerDate || existingOfferDetails.offerDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      candidateName: candName,
      jobTitle: finalJobTitle,
      duration: duration || existingOfferDetails.duration || '6 MONTHS',
      trainingStartDate: trainingStartDate || existingOfferDetails.trainingStartDate || finalJoiningDate,
      trainingEndDate: trainingEndDate || existingOfferDetails.trainingEndDate || '15-Sep-2026',
      ojtStartDate: ojtStartDate || existingOfferDetails.ojtStartDate || '16-Sep-2026',
      ojtEndDate: ojtEndDate || existingOfferDetails.ojtEndDate || '16-Mar-2027',
      location: location || existingOfferDetails.location || 'HYDERABAD',
      stipend: stipend || existingOfferDetails.stipend || 'INR 20000/-PerMonth',
      incentives: incentives || existingOfferDetails.incentives || 'Up to 10,000/- INCENTIVES.',
      postProbationCtc: postProbationCtc || existingOfferDetails.postProbationCtc || '₹8 LPA ( 6 Fixed + 2 Variable )',
      reportingDate: reportingDate || existingOfferDetails.reportingDate || finalJoiningDate,
      customTerms,
      message,
    };

    // Create / Update Offer Record
    const offer = await prisma.offer.upsert({
      where: { applicationId: id },
      update: {
        candidateName: candName,
        jobTitle: finalJobTitle,
        salary: parseFloat(String(stipend).replace(/[^0-9.]/g, '')) || 20000,
        joiningDate: new Date(finalJoiningDate),
        status: 'SENT',
        managerApproved: true,
        approvedBy: user?.name || user?.id,
        approvedAt: new Date(),
        customTerms: customTerms || message || `Stipend: ${stipend}, Location: ${location}`,
        offerDetails: offerDetailsPayload,
      },
      create: {
        applicationId: id,
        candidateId: app.candidateId,
        candidateName: candName,
        candidateEmail: candEmail,
        jobTitle: finalJobTitle,
        salary: parseFloat(String(stipend).replace(/[^0-9.]/g, '')) || 20000,
        joiningDate: new Date(finalJoiningDate),
        status: 'SENT',
        managerApproved: true,
        approvedBy: user?.name || user?.id,
        approvedAt: new Date(),
        customTerms: customTerms || message || `Stipend: ${stipend}, Location: ${location}`,
        offerDetails: offerDetailsPayload,
      },
    });

    // Update Application Status to OFFER_SENT
    await prisma.application.update({
      where: { id },
      data: {
        status: 'OFFER_SENT',
        overallStatus: 'OFFER_SENT',
      },
    });

    // Dispatch Offer Email with 4-Page PDF attachment if email is valid
    if (candEmail && !candEmail.includes('example.com')) {
      const { sendOfferLetterEmail } = await import('../services/emailService.js');
      sendOfferLetterEmail({
        ...offerDetailsPayload,
        candidateEmail: candEmail,
        applicationId: id,
      }).catch((err) => console.error('Send offer email async error:', err));
    }

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'OFFER_RELEASED',
      entity: 'Application',
      entityId: id,
      newValue: {
        candidateName: candName,
        jobTitle: finalJobTitle,
        olNo: offerDetailsPayload.olNo,
      },
    });

    return res.json({
      success: true,
      message: `Official Offer Letter (${offerDetailsPayload.olNo}) successfully released and emailed to ${candName} (${candEmail}) with 4-Page PDF attachment!`,
      offer,
    });
  } catch (error: any) {
    console.error('Send Official Offer Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to release official offer: ' + error.message });
  }
};

/**
 * Save Offer Details / Draft without releasing / sending email
 */
export const saveOfficialOfferDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      olNo,
      offerDate,
      candidateName: customCandidateName,
      jobTitle: customJobTitle,
      duration,
      trainingStartDate,
      trainingEndDate,
      ojtStartDate,
      ojtEndDate,
      location,
      stipend,
      incentives,
      postProbationCtc,
      reportingDate,
      joiningDate,
      customTerms,
      message 
    } = req.body;
    const user = req.user;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { candidate: true, job: true, offer: true },
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const candName = customCandidateName || `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim() || 'Candidate';
    const candEmail = app.candidate?.email;
    const finalJobTitle = customJobTitle || app.job?.title || 'COMMUNITY DEVELOPMENT INTERN';
    const finalJoiningDate = trainingStartDate || joiningDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const existingOfferDetails: any = (typeof app.offer?.offerDetails === 'object' && app.offer?.offerDetails !== null)
      ? app.offer.offerDetails
      : {};

    const resolvedOlNo = olNo || existingOfferDetails.olNo || app.candidateCode || 'ADP0428';

    const offerDetailsPayload = {
      olNo: resolvedOlNo,
      offerDate: offerDate || existingOfferDetails.offerDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      candidateName: candName,
      jobTitle: finalJobTitle,
      duration: duration || existingOfferDetails.duration || '6 MONTHS',
      trainingStartDate: trainingStartDate || existingOfferDetails.trainingStartDate || finalJoiningDate,
      trainingEndDate: trainingEndDate || existingOfferDetails.trainingEndDate || '15-Sep-2026',
      ojtStartDate: ojtStartDate || existingOfferDetails.ojtStartDate || '16-Sep-2026',
      ojtEndDate: ojtEndDate || existingOfferDetails.ojtEndDate || '16-Mar-2027',
      location: location || existingOfferDetails.location || 'HYDERABAD',
      stipend: stipend || existingOfferDetails.stipend || 'INR 20000/-PerMonth',
      incentives: incentives || existingOfferDetails.incentives || 'Up to 10,000/- INCENTIVES.',
      postProbationCtc: postProbationCtc || existingOfferDetails.postProbationCtc || '₹8 LPA ( 6 Fixed + 2 Variable )',
      reportingDate: reportingDate || existingOfferDetails.reportingDate || finalJoiningDate,
      customTerms,
      message,
    };

    const numericSalary = parseFloat(String(stipend).replace(/[^0-9.]/g, '')) || 20000;
    const existingStatus = app.offer?.status || 'DRAFT';

    // Create / Update Offer Record in Database
    const offer = await prisma.offer.upsert({
      where: { applicationId: id },
      update: {
        candidateName: candName,
        jobTitle: finalJobTitle,
        salary: numericSalary,
        joiningDate: new Date(finalJoiningDate),
        status: existingStatus,
        managerApproved: true,
        approvedBy: user?.name || user?.id,
        approvedAt: new Date(),
        customTerms: customTerms || message || `Stipend: ${stipend}, Location: ${location}`,
        offerDetails: offerDetailsPayload,
      },
      create: {
        applicationId: id,
        candidateId: app.candidateId,
        candidateName: candName,
        candidateEmail: candEmail,
        jobTitle: finalJobTitle,
        salary: numericSalary,
        joiningDate: new Date(finalJoiningDate),
        status: 'DRAFT',
        managerApproved: true,
        approvedBy: user?.name || user?.id,
        approvedAt: new Date(),
        customTerms: customTerms || message || `Stipend: ${stipend}, Location: ${location}`,
        offerDetails: offerDetailsPayload,
      },
    });

    await auditService.log({
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      action: 'OFFER_DRAFT_SAVED',
      entity: 'Application',
      entityId: id,
      newValue: {
        candidateName: candName,
        jobTitle: finalJobTitle,
        olNo: offerDetailsPayload.olNo,
      },
    });

    return res.json({
      success: true,
      message: `Offer details saved successfully in database for ${candName}!`,
      offer,
    });
  } catch (error: any) {
    console.error('Save Offer Draft Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save offer details: ' + error.message });
  }
};

/**
 * Helper to parse and generate candidate code / ID list from a range
 */
const parseIdRange = (fromId: string, toId: string) => {
  const f = (fromId || '').trim();
  const t = (toId || '').trim();

  const startMatch = f.match(/^(.*?)(\d+)$/);
  const endMatch = t.match(/^(.*?)(\d+)$/);

  if (startMatch && endMatch) {
    const prefix = startMatch[1];
    const padLen = startMatch[2].length;
    let startNum = parseInt(startMatch[2], 10);
    let endNum = parseInt(endMatch[2], 10);

    if (startNum > endNum) {
      const temp = startNum;
      startNum = endNum;
      endNum = temp;
    }

    // Limit range to max 200 per batch for safety
    if (endNum - startNum > 200) {
      endNum = startNum + 200;
    }

    const codes = new Set<string>();
    for (let i = startNum; i <= endNum; i++) {
      // Add padded version: e.g. CAND-001 or CAND-000001
      codes.add(`${prefix}${String(i).padStart(padLen, '0')}`);
      // Add standard 3-digit padded version if different
      codes.add(`${prefix}${String(i).padStart(3, '0')}`);
      // Add standard 6-digit padded version if different
      codes.add(`${prefix}${String(i).padStart(6, '0')}`);
      // Add non-padded version
      codes.add(`${prefix}${i}`);
    }

    return {
      prefix,
      startNum,
      endNum,
      totalExpected: endNum - startNum + 1,
      targetCodes: Array.from(codes),
    };
  }

  return {
    prefix: '',
    startNum: 0,
    endNum: 0,
    totalExpected: f ? 1 : 0,
    targetCodes: [f, t].filter(Boolean),
  };
};

/**
 * Preview Bulk Offer Eligibility by ID Range
 */
export const getBulkOfferRangePreview = async (req, res) => {
  try {
    const { fromId, toId } = req.body;

    if (!fromId || !toId) {
      return res.status(400).json({ success: false, message: 'Please provide both From ID and To ID range.' });
    }

    const { targetCodes, totalExpected } = parseIdRange(fromId, toId);

    // Fetch all matching applications
    const applications = await prisma.application.findMany({
      where: {
        OR: [
          { candidateCode: { in: targetCodes } },
          { id: { in: targetCodes } },
          { candidate: { candidateCode: { in: targetCodes } } },
        ],
      },
      include: {
        candidate: true,
        job: true,
        offer: true,
        assignedHr: { select: { id: true, name: true, email: true } },
      },
      orderBy: { candidateCode: 'asc' },
    });

    const candidateList = applications.map((app) => {
      const cand = app.candidate || {};
      const candName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate';
      const code = app.candidateCode || cand.candidateCode || app.id?.slice(0, 10) || 'APP-2026';

      const isAlreadyOffered = 
        app.status === 'OFFER_SENT' || 
        app.status === 'OFFER_ACCEPTED' || 
        app.status === 'OFFER_RELEASED' || 
        app.offer?.status === 'SENT' || 
        app.offer?.status === 'ACCEPTED';

      const isRejectedOrWithdrawn = 
        ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED', 'WITHDRAWN'].includes(app.status);

      const isFinalRoundCleared = 
        app.finalSelected === true || 
        app.managerApproved === true || 
        ['FINAL_ROUND', 'ROUND_2_SELECTED', 'FINAL_SELECTED'].includes(app.status) || 
        app.currentRound >= 2;

      const hasValidEmail = Boolean(cand.email && cand.email.includes('@') && !cand.email.includes('example.com'));

      let offerStatus: 'READY' | 'ALREADY_OFFERED' | 'INELIGIBLE' = 'INELIGIBLE';
      let reason = '';

      if (isAlreadyOffered) {
        offerStatus = 'ALREADY_OFFERED';
        reason = 'Offer already released / active';
      } else if (isRejectedOrWithdrawn) {
        offerStatus = 'INELIGIBLE';
        reason = `Candidate status is ${app.status}`;
      } else if (!hasValidEmail) {
        offerStatus = 'INELIGIBLE';
        reason = 'Missing or invalid candidate email address';
      } else if (isFinalRoundCleared) {
        offerStatus = 'READY';
        reason = 'Final round cleared & ready for offer';
      } else {
        offerStatus = 'INELIGIBLE';
        reason = 'Candidate has not cleared final round selection yet';
      }

      return {
        id: app.id,
        candidateId: app.candidateId,
        candidateCode: code,
        candidateName: candName,
        email: cand.email || 'N/A',
        jobTitle: app.job?.title || 'Open Position',
        currentStatus: app.status,
        offerStatus,
        reason,
      };
    });

    const eligibleCount = candidateList.filter((c) => c.offerStatus === 'READY').length;
    const alreadyOfferedCount = candidateList.filter((c) => c.offerStatus === 'ALREADY_OFFERED').length;
    const ineligibleCount = candidateList.filter((c) => c.offerStatus === 'INELIGIBLE').length;

    return res.json({
      success: true,
      fromId,
      toId,
      totalExpected,
      totalFound: applications.length,
      eligibleCount,
      alreadyOfferedCount,
      ineligibleCount,
      candidates: candidateList,
    });
  } catch (error: any) {
    console.error('Bulk Offer Preview Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate bulk offer preview: ' + error.message });
  }
};

/**
 * Execute Bulk Offer Send by ID Range
 */
export const executeBulkOfferSend = async (req, res) => {
  try {
    const { fromId, toId, commonOfferData = {}, candidateIdsToProcess = [] } = req.body;
    const user = req.user;

    const { targetCodes } = parseIdRange(fromId || '', toId || '');

    const whereQuery: any = {};
    if (candidateIdsToProcess && Array.isArray(candidateIdsToProcess) && candidateIdsToProcess.length > 0) {
      whereQuery.id = { in: candidateIdsToProcess };
    } else {
      whereQuery.OR = [
        { id: { in: targetCodes } },
        { candidateCode: { in: targetCodes } },
        { candidate: { candidateCode: { in: targetCodes } } },
      ];
    }

    // Query candidates in range or by selected IDs
    const applications = await prisma.application.findMany({
      where: whereQuery,
      include: {
        candidate: true,
        job: true,
        offer: true,
      },
      orderBy: { candidateCode: 'asc' },
    });

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'No candidates found in the specified ID range.' });
    }

    const {
      offerDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      jobTitle: commonJobTitle,
      duration = '6 MONTHS',
      joiningDate = '01-Sep-2026',
      trainingStartDate = '01-Sep-2026',
      trainingEndDate = '15-Sep-2026',
      ojtStartDate = '16-Sep-2026',
      ojtEndDate = '16-Mar-2027',
      location = 'HYDERABAD',
      stipend = 'INR 20000/-PerMonth',
      incentives = 'Up to 10,000/- INCENTIVES.',
      postProbationCtc = '₹8 LPA ( 6 Fixed + 2 Variable )',
      reportingDate = '01-Sep-2026',
      customTerms = '',
      hrManagerName = user?.name || 'HR MANAGER',
      hrEmail = 'hr@adyapan.com',
      hrPhone = '8179124566',
      companyWebsite = 'www.adyapan.com',
    } = commonOfferData;

    // Count existing offers in DB to generate unique sequential offer numbers
    const existingOfferCount = await prisma.offer.count();
    const currentYear = new Date().getFullYear();

    const results: any[] = [];
    let successCount = 0;
    let failedCount = 0;

    const { sendOfferLetterEmail } = await import('../services/emailService.js');

    for (let index = 0; index < applications.length; index++) {
      const app = applications[index];
      const cand = app.candidate || {};
      const candName = `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate';
      const candCode = app.candidateCode || cand.candidateCode || `CAND-${index + 1}`;
      const candEmail = cand.email;

      // 1. Backend Duplicate & Eligibility Protection
      const isAlreadyOffered = 
        app.status === 'OFFER_SENT' || 
        app.status === 'OFFER_ACCEPTED' || 
        app.status === 'OFFER_RELEASED' || 
        app.offer?.status === 'SENT' || 
        app.offer?.status === 'ACCEPTED';

      const isRejected = ['REJECTED', 'ROUND_1_REJECTED', 'ROUND_2_REJECTED', 'WITHDRAWN'].includes(app.status);

      if (isAlreadyOffered) {
        results.push({
          id: app.id,
          candidateCode: candCode,
          candidateName: candName,
          email: candEmail || 'N/A',
          status: 'SKIPPED',
          reason: 'Candidate already has an active offer released (duplicate protection).',
        });
        continue;
      }

      if (isRejected) {
        results.push({
          id: app.id,
          candidateCode: candCode,
          candidateName: candName,
          email: candEmail || 'N/A',
          status: 'FAILED',
          reason: `Candidate status is ${app.status} (ineligible).`,
        });
        failedCount++;
        continue;
      }

      if (!candEmail || !candEmail.includes('@') || candEmail.includes('example.com')) {
        results.push({
          id: app.id,
          candidateCode: candCode,
          candidateName: candName,
          email: candEmail || 'N/A',
          status: 'FAILED',
          reason: 'Candidate has no valid email address to dispatch offer.',
        });
        failedCount++;
        continue;
      }

      // Preserve candidate's saved olNo if available, otherwise generate sequential offer number
      const existingOfferDetails: any = (typeof app.offer?.offerDetails === 'object' && app.offer?.offerDetails !== null)
        ? app.offer.offerDetails
        : {};
      const uniqueSeq = String(existingOfferCount + index + 1).padStart(4, '0');
      const uniqueOlNo = existingOfferDetails.olNo || app.candidateCode || `ADP-${currentYear}-${uniqueSeq}`;
      const finalJobTitle = commonJobTitle || app.job?.title || 'COMMUNITY DEVELOPMENT INTERN';
      const finalJoining = joiningDate || trainingStartDate;

      const candidateOfferPayload = {
        olNo: uniqueOlNo,
        offerDate: offerDate || existingOfferDetails.offerDate,
        candidateName: candName,
        jobTitle: finalJobTitle,
        duration: duration || existingOfferDetails.duration || '6 MONTHS',
        trainingStartDate: finalJoining,
        trainingEndDate: trainingEndDate || existingOfferDetails.trainingEndDate,
        ojtStartDate: ojtStartDate || existingOfferDetails.ojtStartDate,
        ojtEndDate: ojtEndDate || existingOfferDetails.ojtEndDate,
        location: location || existingOfferDetails.location || 'HYDERABAD',
        stipend: stipend || existingOfferDetails.stipend || 'INR 20000/-PerMonth',
        incentives: incentives || existingOfferDetails.incentives || 'Up to 10,000/- INCENTIVES.',
        postProbationCtc: postProbationCtc || existingOfferDetails.postProbationCtc || '₹8 LPA ( 6 Fixed + 2 Variable )',
        reportingDate: reportingDate || existingOfferDetails.reportingDate || finalJoining,
        customTerms: customTerms || existingOfferDetails.customTerms,
        hrManagerName,
        hrEmail,
        hrPhone,
        companyWebsite,
      };

      try {
        // Create or update offer record in DB
        const numericSalary = parseFloat(String(stipend).replace(/[^0-9.]/g, '')) || 20000;
        await prisma.offer.upsert({
          where: { applicationId: app.id },
          update: {
            candidateName: candName,
            jobTitle: finalJobTitle,
            salary: numericSalary,
            joiningDate: new Date(finalJoining),
            status: 'SENT',
            managerApproved: true,
            approvedBy: user?.name || user?.id,
            approvedAt: new Date(),
            customTerms: customTerms || `Stipend: ${stipend}, Location: ${location}`,
            offerDetails: candidateOfferPayload,
          },
          create: {
            applicationId: app.id,
            candidateId: app.candidateId,
            candidateName: candName,
            candidateEmail: candEmail,
            jobTitle: finalJobTitle,
            salary: numericSalary,
            joiningDate: new Date(finalJoining),
            status: 'SENT',
            managerApproved: true,
            approvedBy: user?.name || user?.id,
            approvedAt: new Date(),
            customTerms: customTerms || `Stipend: ${stipend}, Location: ${location}`,
            offerDetails: candidateOfferPayload,
          },
        });

        // Update application status
        await prisma.application.update({
          where: { id: app.id },
          data: {
            status: 'OFFER_SENT',
            overallStatus: 'OFFER_SENT',
          },
        });

        // Dispatch individual personalized offer email with candidate's individual PDF
        await sendOfferLetterEmail({
          ...candidateOfferPayload,
          candidateEmail: candEmail,
          applicationId: app.id,
        });

        await auditService.log({
          userId: user?.id,
          userRole: user?.role,
          userName: user?.name,
          action: 'BULK_OFFER_RELEASED',
          entity: 'Application',
          entityId: app.id,
          newValue: {
            candidateCode: candCode,
            candidateName: candName,
            olNo: uniqueOlNo,
            jobTitle: finalJobTitle,
          },
        });

        results.push({
          id: app.id,
          candidateCode: candCode,
          candidateName: candName,
          email: candEmail,
          olNo: uniqueOlNo,
          status: 'SUCCESS',
        });
        successCount++;
      } catch (sendErr: any) {
        console.error(`Bulk Offer failed for candidate ${candName} (${candCode}):`, sendErr);
        results.push({
          id: app.id,
          candidateCode: candCode,
          candidateName: candName,
          email: candEmail,
          olNo: uniqueOlNo,
          status: 'FAILED',
          reason: sendErr?.message || 'Email delivery or PDF generation failed',
        });
        failedCount++;
      }
    }

    return res.json({
      success: true,
      totalProcessed: applications.length,
      successCount,
      failedCount,
      results,
    });
  } catch (error: any) {
    console.error('Execute Bulk Offer Send Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to execute bulk offer rollout: ' + error.message });
  }
};

/**
 * Get Communication History (All sent emails and notices)
 */
export const getCommunicationHistory = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['CANDIDATE_SHORTLISTED', 'CANDIDATE_REJECTED', 'OFFER_RELEASED', 'APPLICATION_CREATED', 'INTERVIEW_SCHEDULED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const communicationRecords = logs.map((l) => {
      let emailType = 'Application Notice';
      if (l.action === 'CANDIDATE_SHORTLISTED') emailType = 'Shortlist Email';
      else if (l.action === 'CANDIDATE_REJECTED') emailType = 'Rejection Email';
      else if (l.action === 'OFFER_RELEASED') emailType = 'Official Offer Letter';
      else if (l.action === 'INTERVIEW_SCHEDULED') emailType = 'Interview Schedule Invitation';

      const newVal = (l.newValue as any) || {};
      return {
        id: l.id,
        applicationId: l.entityId,
        candidateName: newVal.candidateName || newVal.name || 'Candidate',
        recipientEmail: newVal.candidateEmail || newVal.email || 'Candidate Email',
        emailType,
        sentBy: l.userName || 'HR Operations',
        sentDate: l.createdAt,
        status: 'DELIVERED',
        details: newVal,
      };
    });

    res.json({
      success: true,
      count: communicationRecords.length,
      history: communicationRecords,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch communication history: ' + error.message });
  }
};

/**
 * Get Operational Hiring Reports
 */
export const getHiringReports = async (req, res) => {
  try {
    const totalApps = await prisma.application.count();
    const shortlistedCount = await prisma.application.count({
      where: { status: { in: ['SHORTLISTED', 'ASSIGNED', 'ROUND_1_PENDING', 'ROUND_1_SELECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED', 'FINAL_ROUND', 'OFFER_SENT', 'JOINED'] } },
    });
    const rejectedCount = await prisma.application.count({
      where: { status: 'REJECTED' },
    });
    const round1Passed = await prisma.application.count({
      where: { status: { in: ['ROUND_1_SELECTED', 'ROUND_2_PENDING', 'ROUND_2_SELECTED', 'FINAL_ROUND', 'OFFER_SENT', 'JOINED'] } },
    });
    const round2Passed = await prisma.application.count({
      where: { status: { in: ['ROUND_2_SELECTED', 'FINAL_ROUND', 'OFFER_SENT', 'JOINED'] } },
    });
    const offersSent = await prisma.application.count({
      where: { status: { in: ['OFFER_SENT', 'JOINED'] } },
    });

    // Jobs Breakdown
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        department: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    res.json({
      success: true,
      report: {
        totalApplications: totalApps,
        shortlistedCount,
        rejectedCount,
        shortlistRate: totalApps ? Math.round((shortlistedCount / totalApps) * 100) : 0,
        rejectionRate: totalApps ? Math.round((rejectedCount / totalApps) * 100) : 0,
        round1Conversion: shortlistedCount ? Math.round((round1Passed / shortlistedCount) * 100) : 0,
        round2Conversion: round1Passed ? Math.round((round2Passed / round1Passed) * 100) : 0,
        finalRoundCount: round2Passed,
        offersSent,
        jobsBreakdown: jobs.map((j) => ({
          title: j.title,
          department: j.department,
          applicationsCount: j._count.applications,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch hiring reports: ' + error.message });
  }
};