import express from 'express';
import { register, login, getCurrentUser, updateProfile, changePassword, createHRUser, getAllUsers, deleteUser, updateHRPassword } from '../controllers/authController.js';
import { universalLogin } from '../controllers/candidateAuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', universalLogin);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);

// Admin-Managed HR Account Creation & User Management Routes
router.post('/create-hr-user', authMiddleware, createHRUser);
router.get('/users', authMiddleware, getAllUsers);
router.put('/users/:id/password', authMiddleware, updateHRPassword);
router.delete('/users/:id', authMiddleware, deleteUser);

export default router;