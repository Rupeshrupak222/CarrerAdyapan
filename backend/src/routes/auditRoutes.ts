import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAuditLogs } from '../controllers/auditController.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAuditLogs);

export default router;
