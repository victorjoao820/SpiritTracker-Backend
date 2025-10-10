import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getUserProfile,
  updateUserProfile,
  getUserDashboard
} from '../controllers/userController';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, updateUserProfile);

// Get user dashboard statistics
router.get('/dashboard', authenticateToken, getUserDashboard);

export default router;
