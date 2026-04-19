import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import roadmapRoutes from './routes/roadmaps.js';
import checkpointRoutes from './routes/checkpoints.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));

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

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[ERROR] ${req.method} ${req.url} → ${status}: ${message}`);
  res.status(status).json({ message });
});

export default app;
