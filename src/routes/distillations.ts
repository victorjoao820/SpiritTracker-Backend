import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateDistillationBatch, 
  validateDistillationBatchUpdate, 
  handleValidationErrors 
} from '../middleware/validation';

import {
  getAllDistillations,
  getDistillationById,
  createDistillation,
  updateDistillation,
  deleteDistillation
} from '../controllers/distillationController';

const router = express.Router();

// Distillation routes
router.get('/', authenticateToken, getAllDistillations);
router.get('/:id', authenticateToken, getDistillationById);
router.post('/', authenticateToken, validateDistillationBatch, handleValidationErrors, createDistillation);
router.put('/:id', authenticateToken, validateDistillationBatchUpdate, handleValidationErrors, updateDistillation);
router.delete('/:id', authenticateToken, deleteDistillation);

export default router;
