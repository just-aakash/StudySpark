import { useState, useEffect, useRef } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const MOCK = {
  user: { name: "Akash Tiwari", email: "akash@gla.ac.in", roll: "2415000153", branch: "CSE", sem: "4th", av: "AT" },
  roadmap: [
    { topic: "Data Structures", pct: 85, done: 17, total: 20, color: "#00d4aa" },
    { topic: "Algorithms", pct: 62, done: 13, total: 21, color: "#6366f1" },
    { topic: "DBMS", pct: 45, done: 9, total: 20, color: "#f59e0b" },
    { topic: "Operating Systems", pct: 30, done: 6, total: 20, color: "#ef4444" },
    { topic: "Computer Networks", pct: 15, done: 3, total: 20, color: "#a855f7" },
  ],
  cpScores: [
    { week: "W1", s: 82 }, { week: "W2", s: 76 }, { week: "W3", s: 58 },
    { week: "W4", s: 64 }, { week: "W5", s: 71 }, { week: "W6", s: 45 },
    { week: "W7", s: 68 }, { week: "W8", s: 73 },
  ],
  tasks: [
    { id: 1, type: "topic", text: "Read OS Chapter 7 — Memory Management", subj: "OS", time: "9:00 AM", done: true },
    { id: 2, type: "practice", text: "Solve 5 DP problems on LeetCode", subj: "Algorithms", time: "11:00 AM", done: true },
    { id: 3, type: "revision", text: "Revise SQL Joins & Normalization", subj: "DBMS", time: "2:00 PM", done: false },
    { id: 4, type: "topic", text: "Graph BFS/DFS — 3 problems", subj: "DS", time: "4:00 PM", done: false },
    { id: 5, type: "revision", text: "CN Network Layer mock quiz", subj: "CN", time: "6:00 PM", done: false },
  ],
  weakTopics: [
    { t: "Dynamic Programming", s: 28, lvl: "critical" }, { t: "Graph Traversal", s: 42, lvl: "danger" },
    { t: "SQL Joins", s: 55, lvl: "warn" }, { t: "Process Scheduling", s: 38, lvl: "danger" },
    { t: "TCP/IP Stack", s: 22, lvl: "critical" }, { t: "Tree Balancing", s: 60, lvl: "warn" },
    { t: "Normalization", s: 48, lvl: "danger" }, { t: "Deadlocks", s: 35, lvl: "danger" },
  ],
  history: [
    { date: "Mar 10", action: "OS added to high priority — score 42%", type: "restructure" },
    { date: "Mar 3", action: "DP practice intensity ×2", type: "modify" },
    { date: "Feb 24", action: "CN micro-revision sessions added", type: "add" },
    { date: "Feb 17", action: "Checkpoint 4 delayed 3 days", type: "delay" },
  ],
  upcoming: [
    { title: "Algorithms Checkpoint #4", date: "Mar 18, 2025", topics: ["DP","Graph","Greedy"], days: 5 },
    { title: "DBMS Checkpoint #3", date: "Mar 22, 2025", topics: ["SQL","Normalization","Transactions"], days: 9 },
  ],
  consistency: [
    [1,1,1,0,1,1,0],[1,1,0,1,1,1,1],[0,1,1,1,0,1,1],
    [1,0,1,1,1,1,0],[1,1,1,0,0,1,1],[1,1,1,1,1,0,1],[0,1,1,1,1,1,1],[1,1,0,1,1,1,1],
  ],
  badges: [
    { icon: "🔥", name: "7-Day Streak", desc: "Studied 7 days in a row" },
    { icon: "🏆", name: "Top Scorer", desc: "Scored 80%+ in a checkpoint" },
    { icon: "⚡", name: "Speed Learner", desc: "Completed a module in half the time" },
    { icon: "💎", name: "Consistent", desc: "Zero missed targets for a week" },
  ],
  roadPath: [
    { day: "Day 1–3", topic: "Arrays & Strings", status: "done", icon: "✅", color: "#00d4aa" },
    { day: "Day 4–6", topic: "Linked Lists", status: "done", icon: "✅", color: "#00d4aa" },
    { day: "Day 7–9", topic: "Stacks & Queues", status: "done", icon: "✅", color: "#00d4aa" },
    { day: "Day 10–12", topic: "Trees & BST", status: "current", icon: "📍", color: "#f59e0b" },
    { day: "Day 13–16", topic: "Graph Algorithms", status: "pending", icon: "🔒", color: "#4a6080" },
    { day: "Day 17–20", topic: "Dynamic Programming", status: "pending", icon: "🔒", color: "#4a6080" },
    { day: "Day 21–23", topic: "Greedy Algorithms", status: "pending", icon: "🔒", color: "#4a6080" },
    { day: "Day 24–26", topic: "Checkpoint Test 🎯", status: "pending", icon: "📋", color: "#6366f1" },
  ],
  analyticsData: [
    { week: "W1", score: 82, sessions: 6, hours: 14 },
    { week: "W2", score: 76, sessions: 5, hours: 11 },
    { week: "W3", score: 58, sessions: 4, hours: 9 },
    { week: "W4", score: 64, sessions: 5, hours: 12 },
    { week: "W5", score: 71, sessions: 6, hours: 14 },
    { week: "W6", score: 45, sessions: 3, hours: 7 },
    { week: "W7", score: 68, sessions: 5, hours: 11 },
    { week: "W8", score: 73, sessions: 6, hours: 13 },
  ],
  testQuestions: [
    { q: "What is the time complexity of finding the shortest path using Dijkstra's algorithm?", opts: ["O(V²)","O(V log V + E)","O(E log V)","O(V + E)"], ans: 1 },
    { q: "Which data structure is used in BFS?", opts: ["Stack","Priority Queue","Queue","Deque"], ans: 2 },
    { q: "In SQL, which clause is used to filter groups?", opts: ["WHERE","HAVING","GROUP BY","ORDER BY"], ans: 1 },
    { q: "What is a deadlock in OS?", opts: ["Process terminates","Two processes wait indefinitely for each other","CPU stalls","Memory overflow"], ans: 1 },
    { q: "What does TCP stand for?", opts: ["Transmission Control Protocol","Transfer Control Process","Transaction Control Protocol","None"], ans: 0 },
  ],
};
 
