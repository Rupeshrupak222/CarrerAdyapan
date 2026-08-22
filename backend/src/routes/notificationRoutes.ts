import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  deleteNotification,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get Notifications
router.get('/', authMiddleware, getNotifications);

// Mark All As Read
router.put('/mark-all-read', authMiddleware, markAllAsRead);
router.patch('/mark-all-read', authMiddleware, markAllAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
router.patch('/read-all', authMiddleware, markAllAsRead);

// Mark Single As Read
router.put('/:id/read', authMiddleware, markAsRead);
router.patch('/:id/read', authMiddleware, markAsRead);

// Clear All Notifications
router.delete('/clear-all', authMiddleware, clearAllNotifications);
router.delete('/', authMiddleware, clearAllNotifications);

// Delete Single Notification
router.delete('/:id', authMiddleware, deleteNotification);

export default router;

