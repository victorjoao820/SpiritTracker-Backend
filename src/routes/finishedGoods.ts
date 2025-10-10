import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateFinishedGoods, 
  validateFinishedGoodsUpdate,
  validateBailmentDepletion,
  validateBailmentDepletionUpdate,
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllFinishedGoods,
  getFinishedGoodsById,
  createFinishedGoods,
  updateFinishedGoods,
  deleteFinishedGoods,
  getAllBailmentDepletions,
  getBailmentDepletionById,
  createBailmentDepletion,
  updateBailmentDepletion,
  deleteBailmentDepletion,
  getFinishedGoodsInventory
} from '../controllers/finishedGoodsController';

const router = express.Router();

// Finished Goods Routes
// Get all finished goods for authenticated user
router.get('/finished-goods', authenticateToken, getAllFinishedGoods);

// Get single finished goods
router.get('/finished-goods/:id', authenticateToken, getFinishedGoodsById);

// Create new finished goods
router.post('/finished-goods', authenticateToken, validateFinishedGoods, handleValidationErrors, createFinishedGoods);

// Update finished goods
router.put('/finished-goods/:id', authenticateToken, validateFinishedGoodsUpdate, handleValidationErrors, updateFinishedGoods);

// Delete finished goods
router.delete('/finished-goods/:id', authenticateToken, deleteFinishedGoods);

// Get finished goods inventory summary
router.get('/finished-goods/inventory/summary', authenticateToken, getFinishedGoodsInventory);

// Bailment Depletion Routes
// Get all bailment depletions for authenticated user
router.get('/bailment-depletions', authenticateToken, getAllBailmentDepletions);

// Get single bailment depletion
router.get('/bailment-depletions/:id', authenticateToken, getBailmentDepletionById);

// Create new bailment depletion
router.post('/bailment-depletions', authenticateToken, validateBailmentDepletion, handleValidationErrors, createBailmentDepletion);

// Update bailment depletion
router.put('/bailment-depletions/:id', authenticateToken, validateBailmentDepletionUpdate, handleValidationErrors, updateBailmentDepletion);

// Delete bailment depletion
router.delete('/bailment-depletions/:id', authenticateToken, deleteBailmentDepletion);

export default router;
