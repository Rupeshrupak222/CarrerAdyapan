import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createInterview,
  bulkScheduleInterviews,
  allocateAndScheduleRound,
  getEligibleCandidatesForRound,
  getAllInterviews,
  getInterviewById,
  getInterviewByToken,
  updateInterview,
  deleteInterview,
  updateInterviewFeedback
} from '../controllers/interviewController.js';

const router = express.Router();

// Public Candidate Secure Token Route (NO LOGIN REQUIRED)
router.get('/token/:token', getInterviewByToken);

router.use(authMiddleware);
router.get('/eligible-candidates', getEligibleCandidatesForRound);
router.post('/allocate-round', allocateAndScheduleRound);
router.post('/bulk', bulkScheduleInterviews);
router.post('/', createInterview);
router.get('/', getAllInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.patch('/:id/feedback', updateInterviewFeedback);

export default router;