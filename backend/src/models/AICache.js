import mongoose from 'mongoose';

const aiCacheSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  response: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['advice', 'explanation', 'plan', 'chat'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  // Auto-delete after 24 hours by default
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24 hours in seconds
  }
}, { timestamps: true });

const AICache = mongoose.model('AICache', aiCacheSchema);

export default AICache;
