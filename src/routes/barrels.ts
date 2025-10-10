import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateBarrel, 
  validateBarrelUpdate, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllBarrels,
  getBarrelById,
  createBarrel,
  updateBarrel,
  deleteBarrel,
  getBarrelLogs,
  createBarrelLog,
  getBarrelInventory
} from '../controllers/barrelController';

const router = express.Router();

// Get all barrels for authenticated user
router.get('/', authenticateToken, getAllBarrels);

// Get single barrel
router.get('/:id', authenticateToken, getBarrelById);

// Create new barrel
router.post('/', authenticateToken, validateBarrel, handleValidationErrors, createBarrel);

// Update barrel
router.put('/:id', authenticateToken, validateBarrelUpdate, handleValidationErrors, updateBarrel);

// Delete barrel
router.delete('/:id', authenticateToken, deleteBarrel);

// Get barrel logs
router.get('/:barrelId/logs', authenticateToken, getBarrelLogs);

// Create barrel log
router.post('/:barrelId/logs', authenticateToken, createBarrelLog);

// Get barrel inventory summary
router.get('/inventory/summary', authenticateToken, getBarrelInventory);

export default router;
