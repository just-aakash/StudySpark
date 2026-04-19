import { generateText, generateChat } from '../services/geminiService.js';
import User from '../models/user.js';
import Roadmap from '../models/roadmap.js';
import Checkpoint from '../models/checkpoint.js';
import AICache from '../models/AICache.js';
import crypto from 'crypto';

// ──────────────────────────────────────────────────────────────
// @desc   Generate a personalized AI study advice/summary
// @route  GET /api/ai/advice
// @access Private
// ──────────────────────────────────────────────────────────────
export const getStudyAdvice = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `advice_${userId}_${today}`;

    // 1. Check Cache First
    const cached = await AICache.findOne({ cacheKey });
    if (cached) {
      // Fetch stats again for the UI even if advice is cached
      const [user, roadmap] = await Promise.all([
        User.findById(userId).select('fname streak riskLevel'),
        Roadmap.findOne({ userId }),
      ]);
      const weakSubjects = roadmap?.progress?.filter(p => p.pct < 60).map(p => p.subject) || [];
      return res.json({ 
        advice: cached.response, 
        stats: { streak: user?.streak || 0, weakSubjects },
        fromCache: true 
      });
    }

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

    let advice;
    try {
      advice = await generateText(prompt, { temperature: 0.85 });
      
      // 2. Save to Cache
      await AICache.create({
        cacheKey,
        response: advice.trim(),
        category: 'advice',
        userId
      });
    } catch (err) {
      if (err.message === 'AI_QUOTA_EXCEEDED') {
        console.warn('[AI Advice] Quota exceeded, using fallback');
        advice = `Hey ${user.fname}! You're doing great with a ${user.streak}-day streak. Keep pushing forward! Even without AI advice today, remember that consistency is key. Focus on your ${weakSubjects[0] || 'core subjects'} and stay sharp!`;
      } else {
        throw err;
      }
    }

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

    const cleanTopic = topic.trim().toLowerCase();
    const cacheKey = `explain_${cleanTopic}_${(subject || 'general').toLowerCase()}`;

    // 1. Check Cache
    const cached = await AICache.findOne({ cacheKey });
    if (cached) {
      return res.json({ topic, subject, explanation: cached.response, fromCache: true });
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

    let explanation;
    try {
      explanation = await generateText(prompt, { temperature: 0.6 });
      
      // 2. Save to Cache
      await AICache.create({
        cacheKey,
        response: explanation.trim(),
        category: 'explanation'
      });
    } catch (err) {
      if (err.message === 'AI_QUOTA_EXCEEDED') {
        explanation = `I'm currently resting my AI brain! But basically, ${topic} is a core concept in ${subject || 'CS'}. It deals with organizing and processing information efficiently. For a detailed breakdown, please try again in a little while!`;
      } else {
        throw err;
      }
    }

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
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `plan_${userId}_${today}`;

    // 1. Check Cache
    const cached = await AICache.findOne({ cacheKey });
    if (cached) {
      return res.json({ ...JSON.parse(cached.response), fromCache: true });
    }

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
    ...all 7 days...
  ],
  "focus_tip": "Advice for this week."
}
`.trim();

    let planData;
    let plan;

    try {
      planData = await generateText(prompt, { temperature: 0.5 });
      const cleaned = planData.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      plan = JSON.parse(cleaned);

      // 2. Save to Cache
      await AICache.create({
        cacheKey,
        response: JSON.stringify(plan),
        category: 'plan',
        userId
      });
    } catch (err) {
      if (err.message === 'AI_QUOTA_EXCEEDED') {
        console.warn('[AI Study Plan] Quota exceeded, using static fallback');
        plan = {
          plan: [
            { day: "Monday", tasks: ["Review core concepts", "Practice 1 coding problem"] },
            { day: "Tuesday", tasks: ["Focus on weak topics", "Read documentation"] },
            { day: "Wednesday", tasks: ["Take a mock checkpoint", "Rest & Review"] },
            { day: "Thursday", tasks: ["Study DBMS/OS basics", "Review logic"] },
            { day: "Friday", tasks: ["Apply theory to code", "Group study session"] },
            { day: "Saturday", tasks: ["Weekly revision", "Solve previous errors"] },
            { day: "Sunday", tasks: ["Weekly Wrap-up", "Prepare for next week"] }
          ],
          focus_tip: "Consistency is better than intensity. Keep your streak alive!"
        };
      } else {
        throw err;
      }
    }

    res.json(plan);
  } catch (error) {
    console.error('[AI Study Plan] Error:', error.message);
    res.status(500).json({ message: 'Could not generate study plan. Please try again.' });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Interactive Chat with AI Tutor
// @route  POST /api/ai/chat
// @access Private
// ──────────────────────────────────────────────────────────────
export const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user._id;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages array is required.' });
    }

    const user = await User.findById(userId).select('fname enrolledCourses');
    
    // Provide system context
    const systemPromptMessage = {
      role: 'user',
      text: `[SYSTEM Context (Do not reply directly to this message)] You are StudySpark, a 24/7 AI tutor and mentor. You are talking to a student named ${user?.fname || 'Student'}. Their enrolled courses are ${(user?.enrolledCourses || []).join(', ') || 'general subjects'}. Be concise, helpful, friendly, and act as their mentor.`
    };

    const aiAcknowledgeMessage = {
      role: 'model',
      text: 'Understood. I am StudySpark, your AI tutor. How can I help?'
    };

    const fullHistory = [systemPromptMessage, aiAcknowledgeMessage, ...messages];
    
    const reply = await generateChat(fullHistory, { temperature: 0.7 });

    res.json({ reply: reply.trim() });
  } catch (error) {
    console.error('[AI Chat] Error:', error.message);
    res.status(500).json({ message: 'Could not get response from AI Chat.' });
  }
};
