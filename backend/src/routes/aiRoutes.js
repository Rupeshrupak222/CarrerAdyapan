import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  scoreCandidate,
  generateQuestions,
  getHiringAssistant
} from '../controllers/aiController.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/score', scoreCandidate);
router.post('/questions', generateQuestions);
router.post('/assistant', getHiringAssistant);

export default router;