import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
