import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateBatchingRun, 
  validateBatchingRunUpdate,
  validateBottlingRun,
  validateBottlingRunUpdate,
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllBatchingRuns,
  getBatchingRunById,
  createBatchingRun,
  updateBatchingRun,
  deleteBatchingRun,
  getAllBottlingRuns,
  getBottlingRunById,
  createBottlingRun,
  updateBottlingRun,
  deleteBottlingRun
} from '../controllers/batchingController';

const router = express.Router();

// Batching Runs Routes
// Get all batching runs for authenticated user
router.get('/batching', authenticateToken, getAllBatchingRuns);

// Get single batching run
router.get('/batching/:id', authenticateToken, getBatchingRunById);

// Create new batching run
router.post('/batching', authenticateToken, validateBatchingRun, handleValidationErrors, createBatchingRun);

// Update batching run
router.put('/batching/:id', authenticateToken, validateBatchingRunUpdate, handleValidationErrors, updateBatchingRun);

// Delete batching run
router.delete('/batching/:id', authenticateToken, deleteBatchingRun);

// Bottling Runs Routes
// Get all bottling runs for authenticated user
router.get('/bottling', authenticateToken, getAllBottlingRuns);

// Get single bottling run
router.get('/bottling/:id', authenticateToken, getBottlingRunById);

// Create new bottling run
router.post('/bottling', authenticateToken, validateBottlingRun, handleValidationErrors, createBottlingRun);

// Update bottling run
router.put('/bottling/:id', authenticateToken, validateBottlingRunUpdate, handleValidationErrors, updateBottlingRun);

// Delete bottling run
router.delete('/bottling/:id', authenticateToken, deleteBottlingRun);

export default router;
