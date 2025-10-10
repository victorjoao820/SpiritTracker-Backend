import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateTank, 
  validateTankUpdate, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllTanks,
  getTankById,
  createTank,
  updateTank,
  deleteTank,
  getTankLogs,
  createTankLog,
  getTankInventory
} from '../controllers/tankController';

const router = express.Router();

// Get all tanks for authenticated user
router.get('/', authenticateToken, getAllTanks);

// Get single tank
router.get('/:id', authenticateToken, getTankById);

// Create new tank
router.post('/', authenticateToken, validateTank, handleValidationErrors, createTank);

// Update tank
router.put('/:id', authenticateToken, validateTankUpdate, handleValidationErrors, updateTank);

// Delete tank
router.delete('/:id', authenticateToken, deleteTank);

// Get tank logs
router.get('/:tankId/logs', authenticateToken, getTankLogs);

// Create tank log
router.post('/:tankId/logs', authenticateToken, createTankLog);

// Get tank inventory summary
router.get('/inventory/summary', authenticateToken, getTankInventory);

export default router;
