import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

export const notificationService = {
  /**
   * Create and persist notification in PostgreSQL database using existing Activity model
   */
  createNotification: async ({ recipientUserId, type = 'INTERVIEW_REMINDER_TODAY', title, message, relatedInterviewId = null }) => {
    try {
      let targetUser = await prisma.user.findFirst({ where: { id: recipientUserId } }).catch(() => null);
      if (!targetUser) {
        targetUser = await prisma.user.findFirst().catch(() => null);
      }

      if (!targetUser) {
        logger.warn('No user record found in DB to attach notification');
        return null;
      }

      const activity = await prisma.activity.create({
        data: {
          action: type,
          details: {
            title,
            message,
            relatedInterviewId,
            isRead: false,
          },
          userId: targetUser.id,
        },
      });

      logger.info(`Notification saved in DB Activity table for user ${targetUser.email || targetUser.id}: ${title}`);
      return activity;
    } catch (error) {
      logger.error('Failed to create notification in DB Activity table:', error.message);
      return null;
    }
  },

  /**
   * Get user notifications from PostgreSQL database Activity table
   */
  getUserNotifications: async (userId) => {
    try {
      let targetUser = await prisma.user.findFirst({ where: { id: userId } }).catch(() => null);
      if (!targetUser) {
        targetUser = await prisma.user.findFirst().catch(() => null);
      }

      const whereCondition = targetUser ? { userId: targetUser.id } : {};

      const activities = await prisma.activity.findMany({
        where: {
          ...whereCondition,
          action: { startsWith: 'INTERVIEW' },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }).catch(() => []);

      const notifications = activities.map((a) => {
        const detailsObj = typeof a.details === 'object' && a.details !== null ? a.details : {};
        return {
          id: a.id,
          type: a.action,
          title: detailsObj.title || 'Notification',
          message: detailsObj.message || '',
          relatedInterviewId: detailsObj.relatedInterviewId || null,
          isRead: !!detailsObj.isRead,
          createdAt: a.createdAt,
        };
      });

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        success: true,
        notifications,
        unreadCount,
      };
    } catch (error) {
      logger.error('getUserNotifications Error:', error.message);
      return { success: true, notifications: [], unreadCount: 0 };
    }
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      const activity = await prisma.activity.findUnique({ where: { id: notificationId } });
      if (!activity) return { success: false, message: 'Notification not found' };

      const existingDetails = typeof activity.details === 'object' && activity.details !== null ? activity.details : {};
      const updatedActivity = await prisma.activity.update({
        where: { id: notificationId },
        data: {
          details: {
            ...existingDetails,
            isRead: true,
          },
        },
      });

      return { success: true, notification: updatedActivity };
    } catch (error) {
      logger.error('markAsRead Error:', error.message);
      return { success: false, message: error.message };
    }
  },

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead: async (userId) => {
    try {
      let targetUser = await prisma.user.findFirst({ where: { id: userId } }).catch(() => null);
      if (!targetUser) targetUser = await prisma.user.findFirst().catch(() => null);
      if (!targetUser) return { success: true };

      const activities = await prisma.activity.findMany({
        where: { userId: targetUser.id, action: { startsWith: 'INTERVIEW' } },
      });

      for (const act of activities) {
        const detailsObj = typeof act.details === 'object' && act.details !== null ? act.details : {};
        await prisma.activity.update({
          where: { id: act.id },
          data: {
            details: {
              ...detailsObj,
              isRead: true,
            },
          },
        }).catch(() => {});
      }

      return { success: true };
    } catch (error) {
      logger.error('markAllAsRead Error:', error.message);
      return { success: false, message: error.message };
    }
  },
};
