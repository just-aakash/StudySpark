import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, forgotPassword, verifyOTP, resetPassword } from '../controllers/authController.js';

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper: generate JWT and redirect to frontend
const oauthSuccess = (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const user = encodeURIComponent(JSON.stringify({
    _id: req.user._id,
    fname: req.user.fname,
    email: req.user.email,
    token,
  }));
  res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}&user=${user}`);
};

const oauthFail = (req, res) => res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);

// ─── Standard Auth ────────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password/:token', resetPassword);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  oauthSuccess
);

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  oauthSuccess
);

// ─── LinkedIn OAuth ───────────────────────────────────────────────────────────
router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  oauthSuccess
);

export default router;
