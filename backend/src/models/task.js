import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['topic', 'practice', 'revision'], default: 'topic' },
  text: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: String, default: '9:00 AM' },
  done: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

// Index so we can efficiently query tasks by user + date
taskSchema.index({ userId: 1, date: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
