import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateDSP, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllDSPs,
  getDSPById,
  createDSP,
  updateDSP,
  deleteDSP
} from '../controllers/dspController';

const router = express.Router();

// Get all DSPs for authenticated user
router.get('/', authenticateToken, getAllDSPs);

// Get single DSP
router.get('/:id', authenticateToken, getDSPById);

// Create new DSP
router.post('/', authenticateToken, validateDSP, handleValidationErrors, createDSP);

// Update DSP
router.put('/:id', authenticateToken, validateDSP, handleValidationErrors, updateDSP);

// Delete DSP
router.delete('/:id', authenticateToken, deleteDSP);

export default router;

