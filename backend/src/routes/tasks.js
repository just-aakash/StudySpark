import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getTodaysTasks,
  createTask,
  toggleTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/today', protect, getTodaysTasks);
router.post('/', protect, createTask);
router.patch('/:id/toggle', protect, toggleTask);
router.delete('/:id', protect, deleteTask);

export default router;
