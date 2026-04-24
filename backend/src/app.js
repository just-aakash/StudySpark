import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport.js';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import roadmapRoutes from './routes/roadmaps.js';
import checkpointRoutes from './routes/checkpoints.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import courseRoutes from './routes/courses.js';
import contactRoutes from './routes/contact.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://studyspark.pages.dev',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'studyspark_session_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/', (req, res) => {
  res.send('StudySpark API is running 🚀');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/contact', contactRoutes);

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[ERROR] ${req.method} ${req.url} → ${status}: ${message}`);
  res.status(status).json({ message });
});

export default app;