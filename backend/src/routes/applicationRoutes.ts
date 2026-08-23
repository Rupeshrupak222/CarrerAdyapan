import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  reassignCandidate,
  approveSelectionForOffer,
  triggerAutoScreening,
} from '../controllers/applicationController.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/trigger-screening', triggerAutoScreening);
router.post('/:id/reassign', reassignCandidate);
router.post('/:id/approve-offer', approveSelectionForOffer);
router.post('/', createApplication);
router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.patch('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;