import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { hrDistributionService } from '../services/hrDistributionService.js';
import { screeningService } from '../services/screeningService.js';
import { auditService } from '../services/auditService.js';

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

// Get All Applications (Strict Backend RBAC Enforced)
export const getAllApplications = async (req, res) => {
  try {
    const { jobId, candidateId, status, overallStatus, assignedHrId, search, roundNumber } = req.query;
    const user = req.user;

    const where: any = {};

    // RBAC: HR can ONLY see their assigned candidates!
    if (user && user.role === 'HR') {
      where.assignedHrId = user.id;
    } else if (assignedHrId && assignedHrId !== 'ALL') {
      where.assignedHrId = String(assignedHrId);
    }

    if (jobId) where.jobId = String(jobId);
    if (candidateId) where.candidateId = String(candidateId);
    if (status && status !== 'ALL') where.status = String(status);
    if (overallStatus && overallStatus !== 'ALL') where.overallStatus = String(overallStatus);
    if (roundNumber) where.currentRound = parseInt(String(roundNumber), 10);

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

    const applications = await prisma.application.findMany({
      where,
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

    res.json({ success: true, count: applications.length, applications });
  } catch (error: any) {
    logger.error('Get Applications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications: ' + error.message });
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

// Delete Application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'HR_MANAGER')) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete application' });
    }

    await prisma.application.delete({ where: { id } });
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    logger.error('Delete Application Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete application' });
  }
};