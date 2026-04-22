import { generateJSON } from './geminiService.js';
import Question from '../models/Question.js';

// ── Static fallback question bank ────────────────────────────────────
export const FALLBACK_QUESTIONS = {
  dsa: [
    { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1 },
    { q: 'Which data structure is used in BFS?', opts: ['Stack', 'Priority Queue', 'Queue', 'Deque'], ans: 2 },
    { q: 'What is the worst-case time complexity of QuickSort?', opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], ans: 2 },
    { q: 'Which traversal uses a stack implicitly?', opts: ['BFS', 'Level Order', 'DFS', 'Dijkstra'], ans: 2 },
    { q: 'What is the time complexity of Dijkstra with min-heap?', opts: ['O(V²)', 'O(V log V + E)', 'O(E log V)', 'O(V + E)'], ans: 1 },
    { q: 'In a min-heap, which element is at the root?', opts: ['Maximum', 'Median', 'Minimum', 'Any'], ans: 2 },
    { q: 'What is the space complexity of merge sort?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], ans: 2 },
    { q: 'Which algorithm detects a cycle in a directed graph?', opts: ['BFS', 'DFS with color marking', 'Dijkstra', 'Floyd-Warshall'], ans: 1 },
    { q: 'What is the time complexity of building a heap?', opts: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], ans: 0 },
    { q: 'Which data structure is best for implementing a LRU cache?', opts: ['Array', 'Stack', 'Queue + HashMap', 'Hash Map + Doubly Linked List'], ans: 3 },
  ],
  os: [
    { q: 'What is a deadlock?', opts: ['Process terminates', 'Two processes wait indefinitely', 'CPU stalls', 'Memory overflow'], ans: 1 },
    { q: 'Which scheduling algorithm can lead to starvation?', opts: ['FCFS', 'Round Robin', 'Priority Scheduling', 'SJF'], ans: 2 },
    { q: 'What does the OS use for memory protection?', opts: ['Registers', 'Base and Limit registers', 'Cache', 'TLB'], ans: 1 },
    { q: 'Thrashing occurs when?', opts: ['CPU is idle', 'Too many page faults occur', 'Disk is full', 'Too many threads'], ans: 1 },
    { q: 'What is the purpose of a semaphore?', opts: ['Memory allocation', 'Synchronisation between processes', 'CPU scheduling', 'File management'], ans: 1 },
    { q: 'In paging, the page table is used for?', opts: ['Tracking processes', 'Mapping logical to physical addresses', 'Disk management', 'Interrupt handling'], ans: 1 },
    { q: 'What is NOT a condition for deadlock?', opts: ['Mutual exclusion', 'Preemption allowed', 'Hold and wait', 'Circular wait'], ans: 1 },
    { q: 'Which is a non-preemptive scheduling algorithm?', opts: ['Round Robin', 'SRTF', 'FCFS', 'Preemptive Priority'], ans: 2 },
    { q: 'What is a critical section?', opts: ['A part of a program that accesses shared resources', 'A part of memory', 'A CPU register', 'A kernel module'], ans: 0 },
    { q: 'Which of the following is an example of a real-time OS?', opts: ['Windows 10', 'macOS', 'VxWorks', 'Ubuntu'], ans: 2 },
  ],
  dbms: [
    { q: 'Which clause filters groups?', opts: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], ans: 1 },
    { q: 'What does ACID stand for?', opts: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Data', 'Atomicity, Concurrency, Isolation, Durability', 'None'], ans: 0 },
    { q: 'Which normal form removes transitive deps?', opts: ['1NF', '2NF', '3NF', 'BCNF'], ans: 2 },
    { q: 'What is a foreign key?', opts: ['A key that uniquely identifies rows', 'References primary key of another table', 'An encrypted key', 'A composite key'], ans: 1 },
    { q: 'Which SQL join returns all rows from both tables?', opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 3 },
    { q: 'What is a transaction in DBMS?', opts: ['A query', 'A unit of work that is atomic', 'A view', 'An index'], ans: 1 },
    { q: 'What does a B+ tree index improve?', opts: ['Write speed', 'Query/read speed', 'Storage', 'Network speed'], ans: 1 },
    { q: 'Which command removes all rows without logging?', opts: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], ans: 2 },
    { q: 'Which level of abstraction describes HOW data is stored?', opts: ['Physical level', 'Logical level', 'View level', 'None'], ans: 0 },
    { q: 'What is a composite key?', opts: ['A key with multiple columns', 'A primary key', 'A unique key', 'A foreign key'], ans: 0 },
  ],
  cn: [
    { q: 'TCP stands for?', opts: ['Transmission Control Protocol', 'Transfer Control Process', 'Transaction Control Protocol', 'None'], ans: 0 },
    { q: 'Which layer handles IP addressing?', opts: ['Physical', 'Data Link', 'Network', 'Transport'], ans: 2 },
    { q: 'Default subnet mask for Class C?', opts: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], ans: 2 },
    { q: 'Which protocol resolves IP to MAC?', opts: ['DNS', 'ARP', 'DHCP', 'ICMP'], ans: 1 },
    { q: 'How many layers does OSI have?', opts: ['4', '5', '6', '7'], ans: 3 },
    { q: 'What is DNS used for?', opts: ['Data encryption', 'Domain to IP resolution', 'Error detection', 'Routing'], ans: 1 },
    { q: 'Which protocol is connectionless?', opts: ['TCP', 'FTP', 'UDP', 'HTTP'], ans: 2 },
    { q: 'What does HTTPS use for encryption?', opts: ['MD5', 'SSL/TLS', 'AES only', 'RSA only'], ans: 1 },
    { q: 'What is the maximum data rate of a standard Ethernet?', opts: ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps'], ans: 0 },
    { q: 'Which layer of the OSI model is responsible for data compression?', opts: ['Session', 'Presentation', 'Application', 'Transport'], ans: 1 },
  ],
  webdev: [
    { q: 'What does HTML stand for?', opts: ['HyperText Markup Language', 'HyperTech Modern Language', 'HyperText Model Language', 'None'], ans: 0 },
    { q: 'Which CSS property changes text color?', opts: ['text-color', 'font-color', 'color', 'background-color'], ans: 2 },
    { q: 'What is the purpose of React useEffect?', opts: ['Managing state', 'Handling side effects', 'Rendering components', 'Routing'], ans: 1 },
    { q: 'Which tag is used for an external JavaScript file?', opts: ['<javascript>', '<script>', '<js>', '<link>'], ans: 1 },
    { q: 'What does CSS stand for?', opts: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'None'], ans: 1 },
    { q: 'Which HTTP method is used to create data?', opts: ['GET', 'POST', 'PUT', 'DELETE'], ans: 1 },
    { q: 'What is a closure in JavaScript?', opts: ['A function with its lexical environment', 'A private variable', 'A way to close a file', 'None'], ans: 0 },
    { q: 'What is the virtual DOM?', opts: ['A real copy of the DOM', 'A lightweight copy of the DOM in memory', 'A browser feature', 'None'], ans: 1 },
    { q: 'Which operator is used for strict equality?', opts: ['=', '==', '===', '!=='], ans: 2 },
    { q: 'What does JSON stand for?', opts: ['JavaScript Object Notation', 'Java Standard Object Notation', 'Joint Script Object Network', 'None'], ans: 0 },
  ],
  ml: [
    { q: 'What is supervised learning?', opts: ['Learning from labeled data', 'Learning from unlabeled data', 'Learning by doing', 'None'], ans: 0 },
    { q: 'What is overfitting?', opts: ['Model performs well on training but poor on test data', 'Model performs poor on both', 'Model is too simple', 'None'], ans: 0 },
    { q: 'Which library is commonly used for data manipulation in Python?', opts: ['NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow'], ans: 1 },
    { q: 'What is a neuron in a neural network?', opts: ['A biological cell', 'A mathematical function', 'A hardware component', 'None'], ans: 1 },
    { q: 'What is the purpose of an activation function?', opts: ['To add non-linearity', 'To speed up training', 'To reduce memory', 'None'], ans: 0 },
    { q: 'What is K-means clustering?', opts: ['A supervised learning algorithm', 'An unsupervised learning algorithm', 'A reinforcement learning algorithm', 'None'], ans: 1 },
    { q: 'What does "gradient" in Gradient Descent represent?', opts: ['Slope of the loss function', 'The final error', 'The learning rate', 'None'], ans: 0 },
    { q: 'Which is a popular library for Deep Learning?', opts: ['Pandas', 'Matplotlib', 'PyTorch', 'NLTK'], ans: 2 },
    { q: 'What is the goal of linear regression?', opts: ['To classify data', 'To predict a continuous value', 'To group similar data', 'None'], ans: 1 },
    { q: 'What is a confusion matrix used for?', opts: ['Evaluating classification models', 'Evaluating regression models', 'Clustering', 'None'], ans: 0 },
  ],
  java: [
    { q: 'Which keyword is used to create an object in Java?', opts: ['create', 'new', 'alloc', 'init'], ans: 1 },
    { q: 'What is the base class for all Java classes?', opts: ['Main', 'Base', 'Object', 'Root'], ans: 2 },
    { q: 'Which modifier makes a variable unchangeable?', opts: ['static', 'final', 'const', 'fixed'], ans: 1 },
    { q: 'What is JVM?', opts: ['Java Visual Machine', 'Java Virtual Machine', 'Java Variable Manager', 'None'], ans: 1 },
    { q: 'Which data structure is thread-safe in Java?', opts: ['ArrayList', 'HashMap', 'Vector', 'HashSet'], ans: 2 },
    { q: 'What is inheritance?', opts: ['Passing properties from parent to child', 'Hiding data', 'Multiple forms of a method', 'None'], ans: 0 },
    { q: 'What is the purpose of "static" keyword?', opts: ['To make a variable constant', 'To associate a member with the class itself', 'To make it private', 'None'], ans: 1 },
    { q: 'Which package is imported by default?', opts: ['java.util', 'java.io', 'java.lang', 'java.net'], ans: 2 },
    { q: 'What is an interface?', opts: ['A class with methods', 'A blueprint for a class with abstract methods', 'A way to create UI', 'None'], ans: 1 },
    { q: 'How do you handle exceptions in Java?', opts: ['if-else', 'try-catch', 'throw-catch', 'None'], ans: 1 },
  ],
  python: [
    { q: 'Which keyword is used to define a function in Python?', opts: ['func', 'def', 'define', 'function'], ans: 1 },
    { q: 'What is the extension of Python files?', opts: ['.pt', '.py', '.pyt', '.txt'], ans: 1 },
    { q: 'How do you create a list in Python?', opts: ['{}', '[]', '()', '<>'], ans: 1 },
    { q: 'What is a dictionary in Python?', opts: ['A list of words', 'A collection of key-value pairs', 'A set of unique values', 'None'], ans: 1 },
    { q: 'Which function is used to get the length of a list?', opts: ['length()', 'size()', 'len()', 'count()'], ans: 2 },
    { q: 'Is Python indentation-sensitive?', opts: ['Yes', 'No', 'Only for loops', 'Only for classes'], ans: 0 },
    { q: 'How do you start a comment in Python?', opts: ['//', '/*', '#', '--'], ans: 2 },
    { q: 'What is the purpose of "pip"?', opts: ['To run Python code', 'To install Python packages', 'To debug code', 'None'], ans: 1 },
    { q: 'Which of the following is an immutable data type?', opts: ['List', 'Dictionary', 'Tuple', 'Set'], ans: 2 },
    { q: 'How do you import a module?', opts: ['include', 'require', 'import', 'load'], ans: 2 },
  ],
  cloud: [
    { q: 'What does AWS stand for?', opts: ['Amazon Web Services', 'Amazon Web Solutions', 'Advanced Web Services', 'None'], ans: 0 },
    { q: 'What is Docker?', opts: ['A virtual machine', 'A platform for containerization', 'A cloud provider', 'None'], ans: 1 },
    { q: 'What is S3 in AWS?', opts: ['Simple Storage Service', 'Scalable Storage System', 'Secure Storage Solution', 'None'], ans: 0 },
    { q: 'What is the purpose of Kubernetes?', opts: ['To build images', 'To orchestrate containers', 'To host websites', 'None'], ans: 1 },
    { q: 'What is serverless computing?', opts: ['Computing without servers', 'Running code without managing servers', 'Using physical servers', 'None'], ans: 1 },
    { q: 'What is a Region in cloud computing?', opts: ['A specific data center', 'A geographic area with multiple AZs', 'A single rack of servers', 'None'], ans: 1 },
    { q: 'Which service is used for virtual servers in AWS?', opts: ['S3', 'Lambda', 'EC2', 'RDS'], ans: 2 },
    { q: 'What is the benefit of cloud computing?', opts: ['Costly', 'Scalability and pay-as-you-go', 'Less security', 'Manual maintenance'], ans: 1 },
    { q: 'What is a VPC?', opts: ['Virtual Public Cloud', 'Virtual Private Cloud', 'Variable Private Cloud', 'None'], ans: 1 },
    { q: 'What is CI/CD?', opts: ['Continuous Integration / Continuous Deployment', 'Code Integration / Code Delivery', 'Cloud Integration / Cloud Deployment', 'None'], ans: 0 },
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
      { $match: { subject: { $regex: new RegExp(`^${subject}$`, 'i') } } },
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
  const s = (subject || "dsa").toLowerCase();
  const bank = FALLBACK_QUESTIONS[s] || FALLBACK_QUESTIONS.dsa;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default { generateAIQuestions };
