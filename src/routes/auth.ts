import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
} from '../controllers/authController';

const router = Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Refresh token
router.post('/refresh', refreshToken);

export default router;
