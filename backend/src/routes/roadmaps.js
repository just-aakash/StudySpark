import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  generateRoadmap,
  getActiveRoadmap,
  updateNodeStatus,
} from '../controllers/roadmapController.js';

const router = express.Router();

// All roadmap routes require authentication
router.post('/generate', protect, generateRoadmap);
router.get('/active', protect, getActiveRoadmap);
router.patch('/node/:nodeIndex', protect, updateNodeStatus);

export default router;
