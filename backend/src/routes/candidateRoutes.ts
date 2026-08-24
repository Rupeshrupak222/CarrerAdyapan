import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  publicApplyCandidate,
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getCandidatesByJob,
  rejectCandidate,
  parseAndScoreResume,
  streamResumeFile,
  proxyResumeUrl
} from '../controllers/candidateController.js';

const router = express.Router();

// Public Candidate Apply & Resume Document Stream Endpoints (No Login Required)
router.post('/public-apply', upload.single('resumeFile'), publicApplyCandidate);
router.post('/apply', upload.single('resumeFile'), publicApplyCandidate);
router.post('/parse-and-score', upload.single('resumeFile'), parseAndScoreResume);
router.get('/resume-file/:filename', streamResumeFile);
router.get('/resume-proxy', proxyResumeUrl);

// Authenticated Recruiter Routes
router.use(authMiddleware);
router.post('/', createCandidate);
router.post('/reject', rejectCandidate);
router.post('/:id/reject', rejectCandidate);
router.get('/', getAllCandidates);
router.get('/job/:jobId', getCandidatesByJob);
router.get('/:id', getCandidateById);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

export default router;