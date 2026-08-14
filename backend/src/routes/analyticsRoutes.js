import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getDashboardStats, getHiringFunnel, getRecentActivity } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/stats', getDashboardStats);
router.get('/dashboard', getDashboardStats);
router.get('/funnel', getHiringFunnel);
router.get('/activity', getRecentActivity);

export default router;