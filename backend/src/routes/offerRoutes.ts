import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOfferStatus,
  deleteOffer,
  sendOfferEmail,
  sendWelcomeEmail,
  downloadOfferPdf
} from '../controllers/offerController.js';

const router = express.Router();

// Public / Recruiter endpoints
router.post('/generate-pdf', downloadOfferPdf);
router.post('/send-email', sendOfferEmail);

router.use(authMiddleware);
router.post('/', createOffer);
router.post('/:id/send-email', sendOfferEmail);
router.post('/send-welcome-email', sendWelcomeEmail);
router.get('/', getAllOffers);
router.get('/:id', getOfferById);
router.patch('/:id/status', updateOfferStatus);
router.delete('/:id', deleteOffer);

export default router;