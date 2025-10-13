import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateTransfer,
  validateProofDown,
  validateAdjustment,
  validateBottling,
  validateAccountChange,
  handleValidationErrors 
} from '../middleware/validation';
import {
  transferSpirit,
  proofDownSpirit,
  adjustContents,
  bottleSpirit,
  changeAccount
} from '../controllers/containerOperationController';

const router = express.Router();

// Transfer spirit between containers
router.post('/transfer', authenticateToken, validateTransfer, handleValidationErrors, transferSpirit);

// Proof down spirit
router.post('/proof-down', authenticateToken, validateProofDown, handleValidationErrors, proofDownSpirit);

// Adjust container contents (sample, loss, gain)
router.post('/adjust', authenticateToken, validateAdjustment, handleValidationErrors, adjustContents);

// Bottle spirit from container
router.post('/bottle', authenticateToken, validateBottling, handleValidationErrors, bottleSpirit);

// Change container account
router.post('/change-account', authenticateToken, validateAccountChange, handleValidationErrors, changeAccount);

export default router;
