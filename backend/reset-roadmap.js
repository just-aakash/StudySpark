import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.js';
import Roadmap from './src/models/roadmap.js';
import AICache from './src/models/AICache.js';

dotenv.config();

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const users = await User.find();
    console.log(`Found ${users.length} users. Resetting...`);

    for (const user of users) {
      console.log(`Resetting data for user: ${user.email}`);

      // Delete their roadmap
      await Roadmap.deleteMany({ userId: user._id });

      // NOTE: Do not clear enrolledCourses here – keep user’s course list intact
      // user.enrolledCourses = [];
      // await user.save();

      // Clear AI Plan cache so it regenerates
      await AICache.deleteMany({ userId: user._id, category: 'plan' });
    }
    console.log('✅ Reset complete! Restart your frontend/backend if necessary.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

reset();
