import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  scoreCandidate,
  generateQuestions,
  getHiringAssistant,
  streamHiringAssistant,
  clearConversation
} from '../controllers/aiController.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/score', scoreCandidate);
router.post('/questions', generateQuestions);
router.post('/assistant', getHiringAssistant);
router.post('/assistant/stream', streamHiringAssistant);
router.delete('/assistant/clear', clearConversation);

export default router;