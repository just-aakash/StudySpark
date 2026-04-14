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
      'roll', 'branch', 'sem',
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

    // Weekly data — group by week label
    const weeklyMap = {};
    checkpointHistory.forEach(s => {
      if (!weeklyMap[s.week]) weeklyMap[s.week] = { scores: [], sessions: 0 };
      weeklyMap[s.week].scores.push(s.score);
      weeklyMap[s.week].sessions += 1;
    });
    const analyticsData = Object.entries(weeklyMap).map(([week, d]) => ({
      week,
      score: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
      sessions: d.sessions,
    }));

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

    const user = await User.findById(userId).select('streak riskLevel badges enrolledCourses fname lname email roll branch sem');

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

