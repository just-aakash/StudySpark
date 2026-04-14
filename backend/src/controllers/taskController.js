import Task from '../models/task.js';
import User from '../models/user.js';

// Helper — get start/end of today in UTC
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Update streak on study activity
async function updateStreak(userId) {
  const user = await User.findById(userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (user.lastStudyDate) {
    const last = new Date(user.lastStudyDate);
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const diff = (today - lastDay) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      // Consecutive day
      user.streak += 1;
    } else if (diff > 1) {
      // Streak broken
      user.streak = 1;
    }
    // diff === 0 → same day, don't increment
  } else {
    user.streak = 1;
  }

  user.lastStudyDate = now;

  // Badge: 7-day streak
  if (user.streak >= 7 && !user.badges.some(b => b.name === '7-Day Streak')) {
    user.badges.push({ icon: '🔥', name: '7-Day Streak', desc: 'Studied 7 days in a row' });
  }

  await user.save();
  return user.streak;
}

// ──────────────────────────────────────────────────────────────
// @desc   Get today's tasks for the logged-in user
// @route  GET /api/tasks/today
// @access Private
// ──────────────────────────────────────────────────────────────
export const getTodaysTasks = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const tasks = await Task.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ time: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Create a new task
// @route  POST /api/tasks
// @access Private
// ──────────────────────────────────────────────────────────────
export const createTask = async (req, res) => {
  try {
    const { type, text, subject, time, date } = req.body;
    if (!text || !subject) {
      return res.status(400).json({ message: 'text and subject are required.' });
    }
    const task = await Task.create({
      userId: req.user._id,
      type: type || 'topic',
      text,
      subject,
      time: time || '9:00 AM',
      date: date ? new Date(date) : new Date(),
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Toggle a task's done state + update streak
// @route  PATCH /api/tasks/:id/toggle
// @access Private
// ──────────────────────────────────────────────────────────────
export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    task.done = !task.done;
    await task.save();

    // If marking as done, update streak
    if (task.done) {
      const streak = await updateStreak(req.user._id);
      return res.json({ task, streak });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Delete a task
// @route  DELETE /api/tasks/:id
// @access Private
// ──────────────────────────────────────────────────────────────
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
