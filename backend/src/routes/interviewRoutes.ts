import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createInterview,
  bulkScheduleInterviews,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  updateInterviewFeedback
} from '../controllers/interviewController.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/bulk', bulkScheduleInterviews);
router.post('/', createInterview);
router.get('/', getAllInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.patch('/:id/feedback', updateInterviewFeedback);

export default router;