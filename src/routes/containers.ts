import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateContainer, 
  validateContainerUpdate,
  validateBulkContainers, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllContainers,
  getContainerById,
  createContainer,
  updateContainer,
  deleteContainer,
  bulkCreateContainers
} from '../controllers/containerController.js';

const router = Router();

// Get all containers for authenticated user
router.get('/', authenticateToken, getAllContainers);

// Get single container
router.get('/:id', authenticateToken, getContainerById);

// Create new container
router.post('/', authenticateToken, validateContainer, handleValidationErrors, createContainer);

// Update container
router.put('/:id', authenticateToken, validateContainerUpdate, handleValidationErrors, updateContainer);

// Delete container
router.delete('/:id', authenticateToken, deleteContainer);

// Bulk create containers (for import functionality)
router.post('/bulk', authenticateToken, validateBulkContainers, handleValidationErrors, bulkCreateContainers);

export default router;
