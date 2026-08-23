import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { sendApplicationConfirmationEmail, sendRejectionEmail } from './emailService.js';
import { hrDistributionService } from './hrDistributionService.js';
import { auditService } from './auditService.js';

export const screeningService = {
  /**
   * Run automated ATS screening on a single application
   */
  screenApplication: async (applicationId: string) => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          candidate: true,
          job: {
            include: { screeningRules: true },
          },
        },
      });

      if (!application || application.screeningStatus === 'SHORTLISTED' || application.screeningStatus === 'REJECTED') {
        return { success: false, message: 'Application not eligible for screening' };
      }

      // 1. Fetch active screening rule (Job-specific or System Default)
      let rule = application.job?.screeningRules?.find((r) => r.isActive);
      if (!rule) {
        rule = await prisma.screeningRule.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        });
      }

      const minScore = rule?.minAiScore || 65;
      const requiredSkills = rule?.requiredSkills || [];
      const minExp = rule?.minExperience || 0;

      const candidateScore = application.aiScore || application.candidate?.aiScore || 75;
      const candidateExp = application.candidate?.totalExperience || 0;
      const candidateSkills = (application.candidate?.skills || []).map((s) => s.toLowerCase());

      // 2. Evaluate qualification
      let isQualified = candidateScore >= minScore && candidateExp >= minExp;

      // Check required skills if specified
      if (isQualified && requiredSkills.length > 0) {
        const matchesRequired = requiredSkills.every((reqSkill) =>
          candidateSkills.some((candSkill) => candSkill.includes(reqSkill.toLowerCase()))
        );
        if (!matchesRequired && requiredSkills.length > 2) {
          // Allow leeway if candidate has high score
          isQualified = candidateScore >= (minScore + 10);
        }
      }

      const candidateName = `${application.candidate?.firstName} ${application.candidate?.lastName}`.trim();
      const candidateEmail = application.candidate?.email;
      const jobTitle = application.job?.title || 'Business Development Associate (BDA)';

      if (isQualified) {
        // --- SHORTLISTED ---
        await prisma.application.update({
          where: { id: applicationId },
          data: {
            screeningStatus: 'SHORTLISTED',
            overallStatus: 'SHORTLISTED',
            screeningScore: candidateScore,
            screenedAt: new Date(),
            screeningNotes: `Automated screening passed (Score: ${candidateScore}%, Exp: ${candidateExp} yrs)`,
          },
        });

        await auditService.log({
          action: 'SCREENING_COMPLETED',
          entity: 'Application',
          entityId: applicationId,
          newValue: { result: 'SHORTLISTED', score: candidateScore },
        });

        logger.info(`Application ${applicationId} (${candidateName}) SHORTLISTED by ATS screening engine.`);

        // Trigger automatic HR workload-aware allocation
        await hrDistributionService.distributeCandidate(applicationId, 'SYSTEM', 'AUTO_SHORTLIST_ALLOCATION');

        return { success: true, result: 'SHORTLISTED', candidateName, candidateEmail };
      } else {
        // --- REJECTED ---
        await prisma.application.update({
          where: { id: applicationId },
          data: {
            screeningStatus: 'REJECTED',
            overallStatus: 'REJECTED',
            screeningScore: candidateScore,
            screenedAt: new Date(),
            screeningNotes: `Automated screening rejected (Score: ${candidateScore}% vs required ${minScore}%)`,
          },
        });

        await auditService.log({
          action: 'SCREENING_COMPLETED',
          entity: 'Application',
          entityId: applicationId,
          newValue: { result: 'REJECTED', score: candidateScore },
        });

        logger.info(`Application ${applicationId} (${candidateName}) REJECTED by ATS screening engine.`);

        // Send professional rejection email
        if (candidateEmail && !candidateEmail.includes('example.com')) {
          sendRejectionEmail({
            candidateName,
            candidateEmail,
            jobTitle,
          }).catch((e) => logger.warn('Rejection email notice:', e));
        }

        return { success: true, result: 'REJECTED', candidateName, candidateEmail };
      }
    } catch (err: any) {
      logger.error('Screening Error:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Run automated 24-hour screening on all eligible applications
   */
  run24HourScreeningJob: async (forceAll: boolean = false) => {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      const pendingApplications = await prisma.application.findMany({
        where: {
          screeningStatus: 'PENDING',
          overallStatus: 'APPLIED',
          ...(forceAll ? {} : { appliedAt: { lte: cutoffTime } }),
        },
      });

      logger.info(`Running ATS screening on ${pendingApplications.length} pending applications...`);
      const results = [];

      for (const app of pendingApplications) {
        const res = await screeningService.screenApplication(app.id);
        results.push({ id: app.id, ...res });
      }

      return {
        success: true,
        processedCount: results.length,
        results,
      };
    } catch (err: any) {
      logger.error('Screening Job Error:', err);
      return { success: false, message: err.message };
    }
  },
};
