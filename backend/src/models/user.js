import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dob: { type: Date },
  password: { type: String, required: true },
  education: { type: String },
  year: { type: String },
  interests: [{ type: String }],
  skills: [{ type: String }],
  improveSkills: { type: String },
  about: { type: String },
  profilePic: { type: String },

  // Gamification & progress
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
  riskLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Low' },
  checkpointScore: { type: Number, default: 0 },

  // Courses & badges
  enrolledCourses: [{ type: String }],
  badges: [{
    icon: String,
    name: String,
    desc: String,
    earnedAt: { type: Date, default: Date.now },
  }],

  // Roll / branch (used for display)
  roll: { type: String },
  branch: { type: String },
  sem: { type: String },

  // User Settings (Theme, Notifications)
  settings: {
    theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
    notifications: {
      "Checkpoint Reminders": { type: Boolean, default: true },
      "Daily Study Alerts": { type: Boolean, default: true },
      "Streak Notifications": { type: Boolean, default: true },
      "Weak Topic Alerts": { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
