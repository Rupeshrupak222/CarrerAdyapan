import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  updateOfferStatus,
  deleteOffer,
  sendOfferEmail,
  sendWelcomeEmail,
  downloadOfferPdf,
  getOfferByAcceptanceToken,
  acceptOfferByToken,
  rejectOfferByToken,
} from '../controllers/offerController.js';

const router = express.Router();

// Public Candidate Offer Acceptance & PDF Endpoints
router.get('/accept-token/:token', getOfferByAcceptanceToken);
router.post('/accept', acceptOfferByToken);
router.post('/reject', rejectOfferByToken);
router.post('/generate-pdf', downloadOfferPdf);
router.post('/send-email', sendOfferEmail);

// Protected Admin / HR routes
router.use(authMiddleware);
router.post('/', createOffer);
router.post('/:id/send-email', sendOfferEmail);
router.post('/send-welcome-email', sendWelcomeEmail);
router.get('/', getAllOffers);
router.get('/:id', getOfferById);
router.put('/:id', updateOffer);
router.patch('/:id/status', updateOfferStatus);
router.delete('/:id', deleteOffer);

export default router;