function Countdown({ days }) {
  const hours = (days * 24) % 24;
  return (
    <div className="countdown">
      {[["days", days], ["hrs", hours], ["min", 42], ["sec", 18]].map(([l, v]) => (
        <div className="cd-box" key={l}>
          <div className="cd-num">{String(v).padStart(2, "0")}</div>
          <div className="cd-lbl">{l}</div>
        </div>
      ))}
    </div>
  );
}
 
function DashboardPage({ user, courses, theme, setTheme }) {
  const [active, setActive] = useState("dashboard");
  const [sbOpen, setSbOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [tasks, setTasks] = useState(MOCK.tasks);
  const [testState, setTestState] = useState({ started: false, q: 0, answers: [], score: null });
  const profRef = useRef(null);
 
  useEffect(() => {
    const h = e => { if (profRef.current && !profRef.current.contains(e.target)) setProfOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
 
  const risk = Math.round(MOCK.roadmap.reduce((a, b) => a + b.pct, 0) / MOCK.roadmap.length);
  const riskColor = risk >= 70 ? "var(--green)" : risk >= 50 ? "var(--yellow)" : "var(--red)";
  const riskLabel = risk >= 70 ? "Low Risk" : risk >= 50 ? "Moderate" : "High Risk";
  const doneTasks = tasks.filter(t => t.done).length;
 
  const SIDEBAR = [
    { section: "MAIN" },
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "roadmap", icon: "🛣️", label: "Roadmap" },
    { id: "checkpoint", icon: "📋", label: "Checkpoint Tests" },
    { id: "analytics", icon: "📊", label: "Performance Analytics" },
    { id: "courses", icon: "📚", label: "My Courses" },
    { section: "INFO" },
    { id: "aboutus", icon: "👥", label: "About Us" },
    { id: "contact", icon: "✉️", label: "Contact Us" },
  ];
 
  const searchItems = SIDEBAR.filter(s => s.id && s.label.toLowerCase().includes(search.toLowerCase()));
 
  /* CHECKPOINT TEST LOGIC */
  const startTest = () => setTestState({ started: true, q: 0, answers: [], score: null });
  const answerQ = (idx) => {
    const newAnswers = [...testState.answers, idx];
    if (testState.q + 1 < MOCK.testQuestions.length) {
      setTestState(p => ({ ...p, q: p.q + 1, answers: newAnswers }));
    } else {
      const score = newAnswers.filter((a, i) => a === MOCK.testQuestions[i].ans).length;
      setTestState({ started: true, q: testState.q, answers: newAnswers, score });
    }
  };
  const resetTest = () => setTestState({ started: false, q: 0, answers: [], score: null });
 
  return (
    <div className="dash-wrap">
 
      {/* SIDEBAR */}
      <aside className="sidebar" style={{ "--sw": sbOpen ? "240px" : "62px" }}>
        <div className="sb-top" onClick={() => setSbOpen(s => !s)}>
          <div className="sb-logo-box">⚡</div>
          <span className={`sb-logo-name ${!sbOpen ? "hide" : ""}`}>StudySpark</span>
        </div>
        <div className="sb-nav">
          {SIDEBAR.map((s, i) => s.section
            ? sbOpen ? <div key={i} className="sb-section">{s.section}</div> : null
            : (
              <div key={s.id} className={`sb-item ${active === s.id ? "on" : ""}`} onClick={() => setActive(s.id)} title={!sbOpen ? s.label : ""}>
                <span className="sb-icon">{s.icon}</span>
                <span className={`sb-lbl ${!sbOpen ? "hide" : ""}`}>{s.label}</span>
              </div>
            )
          )}
        </div>
        <div className="sb-foot">
          <button className="sb-logout" onClick={() => navigate("/")}>
            <span className="sb-icon">🚪</span>
            <span className={`sb-lbl ${!sbOpen ? "hide" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>
 
      {/* MAIN */}
      <div className="dash-main">
        {/* NAVBAR */}
        <nav className="dash-nav">
          <button className="toggle-sb" onClick={() => setSbOpen(s => !s)}>☰</button>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-inp" placeholder="Search pages, topics..." value={search}
              onChange={e => setSearch(e.target.value)} onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false), 150)} />
            {searchOpen && search.length > 0 && (
              <div className="search-drop">
                {searchItems.length > 0 ? searchItems.map(r => (
                  <div key={r.id} className="search-drop-item" onMouseDown={() => { setActive(r.id); setSearch(""); }}>
                    <span>{r.icon}</span><span>{r.label}</span>
                  </div>
                )) : <div className="search-drop-item" style={{ color: "var(--muted)" }}>No results</div>}
              </div>
            )}
          </div>
          <div className="profile-wrap" ref={profRef}>
            <div className="profile-btn" onClick={() => setProfOpen(o => !o)}>
              <div className="profile-av">{MOCK.user.av}</div>
              <span className="profile-name">{MOCK.user.name.split(" ")[0]}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>▾</span>
            </div>
            {profOpen && (
              <div className="pdrop">
                <div className="pdrop-head">
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{MOCK.user.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{MOCK.user.email}</div>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 3 }}>{MOCK.user.roll} · {MOCK.user.branch}</div>
                </div>
                <div className="pdrop-item" onClick={() => { setModal({ type: "editProfile" }); setProfOpen(false); }}>✏️<span>Edit Profile</span></div>
                <div className="pdrop-item" onClick={() => { setModal({ type: "settings" }); setProfOpen(false); }}>⚙️<span>Settings</span></div>
                <div className="pdrop-item danger" onClick={() => navigate("/")}>🚪<span>Logout</span></div>
              </div>
            )}
          </div>
        </nav>
 
        {/* CONTENT */}
        <div className="dash-content">
 
          {/* ── DASHBOARD HOME ── */}
          {active === "dashboard" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                <div>
                  <div className="page-h">Dashboard 👋</div>
                  <div className="page-sub">Welcome back, {MOCK.user.name.split(" ")[0]}. Here's your academic snapshot.</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</div>
              </div>
 
              {/* STAT CARDS */}
              <div className="g4">
                {[
                  { icon: "📈", label: "Overall Progress", val: `${risk}%`, sub: "5 subjects", color: riskColor },
                  { icon: "✅", label: "Tasks Today", val: `${doneTasks}/${tasks.length}`, sub: "Completed", color: "var(--accent3)" },
                  { icon: "🔥", label: "Streak", val: "14 days", sub: "Keep it up!", color: "var(--accent4)" },
                  { icon: "⚠️", label: "Risk Level", val: riskLabel, sub: "Current status", color: riskColor },
                ].map(s => (
                  <div className="wg" key={s.label} onClick={() => setModal({ type: "stat", data: s })}>
                    <div className="wg-title">{s.icon} {s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: "var(--display)" }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
 
              <div className="g2">
                {/* ROADMAP PROGRESS */}
                <div className="wg" onClick={() => setModal({ type: "roadmap" })}>
                  <div className="wg-title">🗺️ Roadmap Progress</div>
                  {MOCK.roadmap.map(r => (
                    <div key={r.topic} style={{ marginBottom: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{r.topic}</span><span style={{ color: r.color, fontWeight: 700 }}>{r.pct}%</span>
                      </div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
                    </div>
                  ))}
                </div>
 
                {/* CHECKPOINT SCORES */}
                <div className="wg" onClick={() => setModal({ type: "cpScores" })}>
                  <div className="wg-title">📋 Checkpoint Scores</div>
                  {MOCK.cpScores.map(c => (
                    <div key={c.week} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)", width: 24 }}>{c.week}</span>
                      <div className="bar-track" style={{ flex: 1 }}><div className="bar-fill" style={{ width: `${c.s}%`, background: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }} /></div>
                      <span style={{ fontSize: 12, fontWeight: 700, width: 30, textAlign: "right", color: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }}>{c.s}</span>
                    </div>
                  ))}
                </div>
              </div>
 
              <div className="g3">
                {/* TODAY'S TASKS */}
                <div className="wg" style={{ gridColumn: "span 2" }} onClick={e => e.currentTarget === e.target && setModal({ type: "tasks" })}>
                  <div className="wg-title" style={{ cursor: "default" }}>📅 Today's Study Tasks
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", cursor: "pointer" }} onClick={() => setModal({ type: "tasks" })}>View all</span>
                  </div>
                  {tasks.slice(0, 4).map(t => (
                    <div key={t.id} className="task-row">
                      <div className={`task-cb ${t.done ? "done" : ""}`} onClick={e => { e.stopPropagation(); setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x)); }}>{t.done ? "✓" : ""}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>{t.text}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.time} · {t.subj} · {t.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
 
                {/* RISK LEVEL */}
                <div className="wg" onClick={() => setModal({ type: "risk" })}>
                  <div className="wg-title">⚠️ Risk Level</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 120 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${riskColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", animation: "glow 2s ease-in-out infinite" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: riskColor, fontFamily: "var(--display)" }}>{risk}%</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: riskColor, marginTop: 10 }}>{riskLabel}</div>
                  </div>
                </div>
              </div>
 
              <div className="g2">
                {/* WEAK TOPIC HEATMAP */}
                <div className="wg" onClick={() => setModal({ type: "heatmap" })}>
                  <div className="wg-title">🔥 Weak Topic Heatmap</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {MOCK.weakTopics.map(t => (
                      <div key={t.t} className="heat-cell"
                        style={{ background: t.lvl === "critical" ? "rgba(239,68,68,0.18)" : t.lvl === "danger" ? "rgba(245,158,11,0.14)" : "rgba(0,212,170,0.1)", border: `1px solid ${t.lvl === "critical" ? "rgba(239,68,68,0.35)" : t.lvl === "danger" ? "rgba(245,158,11,0.3)" : "rgba(0,212,170,0.2)"}` }}>
                        <div style={{ fontWeight: 800, color: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }}>{t.s}%</div>
                        <div style={{ color: "var(--muted)", lineHeight: 1.3 }}>{t.t}</div>
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* CONSISTENCY TRACKER */}
                <div className="wg" onClick={() => setModal({ type: "consistency" })}>
                  <div className="wg-title">🔗 Consistency Tracker</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} style={{ flex: 1, fontSize: 10, textAlign: "center", color: "var(--muted)" }}>{d}</div>)}
                  </div>
                  {MOCK.consistency.map((wk, wi) => (
                    <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
                      {wk.map((d, di) => <div key={di} className="day-sq" style={{ background: d ? "var(--accent)" : "var(--surface2)", opacity: d ? 0.75 + wi * 0.03 : 1 }} />)}
                    </div>
                  ))}
                  <div style={{ fontSize: 13, marginTop: 10 }}>🔥 <strong style={{ color: "var(--accent)" }}>14-day</strong> streak</div>
                </div>
              </div>
 
              <div className="g2">
                {/* PERFORMANCE TREND */}
                <div className="wg" onClick={() => setModal({ type: "trend" })}>
                  <div className="wg-title">📈 Performance Trend</div>
                  <svg viewBox="0 0 300 90" style={{ width: "100%", overflow: "visible" }}>
                    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
                    {[30,60].map(y => <line key={y} x1="0" y1={90-y} x2="300" y2={90-y} stroke="var(--border)" strokeWidth="1" />)}
                    <polygon fill="url(#tg)" points={[...MOCK.cpScores.map((c,i) => `${i*44},${90-c.s*0.8}`), `${(MOCK.cpScores.length-1)*44},90`, "0,90"].join(" ")} />
                    <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={MOCK.cpScores.map((c,i) => `${i*44},${90-c.s*0.8}`).join(" ")} />
                    {MOCK.cpScores.map((c,i) => <circle key={i} cx={i*44} cy={90-c.s*0.8} r="4" fill="var(--accent)" />)}
                  </svg>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                    {MOCK.cpScores.map(c => <span key={c.week}>{c.week}</span>)}
                  </div>
                </div>
 
                {/* ROUTINE HISTORY */}
                <div className="wg" onClick={() => setModal({ type: "history" })}>
                  <div className="wg-title">🔄 Routine Change History</div>
                  {MOCK.history.map((h,i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: h.type === "restructure" ? "rgba(239,68,68,0.12)" : h.type === "modify" ? "rgba(245,158,11,0.12)" : "rgba(0,212,170,0.1)", flexShrink: 0 }}>
                        {h.type === "restructure" ? "🔃" : h.type === "modify" ? "✏️" : h.type === "add" ? "➕" : "⏱️"}
                      </div>
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{h.action}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{h.date}</div></div>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* UPCOMING CHECKPOINT */}
              <div className="g2">
                <div className="wg" onClick={() => setModal({ type: "upcoming" })}>
                  <div className="wg-title">⏰ Upcoming Checkpoints</div>
                  {MOCK.upcoming.map((c,i) => (
                    <div key={i} style={{ background: "var(--surface2)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>📅 {c.date}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Topics: {c.topics.join(", ")}</div>
                      <Countdown days={c.days} />
                    </div>
                  ))}
                </div>
 
                {/* BADGES */}
                <div className="wg" onClick={() => setModal({ type: "badges" })}>
                  <div className="wg-title">🏆 Badges Earned</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {MOCK.badges.map(b => (
                      <div key={b.name} className="badge" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                        <span>{b.icon}</span><span>{b.name}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 12 }}>+3 more badges unlockable this week</div>
                </div>
              </div>
            </div>
          )}
 
          {/* ── ROADMAP PAGE ── */}
          {active === "roadmap" && (
            <div>
              <div className="page-h">🛣️ Study Roadmap</div>
              <div className="page-sub">Your personalized learning path — zigzag through each milestone.</div>
              <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
                {MOCK.roadPath.map((node, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <div className="road-node" style={{ flexDirection: i % 2 === 0 ? "row" : "row-reverse", marginBottom: 0, alignItems: "center" }}>
                      <div style={{ flex: 1 }} />
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                        <div className="road-circle" style={{ borderColor: node.color, background: node.status === "done" ? node.color + "22" : node.status === "current" ? node.color + "15" : "transparent", animation: node.status === "current" ? "glow 2s infinite" : "none" }}>
                          <span style={{ fontSize: 22 }}>{node.icon}</span>
                        </div>
                        {i < MOCK.roadPath.length - 1 && (
                          <div style={{ width: 3, height: 60, background: node.status === "done" ? node.color : "var(--border)", transition: "background 0.3s" }} />
                        )}
                      </div>
                      <div style={{ flex: 1, padding: i % 2 === 0 ? "0 0 0 24px" : "0 24px 0 0" }}>
                        <div className="road-content" style={{ borderColor: node.status === "current" ? node.color : "var(--border)", background: node.status === "current" ? node.color + "08" : "var(--surface)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: node.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{node.day}</div>
                          <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700 }}>{node.topic}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                            {node.status === "done" ? "✅ Completed" : node.status === "current" ? "📍 In Progress" : "🔒 Upcoming"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* ── CHECKPOINT TESTS ── */}
          {active === "checkpoint" && (
            <div>
              <div className="page-h">📋 Checkpoint Tests</div>
              <div className="page-sub">AI-generated conceptual questions. Your score shapes your roadmap.</div>
 
              {!testState.started ? (
                <>
                  <div className="g2" style={{ marginBottom: 24 }}>
                    {MOCK.upcoming.map((c,i) => (
                      <div key={i} className="wg">
                        <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>📅 {c.date} · {c.topics.join(", ")}</div>
                        <Countdown days={c.days} />
                        <button className="btn-primary" style={{ marginTop: 16, width: "100%", padding: "11px", fontSize: 14 }} onClick={startTest}>Start Test →</button>
                      </div>
                    ))}
                  </div>
                  <div className="page-h" style={{ fontSize: 18, marginBottom: 14 }}>Past Results</div>
                  {MOCK.cpScores.map((c,i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 18px", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", width: 28 }}>{c.week}</span>
                      <div className="bar-track" style={{ flex: 1 }}><div className="bar-fill" style={{ width: `${c.s}%`, background: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }} /></div>
                      <span style={{ fontWeight: 800, color: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)", width: 36, textAlign: "right" }}>{c.s}%</span>
                      <span style={{ fontSize: 12, color: "var(--muted)", width: 70 }}>{c.s >= 70 ? "✅ Passed" : c.s >= 50 ? "⚠️ Average" : "❌ Failed"}</span>
                    </div>
                  ))}
                </>
              ) : testState.score !== null ? (
                <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 64 }}>{testState.score >= 4 ? "🏆" : testState.score >= 3 ? "⚠️" : "❌"}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 800, margin: "16px 0 8px", color: testState.score >= 4 ? "var(--green)" : testState.score >= 3 ? "var(--yellow)" : "var(--red)" }}>
                    {Math.round((testState.score / MOCK.testQuestions.length) * 100)}%
                  </div>
                  <div style={{ fontSize: 16, color: "var(--muted)", marginBottom: 8 }}>{testState.score} out of {MOCK.testQuestions.length} correct</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, background: "var(--surface2)", borderRadius: 12, padding: "12px 16px" }}>
                    {testState.score >= 4 ? "✅ Great job! Your roadmap continues as planned." : testState.score >= 3 ? "⚠️ Moderate — targeted practice sessions added to your routine." : "🔃 Score below 50% — full roadmap restructuring triggered."}
                  </div>
                  <button className="btn-primary" style={{ padding: "12px 32px", fontSize: 15 }} onClick={resetTest}>Take Another Test</button>
                </div>
              ) : (
                <div style={{ maxWidth: 640, margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 14, color: "var(--muted)" }}>
                    <span>Question {testState.q + 1} of {MOCK.testQuestions.length}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>{Math.round(((testState.q) / MOCK.testQuestions.length) * 100)}% complete</span>
                  </div>
                  <div className="bar-track" style={{ marginBottom: 28 }}><div className="bar-fill" style={{ width: `${(testState.q / MOCK.testQuestions.length) * 100}%`, background: "var(--accent)" }} /></div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
                    <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>{MOCK.testQuestions[testState.q].q}</div>
                    {MOCK.testQuestions[testState.q].opts.map((opt, oi) => (
                      <button key={oi} onClick={() => answerQ(oi)}
                        style={{ width: "100%", padding: "13px 18px", background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, textAlign: "left", marginBottom: 10, cursor: "pointer", transition: "all 0.2s", fontFamily: "var(--font)" }}
                        onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                        onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text)"; }}>
                        <span style={{ fontWeight: 700, marginRight: 10, color: "var(--accent)" }}>{String.fromCharCode(65+oi)}.</span>{opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
 
          {/* ── ANALYTICS ── */}
          {active === "analytics" && (
            <div>
              <div className="page-h">📊 Performance Analytics</div>
              <div className="page-sub">Deep dive into your scores, study hours, and consistency trends.</div>
              <div className="g3" style={{ marginBottom: 24 }}>
                {[
                  { l: "Avg Score", v: `${Math.round(MOCK.analyticsData.reduce((a,b) => a+b.score,0)/MOCK.analyticsData.length)}%`, c: "var(--accent)" },
                  { l: "Total Sessions", v: MOCK.analyticsData.reduce((a,b) => a+b.sessions,0), c: "var(--accent3)" },
                  { l: "Study Hours", v: MOCK.analyticsData.reduce((a,b) => a+b.hours,0)+"h", c: "var(--accent4)" },
                ].map(s => (
                  <div key={s.l} className="wg">
                    <div className="wg-title">{s.l}</div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: s.c, fontFamily: "var(--display)" }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="wg" style={{ marginBottom: 20 }}>
                <div className="wg-title">📈 Weekly Score Trend</div>
                <svg viewBox="0 0 500 120" style={{ width: "100%" }}>
                  {[30,60,90].map(y => (
                    <g key={y}><line x1="40" y1={120-y} x2="480" y2={120-y} stroke="var(--border)" strokeWidth="1" /><text x="32" y={124-y} fill="var(--muted)" fontSize="10" textAnchor="end">{y}</text></g>
                  ))}
                  <polyline fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    points={MOCK.analyticsData.map((d,i) => `${60+i*58},${120-d.score}`).join(" ")} />
                  {MOCK.analyticsData.map((d,i) => (
                    <g key={i}>
                      <circle cx={60+i*58} cy={120-d.score} r="5" fill={d.score >= 70 ? "var(--green)" : d.score >= 50 ? "var(--yellow)" : "var(--red)"} />
                      <text x={60+i*58} y={120-d.score-10} fill="var(--text)" fontSize="11" textAnchor="middle" fontWeight="700">{d.score}</text>
                      <text x={60+i*58} y="118" fill="var(--muted)" fontSize="10" textAnchor="middle">{d.week}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="wg">
                <div className="wg-title">🔥 Weak Topics Breakdown</div>
                {MOCK.weakTopics.map(t => (
                  <div key={t.t} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{t.t}</span><span style={{ fontWeight: 700, color: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }}>{t.s}%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${t.s}%`, background: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* ── COURSES ── */}
          {active === "courses" && (
            <div>
              <div className="page-h">📚 My Courses</div>
              <div className="page-sub">Your enrolled courses and additional courses you can join.</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 14, color: "var(--accent)" }}>📌 Enrolled Courses</div>
              <div className="g3" style={{ marginBottom: 32 }}>
                {[
                  { icon: "🌳", title: "Data Structures & Algorithms", pct: 62, color: "#00d4aa" },
                  { icon: "💻", title: "Operating Systems", pct: 30, color: "#ef4444" },
                  { icon: "🗃️", title: "DBMS", pct: 45, color: "#f59e0b" },
                ].map(c => (
                  <div key={c.title} className="wg">
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{c.pct}% complete</div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${c.pct}%`, background: c.color }} /></div>
                    <button className="btn-primary" style={{ marginTop: 14, width: "100%", padding: "9px", fontSize: 13 }}>Continue →</button>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>🌟 More Courses</div>
              <div className="g3">
                {[
                  { icon: "🌐", title: "Full Stack Web Dev", color: "#6366f1" },
                  { icon: "🤖", title: "Machine Learning", color: "#f59e0b" },
                  { icon: "📡", title: "Computer Networks", color: "#a855f7" },
                  { icon: "🐍", title: "Python Programming", color: "#22c55e" },
                  { icon: "☁️", title: "Cloud & DevOps", color: "#38bdf8" },
                  { icon: "☕", title: "Java & OOP", color: "#f97316" },
                ].map(c => (
                  <div key={c.title} className="wg">
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{c.icon}</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{c.title}</div>
                    <button className="btn-outline" style={{ width: "100%", padding: "9px", fontSize: 13 }}>+ Enroll</button>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* ── ABOUT US ── */}
          {active === "aboutus" && (
            <div>
              <div className="page-h">👥 About StudySpark</div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>StudySpark – AI Habit Forge</div>
                <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>An AI-based preventive academic monitoring and adaptive study management system designed to improve student consistency and academic performance at GLA University, Mathura. B.Tech CSE 2025–26 project under Dr. Sayantan Sinha.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 18 }}>
                {[
                  { name: "Akash Tiwari", roll: "2415000153", role: "Team Lead & Backend", av: "AT", col: "#00d4aa" },
                  { name: "Akash Foujdar", roll: "2415000147", role: "Frontend Dev", av: "AF", col: "#6366f1" },
                  { name: "Lakshay Sharma", roll: "2415000883", role: "AI/ML Engineer", av: "LS", col: "#f59e0b" },
                  { name: "Dhruv Tyagi", roll: "2415000548", role: "Database & API", av: "DT", col: "#ef4444" },
                  { name: "Jayant Kumar", roll: "2415000728", role: "UI/UX Designer", av: "JK", col: "#a855f7" },
                ].map(m => (
                  <div key={m.roll} className="wg" style={{ textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: m.col+"22", color: m.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, margin: "0 auto 12px", fontFamily: "var(--display)" }}>{m.av}</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{m.role}</div>
                    <div style={{ fontSize: 11, color: m.col, fontWeight: 700, marginTop: 4 }}>{m.roll}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* ── CONTACT ── */}
          {active === "contact" && (
            <div>
              <div className="page-h">✉️ Contact Us</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Send a Message</h3>
                  {[["Name","text","Your name"],["Email","email","your@email.com"],["Subject","text","How can we help?"]].map(([l,t,ph]) => (
                    <div key={l} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{l}</div>
                      <input type={t} placeholder={ph} className="input-field" />
                    </div>
                  ))}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Message</div>
                    <textarea className="input-field" rows={5} placeholder="Your message..." style={{ resize: "vertical" }} />
                  </div>
                  <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }}>Send Message →</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[["📍","Address","GLA University, Mathura, UP 281406"],["📧","Email","studyspark@gla.ac.in"],["👨‍🏫","Supervisor","Dr. Sayantan Sinha"],["🎓","Dept.","Computer Engineering & Applications"]].map(([ic,l,v]) => (
                    <div key={l} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                      <span style={{ fontSize: 22 }}>{ic}</span>
                      <div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* ══ MODALS ══ */}
      {modal?.type === "roadmap" && (
        <Modal title="🗺️ Roadmap Progress" onClose={() => setModal(null)}>
          {MOCK.roadmap.map(r => (
            <div key={r.topic} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 600 }}>{r.topic}</span><span style={{ color: r.color, fontWeight: 700 }}>{r.pct}%</span></div>
              <div className="bar-track" style={{ height: 10 }}><div className="bar-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>✅ {r.done}/{r.total} modules · {r.total-r.done} remaining</div>
            </div>
          ))}
        </Modal>
      )}
      {modal?.type === "cpScores" && (
        <Modal title="📋 Checkpoint Score History" onClose={() => setModal(null)}>
          {MOCK.cpScores.map((c,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ width: 28, fontWeight: 700, color: "var(--muted)" }}>{c.week}</span>
              <div className="bar-track" style={{ flex: 1 }}><div className="bar-fill" style={{ width: `${c.s}%`, background: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }} /></div>
              <span style={{ width: 36, fontWeight: 800, color: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }}>{c.s}%</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.s >= 70 ? "✅ Strong" : c.s >= 50 ? "⚠️ Average" : "❌ Weak"}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 10, padding: 14, fontSize: 13, color: "var(--muted)" }}>
            📌 &lt;50% = full restructure · 50–69% = targeted fix · 70%+ = optimize only
          </div>
        </Modal>
      )}
      {modal?.type === "tasks" && (
        <Modal title="📅 Today's Study Tasks" onClose={() => setModal(null)}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div className={`task-cb ${t.done ? "done" : ""}`} onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}>{t.done ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>{t.text}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.time} · {t.subj} · <span style={{ textTransform: "capitalize", color: t.type === "topic" ? "var(--accent)" : t.type === "practice" ? "var(--accent3)" : "var(--accent4)" }}>{t.type}</span></div>
              </div>
            </div>
          ))}
        </Modal>
      )}
      {modal?.type === "risk" && (
        <Modal title="⚠️ Risk Level Analysis" onClose={() => setModal(null)}>
          <div style={{ fontSize: 48, fontWeight: 900, color: riskColor, fontFamily: "var(--display)", marginBottom: 12 }}>{riskLabel}</div>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>Overall academic health: <strong style={{ color: "var(--accent)" }}>{risk}%</strong></p>
          {MOCK.roadmap.map(r => (
            <div key={r.topic} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
              <span>{r.topic}</span>
              <span style={{ color: r.pct >= 70 ? "var(--green)" : r.pct >= 50 ? "var(--yellow)" : "var(--red)", fontWeight: 700 }}>
                {r.pct >= 70 ? "✅ Low" : r.pct >= 50 ? "⚠️ Moderate" : "❌ High"} ({r.pct}%)
              </span>
            </div>
          ))}
        </Modal>
      )}
      {modal?.type === "heatmap" && (
        <Modal title="🔥 Weak Topic Heatmap" onClose={() => setModal(null)}>
          {MOCK.weakTopics.map(t => (
            <div key={t.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 28, borderRadius: 6, background: t.lvl === "critical" ? "rgba(239,68,68,0.18)" : t.lvl === "danger" ? "rgba(245,158,11,0.14)" : "rgba(0,212,170,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }}>{t.s}%</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.t}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.lvl === "critical" ? "🔴 Critical — rebuild fundamentals" : t.lvl === "danger" ? "🟡 Needs attention" : "🟢 Moderate"}</div>
              </div>
            </div>
          ))}
        </Modal>
      )}
      {modal?.type === "consistency" && (
        <Modal title="🔗 Consistency Tracker" onClose={() => setModal(null)}>
          <p style={{ color: "var(--muted)", marginBottom: 18 }}>Green = studied · Dark = missed</p>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--muted)" }}>{d}</div>)}
          </div>
          {MOCK.consistency.map((wk,wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
              {wk.map((d,di) => <div key={di} className="day-sq" style={{ background: d ? "var(--accent)" : "var(--surface3)", opacity: d ? 0.8 + wi * 0.025 : 1 }} />)}
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 14 }}>🔥 Current streak: <strong style={{ color: "var(--accent)" }}>14 days</strong></div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>🏆 Badges</div>
            {MOCK.badges.map(b => (
              <div key={b.name} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{b.icon}</span>
                <div><div style={{ fontWeight: 600 }}>{b.name}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>{b.desc}</div></div>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal?.type === "trend" && (
        <Modal title="📈 Performance Trend" onClose={() => setModal(null)} wide>
          <svg viewBox="0 0 500 140" style={{ width: "100%", marginBottom: 16 }}>
            {[35,70,105].map(y => <g key={y}><line x1="40" y1={140-y} x2="480" y2={140-y} stroke="var(--border)" strokeWidth="1" /><text x="32" y={144-y} fill="var(--muted)" fontSize="10" textAnchor="end">{y}</text></g>)}
            <polyline fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={MOCK.analyticsData.map((d,i) => `${60+i*58},${140-d.score*1.2}`).join(" ")} />
            {MOCK.analyticsData.map((d,i) => (
              <g key={i}>
                <circle cx={60+i*58} cy={140-d.score*1.2} r="6" fill={d.score >= 70 ? "var(--green)" : d.score >= 50 ? "var(--yellow)" : "var(--red)"} />
                <text x={60+i*58} y={140-d.score*1.2-12} fill="var(--text)" fontSize="11" textAnchor="middle" fontWeight="700">{d.score}</text>
                <text x={60+i*58} y="138" fill="var(--muted)" fontSize="10" textAnchor="middle">{d.week}</text>
              </g>
            ))}
          </svg>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[["Avg Score",`${Math.round(MOCK.analyticsData.reduce((a,b) => a+b.score,0)/MOCK.analyticsData.length)}%`,"var(--accent)"],["Total Hours",MOCK.analyticsData.reduce((a,b)=>a+b.hours,0)+"h","var(--accent3)"],["Sessions",MOCK.analyticsData.reduce((a,b)=>a+b.sessions,0),"var(--accent4)"]].map(([l,v,c]) => (
              <div key={l} style={{ background: "var(--surface3)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: c, fontFamily: "var(--display)" }}>{v}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal?.type === "history" && (
        <Modal title="🔄 Routine Change History" onClose={() => setModal(null)}>
          {MOCK.history.map((h,i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: h.type === "restructure" ? "rgba(239,68,68,0.12)" : h.type === "modify" ? "rgba(245,158,11,0.12)" : "rgba(0,212,170,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {h.type === "restructure" ? "🔃" : h.type === "modify" ? "✏️" : h.type === "add" ? "➕" : "⏱️"}
              </div>
              <div><div style={{ fontWeight: 600 }}>{h.action}</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{h.date}</div></div>
            </div>
          ))}
        </Modal>
      )}
      {modal?.type === "upcoming" && (
        <Modal title="⏰ Upcoming Checkpoints" onClose={() => setModal(null)}>
          {MOCK.upcoming.map((c,i) => (
            <div key={i} style={{ background: "var(--surface2)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>📅 {c.date} · Topics: {c.topics.join(", ")}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", marginBottom: 8 }}>⏳ Next checkpoint in:</div>
              <Countdown days={c.days} />
            </div>
          ))}
        </Modal>
      )}
      {modal?.type === "badges" && (
        <Modal title="🏆 Badges & Achievements" onClose={() => setModal(null)}>
          {MOCK.badges.map(b => (
            <div key={b.name} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{b.icon}</div>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div><div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{b.desc}</div></div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: 13, color: "var(--yellow)" }}>
            🌟 3 more badges available: 30-Day Streak, Perfect Score, Early Bird
          </div>
        </Modal>
      )}
      {modal?.type === "editProfile" && (
        <Modal title="✏️ Edit Profile" onClose={() => setModal(null)}>
          {[["Full Name","text",MOCK.user.name],["Email","email",MOCK.user.email],["Roll No.","text",MOCK.user.roll],["Branch","text",MOCK.user.branch]].map(([l,t,v]) => (
            <div key={l} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{l}</div>
              <input type={t} defaultValue={v} className="input-field" />
            </div>
          ))}
          <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={() => setModal(null)}>Save Changes</button>
        </Modal>
      )}
      {modal?.type === "settings" && (
        <Modal title="⚙️ Settings" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🎨 Theme</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["dark","light"].map(t => (
                <button key={t} onClick={() => { setTheme(t); document.documentElement.setAttribute("data-theme", t); }}
                  style={{ padding: 14, background: theme === t ? "rgba(0,212,170,0.1)" : "var(--surface2)", border: `2px solid ${theme === t ? "var(--accent)" : "var(--border)"}`, borderRadius: 12, color: theme === t ? "var(--accent)" : "var(--text)", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--font)" }}>
                  {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🔔 Notifications</div>
            {["Checkpoint Reminders","Daily Study Alerts","Streak Notifications","Weak Topic Alerts"].map(n => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 14 }}>{n}</span>
                <div style={{ width: 42, height: 22, borderRadius: 99, background: "var(--accent)", cursor: "pointer", position: "relative" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#000", position: "absolute", top: 3, right: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 15, background: "var(--red)" }} onClick={() => navigate("/")}>🚪 Logout</button>
        </Modal>
      )}
      {modal?.type === "stat" && (
        <Modal title={modal.data.label} onClose={() => setModal(null)}>
          <div style={{ fontSize: 48, fontWeight: 900, color: modal.data.color, fontFamily: "var(--display)", marginBottom: 8 }}>{modal.data.val}</div>
          <div style={{ color: "var(--muted)", fontSize: 15 }}>{modal.data.sub}</div>
        </Modal>
      )}
    </div>
  );
}
export default DashboardPage;