import { generateText } from '../services/geminiService.js';
import User from '../models/user.js';
import Roadmap from '../models/roadmap.js';
import Checkpoint from '../models/checkpoint.js';

// ──────────────────────────────────────────────────────────────
// @desc   Generate a personalized AI study advice/summary
// @route  GET /api/ai/advice
// @access Private
// ──────────────────────────────────────────────────────────────
export const getStudyAdvice = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, roadmap, recentCheckpoints] = await Promise.all([
      User.findById(userId).select('fname streak riskLevel enrolledCourses checkpointScore'),
      Roadmap.findOne({ userId }),
      Checkpoint.find({ userId }).sort({ createdAt: -1 }).limit(5).select('subject score passed feedback'),
    ]);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Build context for Gemini
    const avgScore = recentCheckpoints.length
      ? Math.round(recentCheckpoints.reduce((a, b) => a + b.score, 0) / recentCheckpoints.length)
      : 0;

    const weakSubjects = roadmap?.progress?.filter(p => p.pct < 60).map(p => p.subject) || [];

    const prompt = `
You are StudySpark, an AI academic coach. Give a short (4–6 sentences), motivating, 
and personalized daily study advice for a student with these stats:

- Name: ${user.fname}
- Current streak: ${user.streak} days
- Risk level: ${user.riskLevel}
- Enrolled subjects: ${(user.enrolledCourses || []).join(', ') || 'None'}
- Average checkpoint score: ${avgScore}%
- Weak subjects: ${weakSubjects.join(', ') || 'None identified yet'}

Be warm, encouraging, and specific. Mention their streak. 
If they have weak subjects, gently suggest focusing on them today.
Keep the tone like a friendly mentor, not a textbook.
`.trim();

    const advice = await generateText(prompt, { temperature: 0.85 });

    res.json({ advice: advice.trim(), stats: { avgScore, streak: user.streak, weakSubjects } });
  } catch (error) {
    console.error('[AI Advice] Error:', error.message);
    res.status(500).json({ message: 'Could not generate advice. Please try again.' });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Explain a topic in simple terms using AI
// @route  POST /api/ai/explain
// @access Private
// ──────────────────────────────────────────────────────────────
export const explainTopic = async (req, res) => {
  try {
    const { topic, subject } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'topic is required.' });
    }

    const prompt = `
You are an expert CS tutor. Explain "${topic}" ${subject ? `in the context of ${subject}` : ''} 
in a clear, simple way for a university student.

Structure your response as:
1. A 2-sentence plain-English definition
2. Key concepts (3–5 bullet points)
3. A simple real-world analogy (1–2 sentences)
4. Common exam pitfalls (1–2 short points)

Be concise, accurate, and student-friendly.
`.trim();

    const explanation = await generateText(prompt, { temperature: 0.6 });

    res.json({ topic, subject, explanation: explanation.trim() });
  } catch (error) {
    console.error('[AI Explain] Error:', error.message);
    res.status(500).json({ message: 'Could not generate explanation. Please try again.' });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   AI-powered study plan for the week
// @route  GET /api/ai/study-plan
// @access Private
// ──────────────────────────────────────────────────────────────
export const getStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, roadmap] = await Promise.all([
      User.findById(userId).select('fname enrolledCourses streak riskLevel'),
      Roadmap.findOne({ userId }),
    ]);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const weakSubjects = roadmap?.progress?.filter(p => p.pct < 60).map(p => p.subject) || [];
    const currentNodes = roadmap?.nodes?.filter(n => n.status === 'current').map(n => n.topic) || [];

    const prompt = `
You are an AI academic planner. Create a concise 7-day study plan for a CS student.

Student context:
- Enrolled subjects: ${(user.enrolledCourses || []).join(', ') || 'DSA, OS, DBMS'}
- Currently studying: ${currentNodes.join(', ') || 'starting fresh'}
- Weak areas: ${weakSubjects.join(', ') || 'none identified'}
- Risk level: ${user.riskLevel}
- Study streak: ${user.streak} days

Return a JSON object (no markdown) with this structure:
{
  "plan": [
    { "day": "Monday", "tasks": ["Task 1 (subject, 1h)", "Task 2 (subject, 30min)"] },
    { "day": "Tuesday", "tasks": [...] },
    ...all 7 days...
  ],
  "focus_tip": "One most important advice for this week in 1-2 sentences."
}

Rules:
- Each day should have 2–3 tasks.
- Include subject name and estimated time in each task.
- Prioritize weak subjects.
- Include at least 1 checkpoint practice session in the week.
- Make it realistic, not overwhelming.
`.trim();

    const planData = await generateText(prompt, { temperature: 0.5 });

    // Try to parse JSON, fallback to raw text
    let plan;
    try {
      const cleaned = planData.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      plan = JSON.parse(cleaned);
    } catch {
      plan = { raw: planData.trim() };
    }

    res.json(plan);
  } catch (error) {
    console.error('[AI Study Plan] Error:', error.message);
    res.status(500).json({ message: 'Could not generate study plan. Please try again.' });
  }
};
