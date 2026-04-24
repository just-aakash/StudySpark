import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, forgotPassword, verifyOTP, resetPassword } from '../controllers/authController.js';

const router = express.Router();
// ─── Standard Auth ────────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password/:token', resetPassword);

export default router;
