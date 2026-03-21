import express from 'express';
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/checkpoints/:id
// @desc    Get questions for a checkpoint
// @access  Private (Mock)
router.get('/:id', (req, res) => {
    res.json({ message: `Fetched questions for checkpoint ${req.params.id}`});
});

// @route   POST /api/checkpoints/:id/evaluate
// @desc    Evaluate checkpoint answers
// @access  Private (Mock)
router.post('/:id/evaluate', (req, res) => {
    res.json({ message: `Evaluated answers for checkpoint ${req.params.id}` });
});

export default router;
