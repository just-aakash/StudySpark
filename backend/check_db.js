import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './src/models/Question.js';

dotenv.config(); // Should look in the same directory

async function check() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const count = await Question.countDocuments();
    console.log(`Total questions in DB: ${count}`);
    const subjects = await Question.distinct('subject');
    console.log(`Subjects: ${subjects.join(', ')}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
