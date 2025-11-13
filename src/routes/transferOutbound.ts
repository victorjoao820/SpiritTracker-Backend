import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateTransfer, 
  validateTransferUpdate, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllTransferOutbound,
  getTransferOutboundById,
  createTransferOutbound,
  updateTransferOutbound,
  deleteTransferOutbound
} from '../controllers/transferOutboundController';

const router = express.Router();

// Get all outbound transfers for authenticated user
router.get('/', authenticateToken, getAllTransferOutbound);

// Get single outbound transfer
router.get('/:id', authenticateToken, getTransferOutboundById);

// Create new outbound transfer
router.post('/', authenticateToken, validateTransfer, handleValidationErrors, createTransferOutbound);

// Update outbound transfer
router.put('/:id', authenticateToken, validateTransferUpdate, handleValidationErrors, updateTransferOutbound);

// Delete outbound transfer
router.delete('/:id', authenticateToken, deleteTransferOutbound);

export default router;

