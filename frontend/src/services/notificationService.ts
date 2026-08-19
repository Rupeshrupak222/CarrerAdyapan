import api from './api';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  unread?: boolean;
  createdAt: string;
  time?: string;
}

export const notificationService = {
  getNotifications: async (): Promise<{ success: boolean; notifications: NotificationItem[]; unreadCount: number }> => {
    try {
      const response = await api.get('/notifications');
      if (response.data && Array.isArray(response.data.notifications)) {
        return {
          success: true,
          notifications: response.data.notifications,
          unreadCount: response.data.unreadCount || 0,
        };
      }
      return { success: true, notifications: [], unreadCount: 0 };
    } catch (error) {
      console.warn('Failed to fetch real-time notifications:', error);
      return { success: false, notifications: [], unreadCount: 0 };
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
      return { success: false };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error);
      return { success: false };
    }
  },
};
