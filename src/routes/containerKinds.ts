import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getAllContainerKinds,
  getContainerKindById,
  createContainerKind,
  updateContainerKind,
  deleteContainerKind
} from '../controllers/containerKindController';

const router = Router();

// Get all container kinds for authenticated user
router.get('/', authenticateToken, getAllContainerKinds);

// Get single container kind
router.get('/:id', authenticateToken, getContainerKindById);

// Create container kind
router.post('/', authenticateToken, createContainerKind);

// Update container kind
router.put('/:id', authenticateToken, updateContainerKind);

// Delete container kind
router.delete('/:id', authenticateToken, deleteContainerKind);

export default router;

