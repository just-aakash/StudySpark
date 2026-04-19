import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getCourses } from '../controllers/courseController.js';

const router = express.Router();

router.get('/', protect, getCourses);

export default router;
