import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  tasks: { type: Array, default: [] },
  testState: { type: Object, default: {} },
  testQuestions: { type: Array, default: [] },
  roadPath: { type: Array, default: [] },
  active: { type: String, default: "dashboard" },

  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Session", sessionSchema);