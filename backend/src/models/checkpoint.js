import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  q: { type: String, required: true },
  opts: [{ type: String }],
  ans: { type: Number, required: true }, // index of correct option
}, { _id: false });

const checkpointSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  week: { type: String },                 // e.g. "W1", "W2" – auto-computed
  score: { type: Number, default: 0 },    // 0-100
  answers: [{ type: Number }],
  questions: [questionSchema],
  passed: { type: Boolean, default: false },
  feedback: { type: String },             // "restructure" | "targeted" | "optimize"
}, { timestamps: true });

const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);
export default Checkpoint;
