import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateTransfer, 
  validateTransferUpdate, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllTransferInbound,
  getTransferInboundById,
  createTransferInbound,
  updateTransferInbound,
  deleteTransferInbound
} from '../controllers/transferInboundController';

const router = express.Router();

// Get all inbound transfers for authenticated user
router.get('/', authenticateToken, getAllTransferInbound);

// Get single inbound transfer
router.get('/:id', authenticateToken, getTransferInboundById);

// Create new inbound transfer
router.post('/', authenticateToken, validateTransfer, handleValidationErrors, createTransferInbound);

// Update inbound transfer
router.put('/:id', authenticateToken, validateTransferUpdate, handleValidationErrors, updateTransferInbound);

// Delete inbound transfer
router.delete('/:id', authenticateToken, deleteTransferInbound);

export default router;

