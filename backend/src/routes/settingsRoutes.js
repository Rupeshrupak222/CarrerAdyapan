import express from 'express';
import { getGlobalTemplate, saveGlobalTemplate } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/template', getGlobalTemplate);
router.post('/template', saveGlobalTemplate);

export default router;
