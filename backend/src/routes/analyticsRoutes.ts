import express from 'express';
import { getDashboardStats, getHiringFunnel, getRecentActivity, getMonthlyVelocity } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/funnel', authMiddleware, getHiringFunnel);
router.get('/velocity', authMiddleware, getMonthlyVelocity);
router.get('/activity', authMiddleware, getRecentActivity);

export default router;