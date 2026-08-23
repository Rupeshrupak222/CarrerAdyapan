import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { auditService } from './auditService.js';

export const hrDistributionService = {
  /**
   * Distribute a single Shortlisted Candidate to the Least-Loaded Active HR
   */
  distributeCandidate: async (applicationId: string, assignedBy: string = 'SYSTEM', reason: string = 'WORKLOAD_BALANCED') => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { candidate: true, job: true },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Check if already has an active assignment
      const existingAssignment = await prisma.hRAssignment.findFirst({
        where: {
          applicationId,
          status: 'ACTIVE',
        },
        include: { hr: true },
      });

      if (existingAssignment && application.assignedHrId) {
        logger.info(`Application ${applicationId} already assigned to HR ${existingAssignment.hr.name}`);
        return { success: true, assignedHr: existingAssignment.hr, isExisting: true };
      }

      // 1. Fetch All Active HRs
      const activeHRs = await prisma.user.findMany({
        where: {
          isActive: true,
          role: { in: ['HR', 'RECRUITER'] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          meetLink: true,
        },
        orderBy: { name: 'asc' },
      });

      let selectedHr = null;

      if (activeHRs.length === 0) {
        // Fallback to any active admin or create default HR
        const adminFallback = await prisma.user.findFirst({
          where: { role: 'ADMIN', isActive: true },
        });
        if (adminFallback) {
          selectedHr = adminFallback;
        } else {
          logger.warn('No active HR found in database for candidate distribution.');
          return { success: false, message: 'No active HR team members found.' };
        }
      } else {
        // 2. Calculate Current Workload per HR (Active Candidates count)
        const hrWorkloads = await Promise.all(
          activeHRs.map(async (hr) => {
            const activeCount = await prisma.application.count({
              where: {
                assignedHrId: hr.id,
                overallStatus: { in: ['HR_ASSIGNED', 'INTERVIEWING', 'OFFER_PENDING', 'ONBOARDING', 'DOCUMENT_VERIFICATION'] },
              },
            });
            return { hr, activeCount };
          })
        );

        // Sort by least loaded HR
        hrWorkloads.sort((a, b) => a.activeCount - b.activeCount);
        selectedHr = hrWorkloads[0].hr;
      }

      // 3. Mark any previous assignments as REASSIGNED/INACTIVE
      await prisma.hRAssignment.updateMany({
        where: { applicationId, status: 'ACTIVE' },
        data: { status: 'INACTIVE' },
      });

      // 4. Create New Active HRAssignment Record
      await prisma.hRAssignment.create({
        data: {
          applicationId,
          candidateId: application.candidateId,
          hrId: selectedHr.id,
          status: 'ACTIVE',
          assignedBy,
          reason,
        },
      });

      // 5. Update Application record
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          assignedHrId: selectedHr.id,
          assignedAt: new Date(),
          overallStatus: 'HR_ASSIGNED',
        },
      });

      // 6. Audit Trail
      await auditService.log({
        userId: assignedBy === 'SYSTEM' ? undefined : assignedBy,
        userName: assignedBy === 'SYSTEM' ? 'Automated ATS Dispatcher' : undefined,
        action: 'HR_ASSIGNED',
        entity: 'Application',
        entityId: applicationId,
        newValue: { assignedHrId: selectedHr.id, hrName: selectedHr.name, reason },
      });

      logger.info(`Candidate ${application.candidate?.firstName} ${application.candidate?.lastName} (${applicationId}) allocated to ${selectedHr.name}`);

      return {
        success: true,
        assignedHr: selectedHr,
      };
    } catch (err: any) {
      logger.error('HR Distribution Error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Batch Distribute all unassigned Shortlisted Candidates
   */
  distributeUnassignedShortlisted: async () => {
    try {
      const unassignedApps = await prisma.application.findMany({
        where: {
          screeningStatus: 'SHORTLISTED',
          assignedHrId: null,
          overallStatus: { not: 'REJECTED' },
        },
      });

      let count = 0;
      for (const app of unassignedApps) {
        const res = await hrDistributionService.distributeCandidate(app.id);
        if (res.success) count++;
      }

      return { success: true, distributedCount: count };
    } catch (err: any) {
      logger.error('Batch Distribution Error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Reassign a Candidate by HR Manager
   */
  reassignCandidate: async (applicationId: string, newHrId: string, managerUserId: string, reason: string = 'MANUAL_REASSIGN') => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { candidate: true },
      });

      if (!application) throw new Error('Application not found');

      const newHr = await prisma.user.findUnique({ where: { id: newHrId } });
      if (!newHr) throw new Error('Target HR not found');

      // Deactivate old assignment
      await prisma.hRAssignment.updateMany({
        where: { applicationId, status: 'ACTIVE' },
        data: { status: 'REASSIGNED' },
      });

      // Create new assignment
      await prisma.hRAssignment.create({
        data: {
          applicationId,
          candidateId: application.candidateId,
          hrId: newHrId,
          status: 'ACTIVE',
          assignedBy: managerUserId,
          reason,
        },
      });

      // Update application
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          assignedHrId: newHrId,
          assignedAt: new Date(),
        },
      });

      // Audit Log
      await auditService.log({
        userId: managerUserId,
        action: 'HR_REASSIGNED',
        entity: 'Application',
        entityId: applicationId,
        oldValue: { previousHrId: application.assignedHrId },
        newValue: { newHrId, hrName: newHr.name, reason },
      });

      return { success: true, message: `Candidate successfully reassigned to ${newHr.name}` };
    } catch (err: any) {
      logger.error('Reassign Error:', err);
      return { success: false, message: err.message };
    }
  },
};
