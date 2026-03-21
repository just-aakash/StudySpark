import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import roadmapRoutes from './routes/roadmaps.js';
import checkpointRoutes from './routes/checkpoints.js';

// Load environment variables (from the root backend folder)
dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/checkpoints', checkpointRoutes);

// Base route to verify server health
app.get('/', (req, res) => {
  res.send('StudySpark API is running with Enterprise Architecture 🚀');
});

// Error handling middlewares could be registered down here

export default app;
