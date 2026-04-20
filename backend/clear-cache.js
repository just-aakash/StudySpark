import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import AICache from './src/models/AICache.js';

async function clear() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  const deleted = await AICache.deleteMany({ category: 'plan' });
  console.log('Deleted cached plans:', deleted.deletedCount);
  process.exit(0);
}
clear();
