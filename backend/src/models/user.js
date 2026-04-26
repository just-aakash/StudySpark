import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true, trim: true },
  lname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String },
  dob: { type: Date },
  password: { type: String, minlength: 6 },
  authProvider: { type: String, enum: ['local', 'google', 'github', 'linkedin'], default: 'local' },
  education: { type: String },
  year: { type: String },
  interests: [{ type: String }],
  skills: [{ type: String }],
  improveSkills: { type: String },
  about: { type: String },
  profilePic: { type: String },

  // Gamification & progress
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date, default: null },
  enrolledCourses: { type: [String], default: [] },
  checkpointScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  focusScore: { type: Number, default: 100 },
  totalSwitches: { type: Number, default: 0 },
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otp: String,
  otpExpire: Date,
}, { timestamps: true });

// Hash password before saving (skip for OAuth users)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10*60*1000; // 10 min

  return resetToken;
};



const User = mongoose.model('User', userSchema);

export default User;
