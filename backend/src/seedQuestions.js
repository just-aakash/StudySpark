import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './models/Question.js';
import { FALLBACK_QUESTIONS } from './services/aiCheckpointService.js';

dotenv.config({ path: '../.env' }); // Adjust if needed depending on where script runs from

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/studyspark';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    let totalInserted = 0;

    for (const [subject, questionsArray] of Object.entries(FALLBACK_QUESTIONS)) {
      console.log(`Processing ${subject}...`);
      
      for (const item of questionsArray) {
        try {
          // Check if question already exists to avoid duplicate key errors
          const existing = await Question.findOne({ q: item.q });
          if (!existing) {
            await Question.create({
              subject: subject,
              difficulty: 'medium', // Defaulting to medium for fallback questions
              q: item.q,
              opts: item.opts,
              ans: item.ans,
              tags: [subject.toLowerCase()]
            });
            totalInserted++;
          }
        } catch (err) {
          console.error(`Failed to insert question: "${item.q}"`, err.message);
        }
      }
    }

    console.log(`✅ Seeding complete! Successfully inserted ${totalInserted} new questions.`);
  } catch (error) {
    console.error('❌ Database connection or seeding error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
