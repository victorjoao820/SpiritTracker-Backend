import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getAllFermenters,
  getFermenterById,
  createFermenter,
  updateFermenter,
  deleteFermenter,
} from '../controllers/fermenterController';

const router = Router();

// Get all fermenters for authenticated user
router.get('/', authenticateToken, getAllFermenters);

// Get single fermenter
router.get('/:id', authenticateToken, getFermenterById);

// Create fermenter
router.post('/', authenticateToken, createFermenter);

// Update fermenter
router.put('/:id', authenticateToken, updateFermenter);

// Delete fermenter
router.delete('/:id', authenticateToken, deleteFermenter);

export default router;

