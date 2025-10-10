import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateTTBReport, 
  validateTTBReportUpdate, 
  handleValidationErrors 
} from '../middleware/validation';
import {
  getAllTTBReports,
  getTTBReportById,
  createTTBReport,
  updateTTBReport,
  deleteTTBReport,
  generateMonthlyProductionReport,
  generateMonthlyInventoryReport,
  getTTBReportStats
} from '../controllers/ttbReportController';

const router = express.Router();

// Get all TTB reports for authenticated user
router.get('/', authenticateToken, getAllTTBReports);

// Get single TTB report
router.get('/:id', authenticateToken, getTTBReportById);

// Create new TTB report
router.post('/', authenticateToken, validateTTBReport, handleValidationErrors, createTTBReport);

// Update TTB report
router.put('/:id', authenticateToken, validateTTBReportUpdate, handleValidationErrors, updateTTBReport);

// Delete TTB report
router.delete('/:id', authenticateToken, deleteTTBReport);

// Generate monthly production report
router.get('/generate/monthly-production/:year/:month', authenticateToken, generateMonthlyProductionReport);

// Generate monthly inventory report
router.get('/generate/monthly-inventory/:year/:month', authenticateToken, generateMonthlyInventoryReport);

// Get TTB report statistics
router.get('/stats/summary', authenticateToken, getTTBReportStats);

export default router;
