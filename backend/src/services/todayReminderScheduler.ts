import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';
import { notificationService } from './notificationService.js';
import { sendInterviewReminderEmail } from './emailService.js';

/**
 * Send Today's Interview Reminder Email to HR
 */
const sendHRTodayReminderEmail = async ({ hrEmail, candidateName, jobTitle, formattedTime, type, meetingLink }) => {
  const targetEmail = hrEmail || process.env.ADMIN_EMAIL || 'admin@adyapan.com';
  return await sendInterviewReminderEmail({
    recipientEmail: targetEmail,
    recipientName: 'HR Team',
    candidateName,
    jobTitle,
    scheduledAt: new Date(),
    meetingLink,
    isHR: true,
  });
};

/**
 * Send Today's Interview Reminder Email to Candidate
 */
const sendCandidateTodayReminderEmail = async ({ candidateEmail, candidateName, jobTitle, formattedTime, type, meetingLink }) => {
  if (!candidateEmail) return;
  return await sendInterviewReminderEmail({
    recipientEmail: candidateEmail,
    recipientName: candidateName,
    candidateName,
    jobTitle,
    scheduledAt: new Date(),
    meetingLink,
    isHR: false,
  });
};

/**
 * Automatic Daily Check Service for Today's Interviews
 */
export const todayReminderScheduler = {
  /**
   * Scan database for Today's Interviews (IST) and send notifications & emails once
   */
  processTodayReminders: async () => {
    try {
      const now = new Date();

      // Asia/Kolkata (IST) Boundaries for TODAY
      const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istNow = new Date(istString);

      const startOfToday = new Date(istNow);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date(istNow);
      endOfToday.setHours(23, 59, 59, 999);

      // Query database for interviews scheduled today using existing schema relationships
      const todayInterviews = await prisma.interview.findMany({
        where: {
          status: { in: ['SCHEDULED', 'CONFIRMED', 'RESCHEDULED'] },
          scheduledAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        include: {
          application: {
            include: {
              candidate: true,
              job: true,
            },
          },
        },
      }).catch((err) => {
        logger.warn('Failed to query today interviews:', err.message);
        return [];
      });

      if (!todayInterviews || todayInterviews.length === 0) {
        return { success: true, processedCount: 0, message: 'No interviews scheduled for today' };
      }

      let processedCount = 0;

      // Query all existing activities for duplicate prevention check
      const existingActivities = await prisma.activity.findMany({
        where: { action: 'INTERVIEW_REMINDER_TODAY' },
      }).catch(() => []);

      for (const interview of todayInterviews) {
        const reminderType = 'INTERVIEW_REMINDER_TODAY';

        // 6. DUPLICATE PREVENTION: Check if notification or reminder was already generated today for this interview
        const alreadyProcessed = existingActivities.some((a) => {
          const detailsObj = typeof a.details === 'object' && a.details !== null ? a.details : {};
          return detailsObj.relatedInterviewId === interview.id;
        });

        if (alreadyProcessed) {
          // Already sent for today -> SKIP to prevent duplicates!
          continue;
        }

        // Resolve names, emails, titles from database relationships
        const candName = interview.candidateName || (interview.application?.candidate ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}` : 'Candidate');
        const candEmail = interview.candidateEmail || interview.application?.candidate?.email || '';
        const jobTitle = interview.jobTitle || interview.application?.job?.title || 'Business Development Associate';
        const hrUserId = 'demo-user-101';
        const hrEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'admin@adyapan.com';
        const meetingLink = interview.meetingLink || 'https://meet.google.com/adyapan-interview';

        const formattedTime = new Date(interview.scheduledAt).toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
        });

        const notifTitle = `Today's Interview Reminder`;
        const notifMsg = `Interview Reminder: ${candName}'s interview for ${jobTitle} is scheduled today at ${formattedTime}.`;

        // 1. HR NOTIFICATION BELL (Saved in PostgreSQL Database Activity table)
        await notificationService.createNotification({
          recipientUserId: hrUserId,
          type: reminderType,
          title: notifTitle,
          message: notifMsg,
          relatedInterviewId: interview.id,
        });

        // 2. HR EMAIL
        sendHRTodayReminderEmail({
          hrEmail,
          candidateName: candName,
          jobTitle,
          formattedTime,
          type: interview.type,
          meetingLink,
        }).catch((e) => logger.warn('HR Reminder email error:', e.message));

        // 3. CANDIDATE EMAIL
        if (candEmail) {
          sendCandidateTodayReminderEmail({
            candidateEmail: candEmail,
            candidateName: candName,
            jobTitle,
            formattedTime,
            type: interview.type,
            meetingLink,
          }).catch((e) => logger.warn('Candidate Reminder email error:', e.message));
        }

        processedCount++;
      }

      logger.info(`Today's Interview Reminder task complete. Processed: ${processedCount} reminder(s).`);
      return { success: true, processedCount };
    } catch (error) {
      logger.error('processTodayReminders Error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Start recurring daily background task (runs every 5 minutes automatically)
   */
  startScheduler: (intervalMs = 5 * 60 * 1000) => {
    logger.info("Started Today's Interview Reminder Scheduler worker (running every 5 mins)...");
    
    // Initial run
    todayReminderScheduler.processTodayReminders().catch(() => {});

    // Recurring interval
    setInterval(() => {
      todayReminderScheduler.processTodayReminders().catch(() => {});
    }, intervalMs);
  },
};
