import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateTransaction, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  getTransactionStats
} from '../controllers/transactionController';

const router = express.Router();

// Get all transactions for authenticated user
router.get('/', authenticateToken, getAllTransactions);

// Get single transaction
router.get('/:id', authenticateToken, getTransactionById);

// Create new transaction
router.post('/', authenticateToken, validateTransaction, handleValidationErrors, createTransaction);

// Get transaction summary/statistics
router.get('/stats/summary', authenticateToken, getTransactionStats);

export default router;
