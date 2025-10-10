import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateTransfer, 
  validateTransferUpdate, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  getTransferStats
} from '../controllers/transferController';

const router = express.Router();

// Get all transfers for authenticated user
router.get('/', authenticateToken, getAllTransfers);

// Get single transfer
router.get('/:id', authenticateToken, getTransferById);

// Create new transfer
router.post('/', authenticateToken, validateTransfer, handleValidationErrors, createTransfer);

// Update transfer
router.put('/:id', authenticateToken, validateTransferUpdate, handleValidationErrors, updateTransfer);

// Delete transfer
router.delete('/:id', authenticateToken, deleteTransfer);

// Get transfer summary/statistics
router.get('/stats/summary', authenticateToken, getTransferStats);

export default router;
