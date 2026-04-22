import User from '../models/user.js';
import Checkpoint from '../models/checkpoint.js';
import Task from '../models/task.js';
import Roadmap from '../models/roadmap.js';

// ──────────────────────────────────────────────────────────────
// @desc   Get the logged-in user's profile
// @route  GET /api/users/profile
// @access Private
// ──────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    // req.user is attached by protect middleware (no password)
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Update the logged-in user's profile
// @route  PATCH /api/users/profile
// @access Private
// ──────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const allowed = [
      'fname', 'lname', 'phone', 'dob', 'education',
      'year', 'interests', 'skills', 'improveSkills', 'about',
      'roll', 'branch', 'sem', 'settings', 'profilePic', 'enrolledCourses'
    ];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Get aggregated analytics for the user
// @route  GET /api/users/analytics
// @access Private
// ──────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Checkpoint history (most recent 8 sessions) 
    const sessions = await Checkpoint.find({ userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('subject week score passed feedback createdAt');

    // Reverse so oldest→newest for chart
    const checkpointHistory = sessions.reverse();

    const analyticsData = checkpointHistory.map(s => {
      const d = new Date(s.createdAt);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      return {
        label,
        score: s.score,
        subject: s.subject,
      };
    });

    // Total tasks completed (today & all time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalTasksDone, todayTasksDone, todayTasksTotal] = await Promise.all([
      Task.countDocuments({ userId, done: true }),
      Task.countDocuments({ userId, done: true, date: { $gte: today, $lt: tomorrow } }),
      Task.countDocuments({ userId, date: { $gte: today, $lt: tomorrow } }),
    ]);

    // Consistency Data: Activity (Checkpoint/Task count) per day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [ckptActivity, tskActivity] = await Promise.all([
      Checkpoint.aggregate([
        { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { userId, done: true, updatedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, count: { $sum: 1 } } }
      ])
    ]);

    const consistencyData = {};
    ckptActivity.forEach(a => consistencyData[a._id] = (consistencyData[a._id] || 0) + a.count);
    tskActivity.forEach(a => consistencyData[a._id] = (consistencyData[a._id] || 0) + a.count);

    // Roadmap progress
    const roadmap = await Roadmap.findOne({ userId });
    const completionPct = roadmap && roadmap.progress.length
      ? Math.round(roadmap.progress.reduce((a, b) => a + b.pct, 0) / roadmap.progress.length)
      : 0;

    // Weak topics: subjects with pct < 60
    const weakTopics = roadmap
      ? roadmap.progress
        .filter(p => p.pct < 60)
        .map(p => ({
          t: p.subject,
          s: p.pct,
          lvl: p.pct < 40 ? 'critical' : p.pct < 55 ? 'danger' : 'warn',
        }))
      : [];

    // Summary stats
    const avgScore = checkpointHistory.length
      ? Math.round(checkpointHistory.reduce((a, s) => a + s.score, 0) / checkpointHistory.length)
      : 0;

    // Fetch user without password to cleanly expose all dynamic properties
    const user = await User.findById(userId).select('-password');

    res.json({
      user,
      analyticsData,
      checkpointHistory,
      roadmap: roadmap || null,
      weakTopics,
      consistencyData,
      stats: {
        avgScore,
        totalTasksDone,
        todayTasksDone,
        todayTasksTotal,
        streak: user.streak,
        riskLevel: user.riskLevel,
        completionPct,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Get leaderboard (top 10 users by checkpoint score)
// @route  GET /api/users/leaderboard
// @access Private
// ──────────────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const leaders = await User.find(
      { checkpointScore: { $gt: 0 } },
      'fname lname checkpointScore streak riskLevel enrolledCourses badges branch sem'
    )
      .sort({ checkpointScore: -1, streak: -1 })
      .limit(10)
      .lean();

    const board = leaders.map((u, i) => ({
      rank: i + 1,
      name: `${u.fname} ${u.lname}`.trim(),
      branch: u.branch || 'CSE',
      sem: u.sem || '',
      score: u.checkpointScore,
      streak: u.streak,
      riskLevel: u.riskLevel,
      badgeCount: (u.badges || []).length,
      subjects: (u.enrolledCourses || []).join(', '),
      isMe: String(u._id) === String(req.user._id),
    }));

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Sync focus score and tab switches
// @route  POST /api/users/sync-focus
// @access Private
// ──────────────────────────────────────────────────────────────
export const syncFocus = async (req, res) => {
  try {
    const { score, switches } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.focusScore = score;
      user.totalSwitches = switches;
      await user.save({ validateBeforeSave: false });
      res.json({ message: 'Focus synced', score: user.focusScore, switches: user.totalSwitches });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


