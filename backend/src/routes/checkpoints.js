import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getCheckpointQuestions,
  submitCheckpoint,
  getCheckpointHistory,
} from '../controllers/checkpointController.js';

const router = express.Router();

// History must come before /:subject to avoid routing conflict
router.get('/history', protect, getCheckpointHistory);
router.get('/:subject', protect, getCheckpointQuestions);
router.post('/:subject/submit', protect, submitCheckpoint);

export default router;
