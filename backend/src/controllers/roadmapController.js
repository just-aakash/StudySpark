import Roadmap from '../models/roadmap.js';
import User from '../models/user.js';
import { generateAIRoadmap, getSubjectColor } from '../services/aiRoadmapService.js';

// Build progress entry for a subject
function buildProgress(subjectKey, nodeCount, color) {
  return {
    subject: subjectKey,
    pct: 0,
    done: 0,
    total: nodeCount,
    color,
  };
}

// ──────────────────────────────────────────────────────────────
// @desc   Generate (or re-generate) a user's roadmap
// @route  POST /api/roadmaps/generate
// @access Private
// ──────────────────────────────────────────────────────────────
export const generateRoadmap = async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one subject.' });
    }

    // Get existing roadmap to pass weak topics as context to AI
    const existing = await Roadmap.findOne({ userId: req.user._id });
    const weakTopics = existing?.progress?.filter(p => p.pct < 60).map(p => p.subject) || [];

    // Fetch user context
    const user = await User.findById(req.user._id).select('year');

    // Generate all subject roadmaps in parallel using Gemini AI
    const results = await Promise.all(
      subjects.map(s => generateAIRoadmap(s, { year: user?.year, weakTopics }))
    );

    // Flatten newly generated nodes
    const newNodes = results.flatMap(r => r.nodes);
    // Build progress for newly generated subjects
    const newProgress = subjects.map((s, i) => buildProgress(s, results[i].nodes.length, results[i].color));

    // Combine with existing data (additive)
    let finalSubjects = existing ? [...existing.subjects] : [];
    let finalNodes = existing ? [...existing.nodes] : [];
    let finalProgress = existing ? [...existing.progress] : [];

    subjects.forEach((subj) => {
      // Add subject to list if not present
      if (!finalSubjects.includes(subj)) finalSubjects.push(subj);
      
      // Remove any old nodes/progress for this specific subject so we can replace them
      finalNodes = finalNodes.filter(n => n.subject !== subj);
      finalProgress = finalProgress.filter(p => p.subject !== subj);
    });

    // Append the newly generated data
    finalNodes.push(...newNodes);
    finalProgress.push(...newProgress);

    // Upsert the roadmap document
    const roadmap = await Roadmap.findOneAndUpdate(
      { userId: req.user._id },
      { 
        userId: req.user._id, 
        subjects: finalSubjects, 
        nodes: finalNodes, 
        progress: finalProgress 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also update enrolledCourses on User to include the new subjects without deleting old ones
    await User.findByIdAndUpdate(req.user._id, { 
      $addToSet: { enrolledCourses: { $each: subjects } } 
    });

    res.status(201).json({ ...roadmap.toObject(), aiGenerated: !!process.env.GEMINI_API_KEY });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ──────────────────────────────────────────────────────────────
// @desc   Get the active roadmap for the logged-in user
// @route  GET /api/roadmaps/active
// @access Private
// ──────────────────────────────────────────────────────────────
export const getActiveRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap found. Please generate one first.' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// @desc   Update a single node's status + recalculate progress %
// @route  PATCH /api/roadmaps/node/:nodeIndex
// @access Private
// ──────────────────────────────────────────────────────────────
export const updateNodeStatus = async (req, res) => {
  try {
    const { nodeIndex } = req.params;
    const { status } = req.body;
    const idx = parseInt(nodeIndex, 10);

    if (!['done', 'current', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const roadmap = await Roadmap.findOne({ userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });
    if (idx < 0 || idx >= roadmap.nodes.length) {
      return res.status(400).json({ message: 'Invalid node index.' });
    }

    roadmap.nodes[idx].status = status;

    // Recalculate per-subject progress
    const nodeTopic = roadmap.nodes[idx].topic;
    for (const prog of roadmap.progress) {
      const subjectNodes = roadmap.nodes.filter(n => n.color === prog.color); // same color = same subject
      prog.done = subjectNodes.filter(n => n.status === 'done').length;
      prog.pct = Math.round((prog.done / prog.total) * 100);
    }

    roadmap.markModified('nodes');
    roadmap.markModified('progress');
    await roadmap.save();

    // Update overall risk level on user
    const avgPct = roadmap.progress.reduce((a, b) => a + b.pct, 0) / roadmap.progress.length;
    const riskLevel = avgPct >= 70 ? 'Low' : avgPct >= 50 ? 'Moderate' : 'High';
    await User.findByIdAndUpdate(req.user._id, { riskLevel });

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
