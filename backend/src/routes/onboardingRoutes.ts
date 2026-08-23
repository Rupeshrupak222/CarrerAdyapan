import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { onboardingController } from '../controllers/onboardingController.js';

const router = express.Router();

// Public Candidate Token-Based Endpoints (NO LOGIN REQUIRED)
router.get('/token/:token', onboardingController.getOnboardingByToken);
router.post('/submit', onboardingController.submitOnboarding);

// Protected HR & Manager Endpoints
router.use(authMiddleware);
router.patch('/documents/:id/verify', onboardingController.verifyDocument);
router.post('/:onboardingId/confirm-joining', onboardingController.confirmJoining);
router.post('/joinings/:joiningId/mark-joined', onboardingController.markJoined);

export default router;
