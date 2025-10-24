import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateFermentationBatch, 
  validateFermentationBatchUpdate, 
  handleValidationErrors 
} from '../middleware/validation';

import {
  getAllFermentations,
  getFermentationById,
  createFermentation,
  updateFermentation,
  deleteFermentation
} from '../controllers/fermentationController';


const router = express.Router();
// Fermentation routes
router.get('/', authenticateToken, getAllFermentations);
router.get('/:id', authenticateToken, getFermentationById);
router.post('/',  authenticateToken, validateFermentationBatch, handleValidationErrors, createFermentation);
router.put('/:id', authenticateToken, validateFermentationBatchUpdate, handleValidationErrors, updateFermentation);
router.delete('/:id', authenticateToken, deleteFermentation);

export default router;
