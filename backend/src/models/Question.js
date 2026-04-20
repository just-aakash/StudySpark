import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    index: true,
  },
  topic: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true,
  },
  q: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate questions
  },
  opts: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 4 options'],
  },
  ans: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  tags: {
    type: [String],
  }
}, { timestamps: true });

function arrayLimit(val) {
  return val.length === 4;
}

const Question = mongoose.model('Question', questionSchema);
export default Question;
