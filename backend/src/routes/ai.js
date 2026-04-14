import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getStudyAdvice, explainTopic, getStudyPlan } from '../controllers/aiController.js';

const router = express.Router();

// All AI routes require authentication
router.get('/advice',     protect, getStudyAdvice);
router.post('/explain',   protect, explainTopic);
router.get('/study-plan', protect, getStudyPlan);

export default router;
