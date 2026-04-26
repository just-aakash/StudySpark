import Session from "../models/session.js";

export const saveSession = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const data = req.body;

    const session = await Session.findOneAndUpdate(
      { userId },
      { ...data, userId, timestamp: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Save session error:", err);
    res.status(500).json({ error: "Failed to save session" });
  }
};

export const getSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await Session.findOne({ userId });

    res.json(session || null);
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

export const clearSession = async (req, res) => {
  try {
    const userId = req.user.id;

    await Session.deleteOne({ userId });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear session" });
  }
};