import express from 'express';
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/roadmaps/generate
// @desc    Generate a new roadmap based on user skills
// @access  Private (Mock)
router.post('/generate', (req, res) => {
    res.json({ message: 'Mock AI Roadmap Generation successful.' });
});

// @route   GET /api/roadmaps/active
// @desc    Get user's active roadmap
// @access  Private (Mock)
router.get('/active', (req, res) => {
    res.json({ message: 'Fetched active roadmap data.' });
});

export default router;
