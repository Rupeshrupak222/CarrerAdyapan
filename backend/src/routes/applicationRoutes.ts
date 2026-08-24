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
  runAtsCheck,
  getAtsResult,
  bulkRunAtsCheck,
  manualShortlistCandidate,
  manualRejectCandidate,
  bulkShortlistCandidates,
  bulkRejectCandidates,
  assignHrSpecialist,
  getWorkloadStats,
  getManagerStats,
  getFinalRoundSelected,
  sendOfficialOffer,
  getCommunicationHistory,
  getHiringReports,
} from '../controllers/applicationController.js';

const router = express.Router();

router.use(authMiddleware);

// Real Database Executive Manager Pipeline Metrics
router.get('/manager-stats', getManagerStats);

// On-Demand Individual & Bulk ATS Evaluation
router.post('/bulk-ats-check', bulkRunAtsCheck);
router.post('/:id/ats-check', runAtsCheck);
router.get('/:id/ats-result', getAtsResult);
router.post('/:id/ats-rerun', runAtsCheck);

// Manual Decision Actions (Screening & Approvals)
router.post('/:id/shortlist', manualShortlistCandidate);
router.post('/:id/reject', manualRejectCandidate);
router.post('/bulk-shortlist', bulkShortlistCandidates);
router.post('/bulk-reject', bulkRejectCandidates);

// Workload Distribution & HR Assignment (1-to-1 strict assignment)
router.post('/:id/assign-hr', assignHrSpecialist);
router.post('/:id/reassign', reassignCandidate);
router.get('/workload/stats', getWorkloadStats);

// Final Round Selected & Offer Release
router.get('/final-selected/list', getFinalRoundSelected);
router.post('/:id/send-offer', sendOfficialOffer);
router.post('/:id/approve-offer', approveSelectionForOffer);

// Communications History & Reports
router.get('/communications/history', getCommunicationHistory);
router.get('/reports/hiring-funnel', getHiringReports);

// Standard CRUD
router.post('/trigger-screening', triggerAutoScreening);
router.post('/', createApplication);
router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.patch('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;