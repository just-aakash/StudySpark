import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  getAnalytics,
  getLeaderboard,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.get('/analytics', protect, getAnalytics);
router.get('/leaderboard', protect, getLeaderboard);


export default router;
