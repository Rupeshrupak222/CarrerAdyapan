import express from 'express';
import { candidateAuthMiddleware } from '../middleware/candidateAuthMiddleware.js';
import {
  candidateRegister,
  candidateLogin,
  getCandidateProfile,
  updateCandidateProfile,
  getMyApplications
} from '../controllers/candidateAuthController.js';

const router = express.Router();

// Public routes (no auth)
router.post('/register', candidateRegister);
router.post('/login', candidateLogin);

// Protected routes (candidate must be logged in)
router.get('/profile', candidateAuthMiddleware, getCandidateProfile);
router.put('/profile', candidateAuthMiddleware, updateCandidateProfile);
router.get('/my-applications', candidateAuthMiddleware, getMyApplications);

export default router;
