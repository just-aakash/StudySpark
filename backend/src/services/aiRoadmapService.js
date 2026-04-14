import { generateJSON } from './geminiService.js';

// ── Static fallback templates (used when AI is unavailable) ──────────
const SUBJECT_COLORS = {
  DSA:        '#00d4aa',
  OS:         '#ef4444',
  DBMS:       '#f59e0b',
  CN:         '#a855f7',
  Algorithms: '#6366f1',
};

const SUBJECT_FALLBACK = {
  DSA: [
    { day: 'Day 1–3',   topic: 'Arrays & Strings' },
    { day: 'Day 4–6',   topic: 'Linked Lists' },
    { day: 'Day 7–9',   topic: 'Stacks & Queues' },
    { day: 'Day 10–12', topic: 'Trees & BST' },
    { day: 'Day 13–16', topic: 'Graph Algorithms' },
    { day: 'Day 17–20', topic: 'Dynamic Programming' },
    { day: 'Day 21–23', topic: 'Greedy Algorithms' },
    { day: 'Day 24–26', topic: 'Checkpoint Test 🎯' },
  ],
  OS: [
    { day: 'Day 1–2',   topic: 'Process Management' },
    { day: 'Day 3–5',   topic: 'Threads & Concurrency' },
    { day: 'Day 6–8',   topic: 'Memory Management' },
    { day: 'Day 9–11',  topic: 'File Systems' },
    { day: 'Day 12–14', topic: 'Deadlocks' },
    { day: 'Day 15–17', topic: 'CPU Scheduling' },
    { day: 'Day 18–20', topic: 'Checkpoint Test 🎯' },
  ],
  DBMS: [
    { day: 'Day 1–3',   topic: 'ER Modelling' },
    { day: 'Day 4–6',   topic: 'SQL Basics & Joins' },
    { day: 'Day 7–9',   topic: 'Normalization' },
    { day: 'Day 10–12', topic: 'Transactions & ACID' },
    { day: 'Day 13–15', topic: 'Indexing & Query Opt.' },
    { day: 'Day 16–18', topic: 'Checkpoint Test 🎯' },
  ],
  CN: [
    { day: 'Day 1–3',   topic: 'OSI & TCP/IP Model' },
    { day: 'Day 4–6',   topic: 'IP Addressing & Subnetting' },
    { day: 'Day 7–9',   topic: 'Routing Algorithms' },
    { day: 'Day 10–12', topic: 'Transport Layer (TCP/UDP)' },
    { day: 'Day 13–15', topic: 'Application Layer' },
    { day: 'Day 16–18', topic: 'Checkpoint Test 🎯' },
  ],
  Algorithms: [
    { day: 'Day 1–3',   topic: 'Sorting & Searching' },
    { day: 'Day 4–6',   topic: 'Divide & Conquer' },
    { day: 'Day 7–9',   topic: 'Greedy Strategies' },
    { day: 'Day 10–13', topic: 'Dynamic Programming' },
    { day: 'Day 14–16', topic: 'Graph Algorithms' },
    { day: 'Day 17–19', topic: 'Checkpoint Test 🎯' },
  ],
};

/**
 * Build roadmap nodes using Gemini AI.
 * Falls back to static template if AI call fails.
 *
 * @param {string} subject  - e.g. "DSA"
 * @param {object} userCtx  - optional user context: { interests, year, weakTopics }
 * @returns {Promise<{nodes: Array, color: string}>}
 */
export async function generateAIRoadmap(subject, userCtx = {}) {
  const color = SUBJECT_COLORS[subject] || '#00d4aa';

  // If no Gemini key, skip straight to fallback
  if (!process.env.GEMINI_API_KEY) {
    return buildFallback(subject, color);
  }

  const contextStr = userCtx.weakTopics?.length
    ? `The student struggled with: ${userCtx.weakTopics.join(', ')}.`
    : 'No prior performance data.';

  const prompt = `
You are an expert CS educator. Create a personalized study roadmap for the topic "${subject}" 
for a ${userCtx.year || 'undergraduate'} CS student.
${contextStr}

Return a JSON object with this EXACT structure (no markdown, no extra keys):
{
  "nodes": [
    { "day": "Day 1–3", "topic": "Topic Name" },
    { "day": "Day 4–6", "topic": "Another Topic" }
  ]
}

Rules:
- Include 6 to 9 nodes. 
- The last node MUST always be "Checkpoint Test 🎯".
- Cover all important sub-topics for "${subject}" in a logical learning order.
- Keep topic names concise (max 5 words).
- Day ranges should be realistic (1–3 days per topic).
`.trim();

  try {
    console.log(`[AI Roadmap] Requesting roadmap for "${subject}" from Gemini...`);
    const data = await generateJSON(prompt);
    if (!data?.nodes?.length) throw new Error('Empty nodes from AI');

    const nodes = data.nodes.map((n, i) => ({
      day:    n.day || `Day ${i * 3 + 1}–${i * 3 + 3}`,
      topic:  n.topic,
      status: i === 0 ? 'current' : 'pending',
      color,
    }));

    console.log(`[AI Roadmap] SUCCESS: Generated ${nodes.length} nodes for ${subject}`);
    return { nodes, color };
  } catch (err) {
    console.error(`[AI Roadmap] ERROR: Gemini failed for ${subject}:`, err.message);
    return buildFallback(subject, color);
  }
}

function buildFallback(subject, color) {
  // Use specific fallback if available, otherwise default to a generic structure
  const tpl = SUBJECT_FALLBACK[subject] || [
    { day: 'Day 1–3',   topic: `Fundamentals of ${subject}` },
    { day: 'Day 4–7',   topic: `Advanced ${subject} Concepts` },
    { day: 'Day 8–11',  topic: `${subject} in Practice` },
    { day: 'Day 12–15', topic: 'Revision & Projects' },
    { day: 'Day 16–18', topic: 'Final Review' },
    { day: 'Day 19–20', topic: 'Checkpoint Test 🎯' },
  ];
  
  const nodes = tpl.map((n, i) => ({
    day:    n.day,
    topic:  n.topic,
    status: i === 0 ? 'current' : 'pending',
    color,
  }));
  return { nodes, color };
}

export function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || '#00d4aa';
}

export default { generateAIRoadmap, getSubjectColor };
