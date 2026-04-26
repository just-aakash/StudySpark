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
    // Use IST offset (+5:30) to compute the correct local-day boundaries in UTC
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowUTC = Date.now();
    const nowIST = new Date(nowUTC + IST_OFFSET_MS);
    // Today's midnight in IST, expressed as UTC
    const todayStartUTC = new Date(
      Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()) - IST_OFFSET_MS
    );
    const todayEndUTC = new Date(todayStartUTC.getTime() + 24 * 60 * 60 * 1000);

    const [totalTasksDone, todayTasksDone, todayTasksTotal] = await Promise.all([
      Task.countDocuments({ userId, done: true }),
      Task.countDocuments({ userId, done: true, date: { $gte: todayStartUTC, $lt: todayEndUTC } }),
      Task.countDocuments({ userId, date: { $gte: todayStartUTC, $lt: todayEndUTC } }),
    ]);

    // Consistency Data: Activity per day for the last 30 days, bucketed in IST
    const thirtyDaysAgo = new Date(todayStartUTC);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ckptActivity, tskActivity] = await Promise.all([
      Checkpoint.aggregate([
        { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
            count: { $sum: 1 }
          }
        }
      ]),
      Task.aggregate([
        { $match: { userId, done: true, updatedAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt', timezone: 'Asia/Kolkata' } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const consistencyData = {};
    ckptActivity.forEach(a => { consistencyData[a._id] = (consistencyData[a._id] || 0) + a.count; });
    tskActivity.forEach(a => { consistencyData[a._id] = (consistencyData[a._id] || 0) + a.count; });

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

    // Compute streak by walking back through consistencyData (same source as the calendar)
    // This guarantees the streak box always matches the calendar highlights
    const todayISTStr = [
      nowIST.getUTCFullYear(),
      String(nowIST.getUTCMonth() + 1).padStart(2, '0'),
      String(nowIST.getUTCDate()).padStart(2, '0')
    ].join('-');

    let computedStreak = 0;
    for (let i = 0; i <= 365; i++) {
      const d = new Date(nowIST);
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = [
        d.getUTCFullYear(),
        String(d.getUTCMonth() + 1).padStart(2, '0'),
        String(d.getUTCDate()).padStart(2, '0')
      ].join('-');
      if (consistencyData[dateStr] > 0) {
        computedStreak++;
      } else if (dateStr === todayISTStr) {
        // No activity today yet — don't break, still check yesterday
        continue;
      } else {
        break;
      }
    }

    // Fetch user and sync streak if it changed
    const user = await User.findById(userId).select('-password');
    if (user.streak !== computedStreak) {
      await User.findByIdAndUpdate(userId, { streak: computedStreak });
      user.streak = computedStreak;
    }

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
        streak: computedStreak,
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


