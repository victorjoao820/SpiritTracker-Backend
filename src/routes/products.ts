import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateProduct, 
  validateBulkProducts, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts
} from '../controllers/productController';

const router = express.Router();

// Get all products for authenticated user
router.get('/', authenticateToken, getAllProducts);

// Get single product
router.get('/:id', authenticateToken, getProductById);

// Create new product
router.post('/', authenticateToken, validateProduct, handleValidationErrors, createProduct);

// Update product
router.put('/:id', authenticateToken, validateProduct, handleValidationErrors, updateProduct);

// Delete product
router.delete('/:id', authenticateToken, deleteProduct);

// Bulk create products (for seeding default products)
router.post('/bulk', authenticateToken, validateBulkProducts, handleValidationErrors, bulkCreateProducts);

export default router;
