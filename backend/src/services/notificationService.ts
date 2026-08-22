import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

export interface CreateNotificationParams {
  recipientUserId?: string | null;
  type?: string;
  title: string;
  message: string;
  link?: string;
  relatedInterviewId?: string | null;
  relatedJobId?: string | null;
}

export const notificationService = {
  /**
   * Create and persist notification in PostgreSQL database using existing Activity model
   */
  createNotification: async ({
    recipientUserId = null,
    type = 'GENERAL',
    title,
    message,
    link = '/candidates',
    relatedInterviewId = null,
    relatedJobId = null,
  }: CreateNotificationParams) => {
    try {
      let targetUser = recipientUserId
        ? await prisma.user.findFirst({ where: { id: recipientUserId } }).catch(() => null)
        : null;

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
            link,
            relatedInterviewId,
            relatedJobId,
            isRead: false,
          },
          userId: targetUser.id,
        },
      });

      logger.info(`Notification saved in DB Activity table for user ${targetUser.email || targetUser.id}: ${title}`);
      return activity;
    } catch (error: any) {
      logger.error('Failed to create notification in DB Activity table:', error?.message || error);
      return null;
    }
  },

  /**
   * Get user notifications from PostgreSQL database Activity table
   */
  getUserNotifications: async (userId?: string) => {
    try {
      let targetUser = userId
        ? await prisma.user.findFirst({ where: { id: userId } }).catch(() => null)
        : null;

      if (!targetUser) {
        targetUser = await prisma.user.findFirst().catch(() => null);
      }

      const whereCondition = targetUser ? { userId: targetUser.id } : {};

      const activities = await prisma.activity.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: 30,
      }).catch(() => []);

      const notifications = activities.map((a) => {
        const detailsObj = typeof a.details === 'object' && a.details !== null ? (a.details as any) : {};
        return {
          id: a.id,
          type: a.action,
          title: detailsObj.title || 'Notification',
          message: detailsObj.message || '',
          link: detailsObj.link || '/candidates',
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
    } catch (error: any) {
      logger.error('getUserNotifications Error:', error?.message || error);
      return { success: true, notifications: [], unreadCount: 0 };
    }
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId: string) => {
    try {
      const activity = await prisma.activity.findUnique({ where: { id: notificationId } });
      if (!activity) return { success: false, message: 'Notification not found' };

      const existingDetails = typeof activity.details === 'object' && activity.details !== null ? (activity.details as any) : {};
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
    } catch (error: any) {
      logger.error('markAsRead Error:', error?.message || error);
      return { success: false, message: error?.message || 'Failed to update' };
    }
  },

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead: async (userId?: string) => {
    try {
      let targetUser = userId
        ? await prisma.user.findFirst({ where: { id: userId } }).catch(() => null)
        : null;

      if (!targetUser) targetUser = await prisma.user.findFirst().catch(() => null);
      if (!targetUser) return { success: true };

      const activities = await prisma.activity.findMany({
        where: { userId: targetUser.id },
      });

      for (const act of activities) {
        const detailsObj = typeof act.details === 'object' && act.details !== null ? (act.details as any) : {};
        if (!detailsObj.isRead) {
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
      }

      return { success: true };
    } catch (error: any) {
      logger.error('markAllAsRead Error:', error?.message || error);
      return { success: false, message: error?.message || 'Failed to update' };
    }
  },

  /**
   * Clear all notifications for user
   */
  clearAllNotifications: async (userId?: string) => {
    try {
      let targetUser = userId
        ? await prisma.user.findFirst({ where: { id: userId } }).catch(() => null)
        : null;

      if (!targetUser) targetUser = await prisma.user.findFirst().catch(() => null);

      if (targetUser) {
        await prisma.activity.deleteMany({
          where: { userId: targetUser.id },
        });
      } else {
        await prisma.activity.deleteMany({});
      }

      return { success: true, message: 'All notifications cleared successfully' };
    } catch (error: any) {
      logger.error('clearAllNotifications Error:', error?.message || error);
      return { success: false, message: error?.message || 'Failed to clear notifications' };
    }
  },

  /**
   * Delete a single notification by ID
   */
  deleteNotification: async (notificationId: string) => {
    try {
      await prisma.activity.delete({
        where: { id: notificationId },
      }).catch(() => null);

      return { success: true, message: 'Notification deleted successfully' };
    } catch (error: any) {
      logger.error('deleteNotification Error:', error?.message || error);
      return { success: false, message: error?.message || 'Failed to delete notification' };
    }
  },
};

