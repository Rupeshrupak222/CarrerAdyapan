import { notificationService } from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-101';
    const result = await notificationService.getUserNotifications(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationService.markAsRead(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-101';
    const result = await notificationService.markAllAsRead(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
