import { generateJSON } from './geminiService.js';
import Question from '../models/Question.js';

// ── Static fallback question bank ────────────────────────────────────
export const FALLBACK_QUESTIONS = {
  DSA: [
    { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1 },
    { q: 'Which data structure is used in BFS?', opts: ['Stack', 'Priority Queue', 'Queue', 'Deque'], ans: 2 },
    { q: 'What is the worst-case time complexity of QuickSort?', opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], ans: 2 },
    { q: 'Which traversal uses a stack implicitly?', opts: ['BFS', 'Level Order', 'DFS', 'Dijkstra'], ans: 2 },
    { q: 'What is the time complexity of Dijkstra with min-heap?', opts: ['O(V²)', 'O(V log V + E)', 'O(E log V)', 'O(V + E)'], ans: 1 },
    { q: 'In a min-heap, which element is at the root?', opts: ['Maximum', 'Median', 'Minimum', 'Any'], ans: 2 },
    { q: 'What is the space complexity of merge sort?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], ans: 2 },
    { q: 'Which algorithm detects a cycle in a directed graph?', opts: ['BFS', 'DFS with color marking', 'Dijkstra', 'Floyd-Warshall'], ans: 1 },
  ],
  OS: [
    { q: 'What is a deadlock?', opts: ['Process terminates', 'Two processes wait indefinitely', 'CPU stalls', 'Memory overflow'], ans: 1 },
    { q: 'Which scheduling algorithm can lead to starvation?', opts: ['FCFS', 'Round Robin', 'Priority Scheduling', 'SJF'], ans: 2 },
    { q: 'What does the OS use for memory protection?', opts: ['Registers', 'Base and Limit registers', 'Cache', 'TLB'], ans: 1 },
    { q: 'Thrashing occurs when?', opts: ['CPU is idle', 'Too many page faults occur', 'Disk is full', 'Too many threads'], ans: 1 },
    { q: 'What is the purpose of a semaphore?', opts: ['Memory allocation', 'Synchronisation between processes', 'CPU scheduling', 'File management'], ans: 1 },
    { q: 'In paging, the page table is used for?', opts: ['Tracking processes', 'Mapping logical to physical addresses', 'Disk management', 'Interrupt handling'], ans: 1 },
    { q: 'What is NOT a condition for deadlock?', opts: ['Mutual exclusion', 'Preemption allowed', 'Hold and wait', 'Circular wait'], ans: 1 },
    { q: 'Which is a non-preemptive scheduling algorithm?', opts: ['Round Robin', 'SRTF', 'FCFS', 'Preemptive Priority'], ans: 2 },
  ],
  DBMS: [
    { q: 'Which clause filters groups?', opts: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], ans: 1 },
    { q: 'What does ACID stand for?', opts: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Data', 'Atomicity, Concurrency, Isolation, Durability', 'None'], ans: 0 },
    { q: 'Which normal form removes transitive deps?', opts: ['1NF', '2NF', '3NF', 'BCNF'], ans: 2 },
    { q: 'What is a foreign key?', opts: ['A key that uniquely identifies rows', 'References primary key of another table', 'An encrypted key', 'A composite key'], ans: 1 },
    { q: 'Which SQL join returns all rows from both tables?', opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 3 },
    { q: 'What is a transaction in DBMS?', opts: ['A query', 'A unit of work that is atomic', 'A view', 'An index'], ans: 1 },
    { q: 'What does a B+ tree index improve?', opts: ['Write speed', 'Query/read speed', 'Storage', 'Network speed'], ans: 1 },
    { q: 'Which command removes all rows without logging?', opts: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], ans: 2 },
  ],
  CN: [
    { q: 'TCP stands for?', opts: ['Transmission Control Protocol', 'Transfer Control Process', 'Transaction Control Protocol', 'None'], ans: 0 },
    { q: 'Which layer handles IP addressing?', opts: ['Physical', 'Data Link', 'Network', 'Transport'], ans: 2 },
    { q: 'Default subnet mask for Class C?', opts: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], ans: 2 },
    { q: 'Which protocol resolves IP to MAC?', opts: ['DNS', 'ARP', 'DHCP', 'ICMP'], ans: 1 },
    { q: 'How many layers does OSI have?', opts: ['4', '5', '6', '7'], ans: 3 },
    { q: 'What is DNS used for?', opts: ['Data encryption', 'Domain to IP resolution', 'Error detection', 'Routing'], ans: 1 },
    { q: 'Which protocol is connectionless?', opts: ['TCP', 'FTP', 'UDP', 'HTTP'], ans: 2 },
    { q: 'What does HTTPS use for encryption?', opts: ['MD5', 'SSL/TLS', 'AES only', 'RSA only'], ans: 1 },
  ],
  Algorithms: [
    { q: 'Time complexity of merge sort?', opts: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], ans: 1 },
    { q: 'Which technique does Knapsack use?', opts: ['Greedy', 'Dynamic Programming', 'Divide & Conquer', 'Backtracking'], ans: 1 },
    { q: 'Greedy choice in Fractional Knapsack?', opts: ['Heaviest item first', 'Highest value/weight ratio', 'Lightest item first', 'Random'], ans: 1 },
    { q: "Dijkstra fails when edges have?", opts: ['High weights', 'Negative weights', 'Zero weights', 'Fractional weights'], ans: 1 },
    { q: 'Which algorithm is used for MST?', opts: ['Dijkstra', 'Bellman-Ford', 'Floyd-Warshall', "Kruskal's"], ans: 3 },
    { q: 'Recurrence for binary search?', opts: ['T(n)=2T(n/2)+1', 'T(n)=T(n-1)+1', 'T(n)=T(n/2)+1', 'T(n)=T(n)+1'], ans: 2 },
    { q: 'Topological sort uses which data structure?', opts: ['Queue', 'Stack', 'Heap', 'Array'], ans: 1 },
    { q: 'LCS stands for?', opts: ['Longest Common Sequence', 'Longest Common Subsequence', 'Least Common Set', 'Last Common String'], ans: 1 },
  ],
};

/**
 * Generate 5 checkpoint questions for a subject using Gemini AI.
 * Falls back to the static bank if AI fails.
 *
 * @param {string} subject - e.g. "DSA"
 * @param {object} ctx     - optional context: { weakTopics, lastScore }
 * @returns {Promise<Array<{q, opts, ans}>>} - Array of question objects WITH answers
 */
export async function generateAIQuestions(subject, count = 5, ctx = {}) {
  try {
    // Fetch random questions from the database for the given subject
    const questions = await Question.aggregate([
      { $match: { subject: subject } },
      { $sample: { size: count } }
    ]);

    if (questions.length > 0) {
      console.log(`[Checkpoint Service] Fetched ${questions.length} questions from DB for ${subject}`);
      // Remove Mongoose specific fields to match the expected return format
      return questions.map(q => ({
        q: q.q,
        opts: q.opts,
        ans: q.ans
      }));
    }

    console.warn(`[Checkpoint Service] No questions in DB for ${subject}. Using fallback.`);
    return pickFromFallback(subject, count);

  } catch (err) {
    console.error(`[Checkpoint Service] Error fetching questions:`, err.message);
    return pickFromFallback(subject, count);
  }
}

function pickFromFallback(subject, count) {
  const bank = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS.DSA;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default { generateAIQuestions };
