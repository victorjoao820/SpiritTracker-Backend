import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateProductionBatch, 
  validateProductionBatchUpdate, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllProductionBatches,
  getProductionBatchById,
  createProductionBatch,
  updateProductionBatch,
  deleteProductionBatch
} from '../controllers/productionController';

const router = express.Router();

// Get all production batches for authenticated user
router.get('/', authenticateToken, getAllProductionBatches);

// Get single production batch
router.get('/:id', authenticateToken, getProductionBatchById);

// Create new production batch
router.post('/', authenticateToken, validateProductionBatch, handleValidationErrors, createProductionBatch);

// Update production batch
router.put('/:id', authenticateToken, validateProductionBatchUpdate, handleValidationErrors, updateProductionBatch);

// Delete production batch
router.delete('/:id', authenticateToken, deleteProductionBatch);

export default router;
