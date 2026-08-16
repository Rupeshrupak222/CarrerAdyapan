import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  publishJob,
  getPublicJob
} from '../controllers/jobController.js';

const router = express.Router();

// Public route
router.get('/public/:slug', getPublicJob);

// Protected routes
router.use(authMiddleware);
router.post('/', createJob);
router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.patch('/:id/publish', publishJob);

export default router;