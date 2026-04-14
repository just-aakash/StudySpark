import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  day: { type: String, required: true },       // e.g. "Day 1–3"
  topic: { type: String, required: true },
  status: { type: String, enum: ['done', 'current', 'pending'], default: 'pending' },
  color: { type: String, default: '#00d4aa' },
}, { _id: false });

const progressSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  pct: { type: Number, default: 0 },
  done: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  color: { type: String, default: '#00d4aa' },
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: [{ type: String }],
  nodes: [nodeSchema],
  progress: [progressSchema],
}, { timestamps: true });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
