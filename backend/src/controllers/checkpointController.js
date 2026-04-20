import Checkpoint from '../models/checkpoint.js';
import User from '../models/user.js';
import Question from '../models/Question.js';
import { generateAIQuestions, FALLBACK_QUESTIONS } from '../services/aiCheckpointService.js';

// Compute week label (W1, W2...) based on how many sessions the user has done
function computeWeekLabel(count) {
  return `W${count + 1}`;
}

// ──────────────────────────────────────────────────────────────
// @desc   Get 5 AI-generated questions for a checkpoint
// @route  GET /api/checkpoints/:subject
// @access Private
// ──────────────────────────────────────────────────────────────
export const getCheckpointQuestions = async (req, res) => {
  try {
    const { subject } = req.params;

    // Pull user's last score to tune AI difficulty
    const lastSession = await Checkpoint.findOne(
      { userId: req.user._id, subject },
      {},
      { sort: { createdAt: -1 } }
    );
    const lastScore = lastSession?.score ?? null;

    // Generate via AI (with fallback)
    const questions = await generateAIQuestions(subject, 5, { lastScore });

    if (!questions.length) {
      return res.status(404).json({ message: 'No questions found for this subject.' });
    }

    // Return questions WITHOUT the answer key to the client
    const safeQuestions = questions.map(({ q, opts }) => ({ q, opts }));
    res.json({ subject, questions: safeQuestions, aiGenerated: !!process.env.GEMINI_API_KEY });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Submit checkpoint answers and evaluate
// @route  POST /api/checkpoints/:subject/submit
// @access Private
// ──────────────────────────────────────────────────────────────
export const submitCheckpoint = async (req, res) => {
  try {
    const { subject } = req.params;
    const { answers, questions: clientQuestions } = req.body;

    if (!answers || !clientQuestions) {
      return res.status(400).json({ message: 'answers and questions are required.' });
    }

    // Extract question texts
    const questionTexts = clientQuestions.map(cq => cq.q);

    // Fetch authoritative questions with correct answers from DB
    const dbQuestions = await Question.find({ q: { $in: questionTexts } });

    // Match client questions against server-authoritative questions
    const matched = clientQuestions.map(cq => {
      // Find in DB first
      const dbQ = dbQuestions.find(bq => bq.q === cq.q);
      if (dbQ) return dbQ;
      
      // Fallback in case DB is not seeded or question was from old fallback
      const fbBank = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS.DSA;
      return fbBank.find(bq => bq.q === cq.q);
    }).filter(Boolean);

    const correct = answers.filter((a, i) => matched[i] && a === matched[i].ans).length;
    const total = matched.length || answers.length || 1;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 50;
    const feedback = pct >= 70 ? 'optimize' : pct >= 50 ? 'targeted' : 'restructure';

    // Count prior sessions for week label
    const prior = await Checkpoint.countDocuments({ userId: req.user._id, subject });
    const week = computeWeekLabel(prior);

    const session = await Checkpoint.create({
      userId: req.user._id,
      subject,
      week,
      score: pct,
      answers,
      questions: matched,
      passed,
      feedback,
    });

    // Update user's overall checkpointScore (running average) and riskLevel
    const allSessions = await Checkpoint.find({ userId: req.user._id });
    const avgScore = allSessions.length > 0
      ? Math.round(allSessions.reduce((a, s) => a + s.score, 0) / allSessions.length)
      : pct;
    const riskLevel = avgScore >= 70 ? 'low' : avgScore >= 50 ? 'medium' : 'high';

    // Badge logic — award "Top Scorer" if score >= 80
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.badges) user.badges = [];
    if (pct >= 80 && !user.badges.some(b => b.name === 'Top Scorer')) {
      user.badges.push({ icon: '🏆', name: 'Top Scorer', desc: 'Scored 80%+ in a checkpoint' });
    }
    user.checkpointScore = avgScore;
    user.riskLevel = riskLevel;
    await user.save();

    res.status(201).json({
      session,
      score: pct,
      correct,
      total,
      passed,
      feedback,
    });
  } catch (error) {
    console.error('Submit Checkpoint Fatal Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Get checkpoint history for the user (all subjects)
// @route  GET /api/checkpoints/history
// @access Private
// ──────────────────────────────────────────────────────────────
export const getCheckpointHistory = async (req, res) => {
  try {
    const history = await Checkpoint.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('subject week score passed feedback createdAt');
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
