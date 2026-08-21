import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  publishJob,
  getPublicJob,
  getPublicJobs
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes (accessible without login)
router.get('/public', getPublicJobs);
router.get('/public/:slug', getPublicJob);
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes (require HR/Admin login for create, edit, delete)
router.use(authMiddleware);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.patch('/:id/publish', publishJob);

export default router;