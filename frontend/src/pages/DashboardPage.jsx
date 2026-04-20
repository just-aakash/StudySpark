import { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import taskService from "../services/taskService";
import checkpointService from "../services/checkpointService";
import roadmapService from "../services/roadmapService";
import aiService from "../services/aiService";
import courseService from "../services/courseService";
import logo from "../assets/logo.png";
import Modal from "../components/Modal";
import AIChatBot from "../components/AIChatBot";
import focusTracker from "../utils/focusTracker";

// ── Default/fallback data shown while real data loads ──────────
const DEFAULT_ROADMAP_PROGRESS = [
  { topic: "Data Structures", pct: 0, done: 0, total: 8, color: "#00d4aa" },
  { topic: "Algorithms", pct: 0, done: 0, total: 7, color: "#6366f1" },
  { topic: "DBMS", pct: 0, done: 0, total: 6, color: "#f59e0b" },
  { topic: "Operating Systems", pct: 0, done: 0, total: 7, color: "#ef4444" },
  { topic: "Computer Networks", pct: 0, done: 0, total: 6, color: "#a855f7" },
];

const DEFAULT_USER = {
  name: "Student", email: "", roll: "", branch: "CSE", sem: "4th", av: "S",
};

// Helper: map backend roadmap progress to UI format
function mapProgress(progress) {
  if (!progress || !progress.length) return DEFAULT_ROADMAP_PROGRESS;
  return progress.map(p => ({
    topic: p.subject,
    pct: p.pct,
    done: p.done,
    total: p.total,
    color: p.color,
  }));
}

// Helper: map backend roadmap nodes to UI roadPath format
function mapRoadPath(nodes) {
  if (!nodes || !nodes.length) return [];
  return nodes.map(n => ({
    day: n.day,
    topic: n.topic,
    status: n.status,
    icon: n.status === "done" ? "✅" : n.status === "current" ? "📍" : "🔒",
    color: n.status === "pending" ? "#4a6080" : n.color,
  }));
}

// Helper: map backend checkpoint history to cpScores format
function mapCpScores(history) {
  if (!history || !history.length) return [];
  return history.map(h => {
    const d = new Date(h.createdAt);
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    return { week: h.week, label: h.label || label, s: h.score };
  });
}

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

function DashboardPage({ user: propUser, courses, theme, setTheme }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [sbOpen, setSbOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Live data state ──────────────────────────────────────────
  const [liveUser, setLiveUser] = useState(DEFAULT_USER);
  const [roadmapProgress, setRoadmapProgress] = useState(DEFAULT_ROADMAP_PROGRESS);
  const [roadPath, setRoadPath] = useState([]);
  const [cpScores, setCpScores] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [badges, setBadges] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [riskLevel, setRiskLevel] = useState("Low");
  const [consistencyData, setConsistencyData] = useState({});
  const [completionPct, setCompletionPct] = useState(0);
  const [stats, setStats] = useState({});
  const [focus, setFocus] = useState({
  tabSwitches: 0,
  score: 100
});
  useEffect(() => {
  focusTracker.start();

 const interval = setInterval(() => {
  setFocus(focusTracker.getData());
}, 1000);

  return () => {
    focusTracker.stop();
    clearInterval(interval);
  };
}, []);

  // ── Checkpoint test state ────────────────────────────────────
  const [testQuestions, setTestQuestions] = useState([]);
  const [testSubject, setTestSubject] = useState("DSA");
  const [testState, setTestState] = useState({ started: false, q: 0, answers: [], score: null, correct: 0, total: 0, submitting: false, feedback: null });
  const [testLoading, setTestLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  // ── Settings State ────────────────────────────────────────────
  const [settings, setSettings] = useState({
    "Checkpoint Reminders": true,
    "Daily Study Alerts": true,
    "Streak Notifications": true,
    "Weak Topic Alerts": true
  });

  const toggleSetting = async (name) => {
    const newSettings = { ...settings, [name]: !settings[name] };
    setSettings(newSettings);
    try {
      await authService.updateProfile({ settings: { theme, notifications: newSettings } });
    } catch (e) { console.error("Failed to sync settings:", e); }
  };


  // ── Leaderboard state ──────────────────────────────────────
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);

  // ── AI advice state ────────────────────────────────────────
  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  // ── Add task state ─────────────────────────────────────────
  const [newTask, setNewTask] = useState({ text: "", subject: "DSA", time: "9:00 AM", type: "topic" });
  const [taskAdding, setTaskAdding] = useState(false);

  // ── Courses catalog state ──────────────────────────────────
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const profRef = useRef(null);

  // ── Fetch all dashboard data on mount ────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [analytics, todayTasks, courseList] = await Promise.all([
        authService.getAnalytics(),
        taskService.getTodaysTasks(),
        courseService.getCourses(),
      ]);

      // Trigger AI Advice in background (don't block initial mount for it)
      const fetchAdvice = async () => {
        setAiLoading(true);
        try {
          const adv = await aiService.getStudyAdvice();
          setAiAdvice(adv.advice);
        } catch (e) { console.error("Advice fetch err", e); }
        finally { setAiLoading(false); }
      };
      fetchAdvice();

      setCatalogCourses(courseList || []);

      // User info
      const u = analytics.user || {};
      setEnrolledCourses(u.enrolledCourses || []);
      const fullName = `${u.fname || ""} ${u.lname || ""}`.trim() || "Student";
      const av = fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      setLiveUser({
        name: fullName, email: u.email || "",
        roll: u.roll || "", branch: u.branch || "CSE",
        sem: u.sem || "",
        phone: u.phone || "",
        dob: u.dob ? new Date(u.dob).toISOString().split('T')[0] : "",
        education: u.education || "",
        year: u.year || "",
        skills: u.skills ? u.skills.join(", ") : "",
        about: u.about || "",
        profilePic: u.profilePic || null,
        av,
      });

      // Synchronize settings from DB
      if (u.settings) {
        if (u.settings.theme) setTheme(u.settings.theme);
        if (u.settings.notifications) setSettings(u.settings.notifications);
      }

      // Roadmap
      if (analytics.roadmap) {
        setRoadmapProgress(mapProgress(analytics.roadmap.progress));
        setRoadPath(mapRoadPath(analytics.roadmap.nodes));
      }

      // Checkpoint scores & analytics
      setCpScores(mapCpScores(analytics.checkpointHistory));
      setAnalyticsData(analytics.analyticsData || []);
      setWeakTopics(analytics.weakTopics || []);
      setBadges(u.badges || []);
      setStreak(analytics.stats?.streak || 0);
      setRiskLevel(analytics.stats?.riskLevel || "Low");
      setConsistencyData(analytics.consistencyData || {});
      setCompletionPct(analytics.stats?.completionPct || 0);
      setStats(analytics.stats || {});

      // Daily tasks — map _id → id for UI consistency
      setTasks(todayTasks.map(t => ({ ...t, id: t._id, subj: t.subject })));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const h = e => { if (profRef.current && !profRef.current.contains(e.target)) setProfOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const risk = completionPct;
  const riskColor = riskLevel === "Low" ? "var(--green)" : riskLevel === "Moderate" ? "var(--yellow)" : "var(--red)";
  const riskLabel = riskLevel === "Low" ? "Low Risk" : riskLevel === "Moderate" ? "Moderate" : "High Risk";
  const doneTasks = stats.todayTasksDone || 0;
  const totalTasks = stats.todayTasksTotal || 0;

  const SIDEBAR = [
    { section: "MAIN" },
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "roadmap", icon: "🗺️", label: "Roadmap" },
    { id: "checkpoint", icon: "🎯", label: "Checkpoint Tests" },
    { id: "analytics", icon: "📊", label: "Performance Analytics" },
    { id: "courses", icon: "📚", label: "My Courses" },
    { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
    { id: "aistudyplan", icon: "🤖", label: "AI Study Plan" },
    { section: "INFO" },
    { id: "aboutus", icon: "👥", label: "About Us" },
    { id: "contact", icon: "✉️", label: "Contact Us" },
  ];

  const searchItems = SIDEBAR.filter(s => s.id && s.label.toLowerCase().includes(search.toLowerCase()));

  /* ── CHECKPOINT TEST LOGIC (live) ──────────────────────── */
  const startTest = async () => {
    setTestLoading(true);
    setSelectedAnswer(null);
    try {
      const data = await checkpointService.getQuestions(testSubject);
      setTestQuestions(data.questions || []);
      setTestState({ started: true, q: 0, answers: [], score: null, correct: 0, total: data.questions?.length || 5, submitting: false, feedback: null });
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      alert("Could not load questions. Please try again.");
    } finally {
      setTestLoading(false);
    }
  };

  const answerQ = async (idx) => {
    if (testState.submitting) return; // Prevent double-submit
    setSelectedAnswer(idx);
    const newAnswers = [...testState.answers, idx];

    // Short visual delay so user sees selection
    await new Promise(r => setTimeout(r, 350));
    setSelectedAnswer(null);

    if (testState.q + 1 < testQuestions.length) {
      setTestState(p => ({ ...p, q: p.q + 1, answers: newAnswers }));
    } else {
      // Last question — submit to backend
      setTestState(p => ({ ...p, submitting: true, answers: newAnswers }));
      try {
        const result = await checkpointService.submitCheckpoint(testSubject, newAnswers, testQuestions);
        setTestState(p => ({
          ...p,
          answers: newAnswers,
          score: result.score,
          correct: result.correct,
          total: result.total,
          feedback: result.feedback,
          submitting: false,
        }));
        // Refresh dashboard data
        fetchDashboardData();
      } catch (err) {
        console.error("Submit error:", err);
        // Show error state instead of staying stuck
        setTestState(p => ({ ...p, submitting: false, score: -1, correct: 0, total: newAnswers.length }));
      }
    }
  };

  const resetTest = () => {
    setTestState({ started: false, q: 0, answers: [], score: null, correct: 0, total: 0, submitting: false, feedback: null });
    setTestQuestions([]);
    setSelectedAnswer(null);
  };

  /* ── ROADMAP GENERATION logic ───────────────────────────── */
  const handleGenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      // Ask backend to generate a personalized roadmap for these core subjects
      const subjectsToGenerate = ["DSA", "Algorithms", "OS", "DBMS", "CN"];
      await roadmapService.generateRoadmap(subjectsToGenerate);
      await fetchDashboardData(); // Re-fetch dashboard data to show the new roadmap
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      alert("Failed to generate roadmap. Please try again.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  /* ── LEADERBOARD fetch ──────────────────────────────────── */
  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const data = await aiService.getLeaderboard();
      setLeaderboard(data || []);
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active === "leaderboard") fetchLeaderboard();
  }, [active, fetchLeaderboard]);

  /* ── AI ADVICE fetch ────────────────────────────────────── */
  const fetchAiAdvice = useCallback(async () => {
    if (aiAdvice) return; // only fetch once
    setAiLoading(true);
    try {
      const data = await aiService.getStudyAdvice();
      setAiAdvice(data.advice);
    } catch (err) {
      console.error("AI advice error:", err);
      setAiAdvice("Keep going! Consistency is the key to mastering any subject.");
    } finally {
      setAiLoading(false);
    }
  }, [aiAdvice]);

  useEffect(() => {
    if (active === "dashboard" && !loading) fetchAiAdvice();
  }, [active, loading, fetchAiAdvice]);

  /* ── ADD TASK handler ───────────────────────────────────── */
  const handleAddTask = async () => {
    if (!newTask.text.trim()) return;
    setTaskAdding(true);
    try {
      const created = await taskService.createTask(newTask);
      setTasks(prev => [...prev, { ...created, id: created._id, subj: created.subject }]);
      setNewTask({ text: "", subject: "DSA", time: "9:00 AM", type: "topic" });
      setModal(null);
    } catch (err) {
      console.error("Add task error:", err);
      alert("Failed to add task. Please try again.");
    } finally {
      setTaskAdding(false);
    }
  };

  /* ── DELETE TASK handler ─────────────────────────────────── */
  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  /* ── Task toggle (live) ─────────────────────────────────── */
  const handleToggleTask = async (taskId) => {
    // Optimistic update immediately
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    try {
      const result = await taskService.toggleTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...result.task, id: result.task._id, subj: result.task.subject } : t));
      if (result.streak) setStreak(result.streak);
    } catch (err) {
      console.error("Toggle task error:", err);
      // Revert optimistic update on failure
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    }
  };

  return (
    <div className="dash-wrap">

      {/* SIDEBAR */}
      <aside className="sidebar" style={{ "--sw": sbOpen ? "240px" : "62px" }}>
        <div className="sb-top" onClick={() => setSbOpen(s => !s)}>
          <div className="sb-logo-box">
            <img src={logo} alt="logo" className="sb-logo-img" />
          </div>
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
        <div className="sb-foot" style={{ padding: '12px 10px', width: '100%', boxSizing: 'border-box' }}>
          <div className="profile-wrap" ref={profRef} style={{ width: '100%', margin: 0 }}>
            <div className="profile-btn" onClick={() => setProfOpen(o => !o)} style={{ padding: sbOpen ? '8px' : '4px', width: '100%', display: 'flex', justifyContent: 'center', background: 'transparent', border: sbOpen ? '1px solid var(--border)' : 'none', borderRadius: 12, transition: 'background 0.2s', boxSizing: 'border-box' }}>
              {liveUser.profilePic ? (
                <img src={liveUser.profilePic} style={{ width: sbOpen ? 34 : 32, height: sbOpen ? 34 : 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="Profile" />
              ) : (
                <div className="profile-av" style={{ width: sbOpen ? 34 : 32, height: sbOpen ? 34 : 32, fontSize: sbOpen ? 14 : 12, flexShrink: 0 }}>{liveUser.av}</div>
              )}
              {sbOpen && (
                <>
                  <div style={{ marginLeft: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
                    <span className="profile-name" style={{ fontSize: 13, fontWeight: 700, margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', textAlign: 'left' }}>{liveUser.name}</span>
                    <span style={{ fontSize: 10, color: "var(--accent)", textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', textAlign: 'left', fontWeight: 600 }}>{liveUser.roll || 'Student'}</span>
                  </div>
                  <span style={{ fontSize: 18, color: "var(--muted)", alignSelf: 'center', marginLeft: 4, lineHeight: 1 }}>▴</span>
                </>
              )}
            </div>
            {profOpen && (
              <div className="pdrop" style={{ bottom: 'calc(100% + 10px)', top: 'auto', left: sbOpen ? 0 : '70px', right: 'auto', width: '220px', transform: 'none', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
                <div className="pdrop-head">
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{liveUser.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{liveUser.email}</div>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 3 }}>{liveUser.roll} · {liveUser.branch}</div>
                </div>
                <div className="pdrop-item" onClick={() => { setModal({ type: "editProfile" }); setProfOpen(false); }}>✏️<span>Edit Profile</span></div>
                <div className="pdrop-item" onClick={() => { setModal({ type: "settings" }); setProfOpen(false); }}>⚙️<span>Settings</span></div>
                <div className="pdrop-item danger" onClick={() => navigate("/")}>↪<span>Logout</span></div>
              </div>
            )}
          </div>
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
        </nav>

        {/* CONTENT */}
        <div className="dash-content">
            {/* 🔥 FOCUS TRACKER — PASTE HERE */}
  <div style={{
    position: "fixed",
    top: "10px",
    right: "20px",
    background: focus.score > 70 ? "#111" : focus.score > 40 ? "#f59e0b" : "#ef4444",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    zIndex: 9999,
    fontSize: "13px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
    minWidth: "120px"
  }}>
    <div style={{ fontWeight: "600" }}>
      Focus: {focus.score}
    </div>
    <div style={{ fontSize: "12px", opacity: 0.8 }}>
      Switches: {focus.tabSwitches}
    </div>
  </div>
          {/* ── DASHBOARD HOME ── */}
          {active === "dashboard" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                <div>
                  {/* <div className="page-h">Dashboard 👋</div> */}
                  <div className="page-h" style={{
                    background: "linear-gradient(90deg, var(--text) 0%, var(--muted) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    Welcome back, {liveUser.name.split(" ")[0]}.
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4
                }}>
                  <div style={{
                    fontSize: 12,
                    color: "var(--accent)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 2
                  }}>
                    Current Status
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: "var(--text)",
                    background: "rgba(255,255,255,0.03)",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600
                  }}>
                    <span style={{ fontSize: 16 }}>📅</span>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                </div>
              </div>

              {/* AI ADVICE CARD */}
              {(aiAdvice || aiLoading) && (
                <div style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(99,102,241,0.08))", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 16, padding: "18px 22px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>🤖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>StudySpark AI</div>
                    {aiLoading ? (
                      <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>Generating personalized advice...</div>
                    ) : (
                      <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{aiAdvice}</div>
                    )}
                  </div>
                </div>
              )}

              {/* STAT CARDS */}
              <div className="g4">
                {[
                  { label: "Overall Progress", val: `${risk}%`, sub: `${roadmapProgress?.length || enrolledCourses?.length || 0} subjects`, color: "var(--accent)" },
                  { label: "Tasks Today", val: `${doneTasks}/${totalTasks}`, sub: "Completed", color: "var(--accent3)" },
                  { label: "Streak", val: `${streak} days`, sub: "Keep it up!", color: "var(--accent4)" },
                  { label: "Risk Level", val: riskLabel, sub: "Status", color: riskColor },
                ].map(s => (
                  <div className="wg" key={s.label}>
                    <div className="wg-title">{s.icon} {s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: "var(--display)" }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="g2">
                {/* ROADMAP PROGRESS */}
                <div className="wg">
                  <div className="wg-title">Roadmap Progress</div>
                  {roadmapProgress.map(r => (
                    <div key={r.topic} style={{ marginBottom: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{r.topic}</span><span style={{ color: r.color, fontWeight: 700 }}>{r.pct}%</span>
                      </div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
                    </div>
                  ))}
                </div>

                {/* CHECKPOINT SCORES */}
                <div className="wg">
                  <div className="wg-title">Checkpoint Scores</div>
                  {cpScores.map(c => (
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
                <div className="wg" style={{ gridColumn: "span 2" }}>
                  <div className="wg-title" style={{ cursor: "default" }}>📅 Today's Study Tasks
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", cursor: "pointer" }}
                      onClick={() => setModal({ type: "addTask" })}>+ Add Task</span>
                  </div>
                  {tasks.length === 0 && (
                    <div style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>No tasks today. Click "+ Add Task" to get started!</div>
                  )}
                  {tasks.slice(0, 5).map(t => (
                    <div key={t.id} className="task-row">
                      <div className={`task-cb ${t.done ? "done" : ""}`} onClick={e => { e.stopPropagation(); handleToggleTask(t.id); }}>{t.done ? "✓" : ""}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>{t.text}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.time} · {t.subj} · {t.type}</div>
                      </div>
                      <span style={{ fontSize: 15, cursor: "pointer", color: "var(--muted)", padding: "0 4px" }}
                        onClick={() => handleDeleteTask(t.id)} title="Delete task">🗑️</span>
                    </div>
                  ))}
                </div>

                {/* RISK LEVEL */}
                <div className="wg">
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
                <div className="wg">
                  <div className="wg-title">Weak Topic Heatmap</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {weakTopics.length > 0 ? weakTopics.map(t => (
                      <div key={t.t} className="heat-cell"
                        style={{ background: t.lvl === "critical" ? "rgba(239,68,68,0.18)" : t.lvl === "danger" ? "rgba(245,158,11,0.14)" : "rgba(0,212,170,0.1)", border: `1px solid ${t.lvl === "critical" ? "rgba(239,68,68,0.35)" : t.lvl === "danger" ? "rgba(245,158,11,0.3)" : "rgba(0,212,170,0.2)"}` }}>
                        <div style={{ fontWeight: 800, color: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }}>{t.s}%</div>
                        <div style={{ color: "var(--muted)", lineHeight: 1.3 }}>{t.t}</div>
                      </div>
                    )) : <div style={{ color: "var(--muted)", fontSize: 12 }}>No weak topics identified.</div>}
                  </div>
                </div>

                {/* CONSISTENCY TRACKER */}
                <div className="wg">
                  <div className="wg-title">🔗 Consistency Tracker</div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 12, fontFamily: 'var(--display)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>📅</span>
                      {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 12 }}>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => <div key={i} style={{ fontSize: 10, textAlign: "center", color: "var(--muted)", fontWeight: 800, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{d}</div>)}
                      {(() => {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = now.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const slots = [];

                        // Padding days from previous month
                        for (let i = 0; i < firstDay; i++) {
                          slots.push(<div key={`pad-${i}`} style={{ aspectRatio: "1" }} />);
                        }

                        // Actual days of current month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const activity = consistencyData[dateStr] || 0;
                          const intensity = Math.min(activity, 5);
                          const isToday = now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;
                          const colors = ["var(--surface3)", "rgba(0,212,170,0.15)", "rgba(0,212,170,0.3)", "rgba(0,212,170,0.5)", "rgba(0,212,170,0.75)", "var(--accent)"];

                          slots.push(
                            <div key={day} title={`${dateStr}: ${activity} activities`}
                              style={{
                                aspectRatio: "1",
                                background: colors[intensity],
                                border: isToday ? "2px solid var(--accent)" : "1px solid var(--border)",
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                color: intensity > 2 ? "#000" : "var(--text)",
                                transition: 'transform 0.1s',
                                cursor: 'pointer',
                                position: 'relative'
                              }}>
                              {day}
                              {activity > 0 && <div style={{ position: 'absolute', top: 2, right: 2, width: 4, height: 4, borderRadius: '50%', background: intensity > 2 ? '#000' : 'var(--accent)' }} />}
                            </div>
                          );
                        }
                        return slots;
                      })()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 9, color: "var(--muted)" }}>
                    <span>Less</span>
                    {["var(--surface3)", "rgba(0,212,170,0.15)", "rgba(0,212,170,0.3)", "rgba(0,212,170,0.5)", "rgba(0,212,170,0.75)", "var(--accent)"].map((col, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: 1.5, background: col, border: "0.5px solid var(--border)" }} />
                    ))}
                    <span>More</span>
                  </div>
                </div>
              </div>

              <div className="g2">
                {/* PERFORMANCE TREND */}
                <div className="wg">
                  <div className="wg-title">📈 Performance Trend</div>
                  <svg viewBox="0 0 300 90" style={{ width: "100%", overflow: "visible" }}>
                    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
                    {[30, 60].map(y => <line key={y} x1="0" y1={90 - y} x2="300" y2={90 - y} stroke="var(--border)" strokeWidth="1" />)}
                    <polygon fill="url(#tg)" points={cpScores.length ? [...cpScores.map((c, i) => `${i * 44},${90 - c.s * 0.8}`), `${(cpScores.length - 1) * 44},90`, "0,90"].join(" ") : ""} />
                    <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={cpScores.map((c, i) => `${i * 44},${90 - c.s * 0.8}`).join(" ")} />
                    {cpScores.map((c, i) => <circle key={i} cx={i * 44} cy={90 - c.s * 0.8} r="4" fill="var(--accent)" />)}
                  </svg>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginTop: 12, padding: "0 10px" }}>
                    {cpScores.map((c, i) => <span key={i} style={{ transform: "rotate(-25deg)", origin: "center" }}>{c.label}</span>)}
                  </div>
                </div>

                {/* ROUTINE HISTORY */}
                <div className="wg">
                  <div className="wg-title">🔄 Routine Change History</div>
                  {cpScores.length > 0 ? cpScores.map((h, i) => (
                    <div key={h._id || i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: h.s < 50 ? "rgba(239,68,68,0.12)" : h.s < 70 ? "rgba(245,158,11,0.12)" : "rgba(0,212,170,0.1)", flexShrink: 0 }}>
                        {h.s < 50 ? "🔃" : h.s < 70 ? "✏️" : "✅"}
                      </div>
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{h.week} — Score: {h.s}%</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Checkpoint</div></div>
                    </div>
                  )) : <div style={{ fontSize: 13, color: "var(--muted)" }}>No checkpoint history yet.</div>}
                </div>
              </div>

              {/* UPCOMING CHECKPOINT */}
              <div className="g2">
                <div className="wg">
                  <div className="wg-title">⏰ Upcoming Checkpoints</div>
                  {cpScores.length > 0 ? [
                    ...Object.entries(
                      cpScores.reduce((acc, c) => { acc[c.week] = c; return acc; }, {})
                    ).slice(-2).map(([week, c], i) => (
                      <div key={i} style={{ background: "var(--surface2)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Checkpoint {week}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Score: {c.s}%</div>
                        <button className="btn-primary" style={{ marginTop: 8, width: "100%", padding: "9px", fontSize: 13 }} onClick={() => { setTestSubject("DSA"); startTest(); }}>Retake →</button>
                      </div>
                    ))
                  ] : (
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>No upcoming checkpoints. Start a test below!</div>
                  )}
                </div>

                {/* BADGES */}
                <div className="wg">
                  <div className="wg-title">🏆 Badges Earned</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {badges.length > 0 ? badges.map(b => (
                      <div key={b.name} className="badge" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                        <span>{b.icon}</span><span>{b.name}</span>
                      </div>
                    )) : <div style={{ fontSize: 13, color: "var(--muted)" }}>Complete checkpoints to earn badges!</div>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 12 }}>+3 more badges unlockable this week</div>
                </div>
              </div>
            </div>
          )}

          {/* ── ROADMAP PAGE ── */}
          {active === "roadmap" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                <div>
                  <div className="page-h">Study Roadmap</div>
                  <div className="page-sub">Your personalized learning path — zigzag through each milestone.</div>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: "10px 16px", fontSize: 13, background: "linear-gradient(135deg, var(--accent) 0%, var(--accent3) 100%)", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}
                  onClick={handleGenerateRoadmap}
                  disabled={generatingRoadmap}
                >
                  {generatingRoadmap ? "⏳ Generating..." : "✨ Generate AI Roadmap"}
                </button>
              </div>
              <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
                {roadPath.length > 0 ? roadPath.map((node, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <div className="road-node" style={{ flexDirection: i % 2 === 0 ? "row" : "row-reverse", marginBottom: 0, alignItems: "center" }}>
                      <div style={{ flex: 1 }} />
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                        <div className="road-circle" style={{ borderColor: node.color, background: node.status === "done" ? node.color + "22" : node.status === "current" ? node.color + "15" : "transparent", animation: node.status === "current" ? "glow 2s infinite" : "none" }}>
                          <span style={{ fontSize: 22 }}>{node.icon}</span>
                        </div>
                        {i < roadPath.length - 1 && (
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
                )) : <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>{generatingRoadmap ? "AI is crafting your perfect study plan..." : "No roadmap yet. Click Generate AI Roadmap above!"}</div>}
              </div>
            </div>
          )}

          {/* ── CHECKPOINT TESTS ── */}
          {active === "checkpoint" && (
            <div>
              <div className="page-h">Checkpoint Tests</div>
              <div className="page-sub">AI-generated conceptual questions. Your score shapes your roadmap.</div>

              {!testState.started ? (
                <>
                  <div className="wg" style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Select Subject & Start Test</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {["DSA", "OS", "DBMS", "CN", "Algorithms"].map(s => (
                        <button key={s} onClick={() => setTestSubject(s)}
                          style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${testSubject === s ? "var(--accent)" : "var(--border)"}`, background: testSubject === s ? "rgba(0,212,170,0.1)" : "var(--surface2)", color: testSubject === s ? "var(--accent)" : "var(--text)", fontWeight: testSubject === s ? 700 : 400, cursor: "pointer", fontSize: 13 }}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <button className="btn-primary" style={{ width: "100%", padding: "11px", fontSize: 14 }} onClick={startTest} disabled={testLoading}>
                      {testLoading ? "Loading questions..." : `Start ${testSubject} Test →`}
                    </button>
                  </div>
                  <div className="page-h" style={{ fontSize: 14, marginBottom: 12 }}>Past Results</div>
                  {cpScores.length > 0 ? cpScores.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", width: 24 }}>{c.week}</span>
                      <div className="bar-track" style={{ flex: 1 }}><div className="bar-fill" style={{ width: `${c.s}%`, background: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }} /></div>
                      <span style={{ fontWeight: 700, color: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)", width: 32, textAlign: "right", fontSize: 12 }}>{c.s}%</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", width: 60 }}>{c.s >= 70 ? "Passed" : c.s >= 50 ? "Average" : "Failed"}</span>
                    </div>
                  )) : <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>No checkpoint results yet. Take a test above!</div>}
                </>
              ) : testState.submitting ? (
                <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>Submitting your answers...</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>Calculating your score with AI verification</div>
                </div>
              ) : testState.score !== null ? (
                <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 0" }}>
                  {/* Score Hero */}
                  <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 72, marginBottom: 12 }}>
                      {testState.score < 0 ? "⚠️" : testState.score >= 70 ? "🏆" : testState.score >= 50 ? "⚠️" : "❌"}
                    </div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 900, color: testState.score < 0 ? "var(--red)" : testState.score >= 70 ? "var(--green)" : testState.score >= 50 ? "var(--yellow)" : "var(--red)" }}>
                      {testState.score < 0 ? "Error" : `${testState.score}%`}
                    </div>
                    <div style={{ fontSize: 16, color: "var(--muted)", margin: "8px 0 16px" }}>
                      {testState.score >= 0 ? `${testState.correct} out of ${testState.total} correct` : "Could not submit. Try again."}
                    </div>
                    {/* Feedback chip */}
                    {testState.score >= 0 && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 99, border: `1.5px solid ${testState.score >= 70 ? "var(--green)" : testState.score >= 50 ? "var(--yellow)" : "var(--red)"}`, background: testState.score >= 70 ? "rgba(34,197,94,0.1)" : testState.score >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", fontSize: 14, fontWeight: 600, color: testState.score >= 70 ? "var(--green)" : testState.score >= 50 ? "var(--yellow)" : "var(--red)" }}>
                        {testState.score >= 70 ? "✅ Great job! Roadmap continues as planned." : testState.score >= 50 ? "⚠️ Moderate — targeted practice added." : "🔃 Below 50% — roadmap restructuring triggered."}
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  {testState.score >= 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
                      {[
                        { label: "Score", val: `${testState.score}%`, color: testState.score >= 70 ? "var(--green)" : testState.score >= 50 ? "var(--yellow)" : "var(--red)" },
                        { label: "Correct", val: `${testState.correct}/${testState.total}`, color: "var(--accent)" },
                        { label: "Subject", val: testSubject, color: "var(--accent3)" },
                      ].map(s => (
                        <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px", textAlign: "center" }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: "var(--display)" }}>{s.val}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                    <button className="btn-primary" style={{ padding: "12px 28px", fontSize: 14 }} onClick={resetTest}>
                      🔁 Take Another Test
                    </button>
                    <button className="btn-outline" style={{ padding: "12px 28px", fontSize: 14 }}
                      onClick={() => { resetTest(); setActive("dashboard"); }}>
                      📊 View Dashboard
                    </button>
                    {testState.score >= 0 && testState.score < 50 && (
                      <button className="btn-outline" style={{ padding: "12px 28px", fontSize: 14, borderColor: "var(--red)", color: "var(--red)" }}
                        onClick={() => { resetTest(); setActive("roadmap"); }}>
                        🗺️ View Roadmap
                      </button>
                    )}
                    {testState.score >= 70 && (
                      <button className="btn-outline" style={{ padding: "12px 28px", fontSize: 14, borderColor: "var(--green)", color: "var(--green)" }}
                        onClick={() => { resetTest(); setActive("leaderboard"); }}>
                        🏆 View Leaderboard
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: 640, margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>Question {testState.q + 1} of {testQuestions.length}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>{testSubject} · {Math.round((testState.q / (testQuestions.length || 1)) * 100)}% done</span>
                  </div>
                  <div className="bar-track" style={{ marginBottom: 28 }}><div className="bar-fill" style={{ width: `${(testState.q / (testQuestions.length || 1)) * 100}%`, background: "var(--accent)" }} /></div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>Question {testState.q + 1}</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 24, lineHeight: 1.6 }}>{testQuestions[testState.q]?.q}</div>
                    {testQuestions[testState.q]?.opts.map((opt, oi) => (
                      <button key={oi} onClick={() => answerQ(oi)}
                        disabled={selectedAnswer !== null}
                        style={{
                          width: "100%", padding: "13px 18px",
                          background: selectedAnswer === oi ? "rgba(0,212,170,0.15)" : "var(--surface2)",
                          border: `1.5px solid ${selectedAnswer === oi ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: 10, color: selectedAnswer === oi ? "var(--accent)" : "var(--text)",
                          fontSize: 14, textAlign: "left", marginBottom: 10,
                          cursor: selectedAnswer !== null ? "default" : "pointer",
                          transition: "all 0.2s", fontFamily: "var(--font)",
                          transform: selectedAnswer === oi ? "scale(1.01)" : "scale(1)",
                        }}>
                        <span style={{ fontWeight: 700, marginRight: 10, color: "var(--accent)" }}>{String.fromCharCode(65 + oi)}.</span>{opt}
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
                  { l: "Avg Score", v: analyticsData.length ? `${Math.round(analyticsData.reduce((a, b) => a + b.score, 0) / analyticsData.length)}%` : "N/A", c: "var(--accent)" },
                  { l: "Total Sessions", v: analyticsData.reduce((a, b) => a + (b.sessions || 0), 0), c: "var(--accent3)" },
                  { l: "Streak", v: `${streak} days`, c: "var(--accent4)" },
                ].map(s => (
                  <div key={s.l} className="wg">
                    <div className="wg-title">{s.l}</div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: s.c, fontFamily: "var(--display)" }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="wg" style={{ marginBottom: 20 }}>
                <div className="wg-title">📈 Weekly Score Trend</div>
                <svg viewBox="0 0 500 160" style={{ width: "100%", overflow: "visible" }}>
                  {[30, 60, 90].map(y => (
                    <g key={y}><line x1="40" y1={120 - y} x2="480" y2={120 - y} stroke="var(--border)" strokeWidth="1" opacity="0.4" /><text x="32" y={124 - y} fill="var(--muted)" fontSize="10" textAnchor="end">{y}%</text></g>
                  ))}
                  <polyline fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    points={analyticsData.map((d, i) => `${60 + i * 58},${120 - d.score}`).join(" ")} />
                  {analyticsData.map((d, i) => (
                    <g key={i}>
                      <circle cx={60 + i * 58} cy={120 - d.score} r="6" fill="var(--bg)" stroke={d.score >= 70 ? "var(--green)" : d.score >= 50 ? "var(--yellow)" : "var(--red)"} strokeWidth="3" />
                      <text x={60 + i * 58} y={120 - d.score - 15} fill="var(--text)" fontSize="11" textAnchor="middle" fontWeight="800">{d.score}</text>
                      <text x={60 + i * 58} y="152" fill="var(--muted)" fontSize="10" textAnchor="middle" transform={`rotate(-30 ${60 + i * 58} 152)`}>{d.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="wg">
                <div className="wg-title">🔥 Weak Topics Breakdown</div>
                {weakTopics.length > 0 ? weakTopics.map(t => (
                  <div key={t.t} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{t.t}</span><span style={{ fontWeight: 700, color: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }}>{t.s}%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${t.s}%`, background: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }} /></div>
                  </div>
                )) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Complete checkpoints to identify weak topics.</div>}
              </div>
            </div>
          )}

          {/* ── COURSES ── */}
          {active === "courses" && (
            <div>
              <div className="page-h">📚 My Courses</div>
              <div className="page-sub">Your enrolled courses and additional courses you can join.</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, margin: "24px 0 16px", color: "var(--text)", letterSpacing: "-0.5px", background: "var(--surface)", padding: "8px 16px", borderRadius: 12, display: "inline-block", border: "1px solid var(--border)" }}>📌 Enrolled Courses</div>
              <div className="g3" style={{ marginBottom: 32 }}>
                {enrolledCourses.length > 0 || roadmapProgress.length > 0 ? (
                  <>
                    {roadmapProgress.map(c => {
                      const icons = { "DSA": "🌳", "OS": "💻", "DBMS": "🗃️", "CN": "🌐", "Algorithms": "🧬" };
                      return (
                        <div key={c.topic} className="wg">
                          <div style={{ fontSize: 36, marginBottom: 12 }}>{icons[c.topic] || "📚"}</div>
                          <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{c.topic}</div>
                          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{c.pct}% complete</div>
                          <button className="btn-primary" style={{ marginTop: 14, width: "100%", padding: "9px", fontSize: 13 }} onClick={() => setActive("roadmap")}>Continue →</button>
                        </div>
                      );
                    })}
                    {enrolledCourses.filter(title => !roadmapProgress.find(rp => rp.topic === title)).map(title => {
                      const courseMeta = catalogCourses.find(c => c.title === title) || { icon: "📚", color: "var(--accent)" };
                      return (
                        <div key={title} className="wg">
                          <div style={{ fontSize: 36, marginBottom: 12 }}>{courseMeta.icon}</div>
                          <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>0% complete</div>
                          <button className="btn-primary" style={{ marginTop: 14, width: "100%", padding: "9px", fontSize: 13 }} onClick={() => setActive("roadmap")}>Start Roadmap →</button>
                        </div>
                      )
                    })}
                  </>
                ) : <div style={{ color: "var(--muted)", fontSize: 14 }}>No courses enrolled. Join one below!</div>}
              </div>
              <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>🌟 More Courses</div>
              <div className="g3">
                {catalogCourses.length > 0 ? catalogCourses.map(c => (
                  <div key={c._id || c.title} className="wg">
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{c.icon}</div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{c.title}</div>
                    {enrolledCourses.includes(c.title) ? (
                      <button className="btn-outline" style={{ width: "100%", padding: "9px", fontSize: 13, borderColor: "var(--border)", color: "var(--muted)", cursor: "default" }} disabled>✓ Enrolled</button>
                    ) : (
                      <button className="btn-outline" style={{ width: "100%", padding: "9px", fontSize: 13, borderColor: c.color, color: c.color }} onClick={async () => {
                        const updated = [...enrolledCourses, c.title];
                        setEnrolledCourses(updated);
                        try { await authService.updateProfile({ enrolledCourses: updated }); } catch (e) { }
                      }}>+ Enroll</button>
                    )}
                  </div>
                )) : <div style={{ color: "var(--muted)", fontSize: 14 }}>No courses available.</div>}
              </div>
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {active === "leaderboard" && (
            <div>
              <div className="page-h">🏆 Leaderboard</div>
              <div className="page-sub">Top performers ranked by average checkpoint score.</div>
              {lbLoading ? (
                <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Loading leaderboard...</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                  <div style={{ fontSize: 16, color: "var(--text)", fontWeight: 700 }}>No scores yet!</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>Complete a checkpoint test to appear on the board.</div>
                  <button className="btn-primary" style={{ marginTop: 20, padding: "11px 28px" }} onClick={() => setActive("checkpoint")}>Take a Test →</button>
                </div>
              ) : (
                <div>
                  {/* Top 3 podium */}
                  {leaderboard.length >= 3 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: 32 }}>
                      {[leaderboard[1], leaderboard[0], leaderboard[2]].map((u, pi) => {
                        const podiumH = pi === 1 ? 110 : 80;
                        const medal = pi === 1 ? "🥇" : pi === 0 ? "🥈" : "🥉";
                        const col = pi === 1 ? "#FFD700" : pi === 0 ? "#C0C0C0" : "#CD7F32";
                        return u ? (
                          <div key={u.name} style={{ textAlign: "center", flex: 1, maxWidth: 180 }}>
                            <div style={{ fontSize: 28, marginBottom: 4 }}>{medal}</div>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${col}22`, border: `3px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, fontFamily: "var(--display)", color: col, margin: "0 auto 8px" }}>
                              {u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.branch}</div>
                            <div style={{ height: podiumH, background: `${col}18`, border: `2px solid ${col}40`, borderRadius: "10px 10px 0 0", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 22, color: col }}>{u.score}%</span>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Full ranking list */}
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 70px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                      <span>#</span><span>Student</span><span style={{ textAlign: "center" }}>Score</span><span style={{ textAlign: "center" }}>Streak</span><span style={{ textAlign: "center" }}>Badges</span>
                    </div>
                    {leaderboard.map((u, i) => (
                      <div key={u.name + i} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 70px", alignItems: "center", background: u.isMe ? "rgba(0,212,170,0.05)" : "transparent", transition: "background 0.2s" }}>
                        <span style={{ fontWeight: 900, color: i < 3 ? ["#FFD700", "#C0C0C0", "#CD7F32"][i] : "var(--muted)", fontSize: 15 }}>{i + 1}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name} {u.isMe && <span style={{ fontSize: 10, background: "var(--accent)", color: "#000", borderRadius: 4, padding: "1px 6px", fontWeight: 800, marginLeft: 6 }}>YOU</span>}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{u.branch} · {u.subjects || "—"}</div>
                        </div>
                        <div style={{ textAlign: "center", fontFamily: "var(--display)", fontWeight: 900, fontSize: 18, color: u.score >= 70 ? "var(--green)" : u.score >= 50 ? "var(--yellow)" : "var(--red)" }}>{u.score}%</div>
                        <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--accent4)" }}>🔥 {u.streak}d</div>
                        <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>🏅 {u.badgeCount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AI STUDY PLAN ── */}
          {active === "aistudyplan" && (
            <AiStudyPlanPage liveUser={liveUser} weakTopics={weakTopics} streak={streak} enrolledCourses={roadmapProgress.map(r => r.topic)} />
          )}

          {/* ── ABOUT US ── */}
          {active === "aboutus" && (
            <div>
              <div className="page-h">👥 About StudySpark</div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>StudySpark – AI Habit Forge</div>
                <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>An AI-based preventive academic monitoring and adaptive study management system designed to improve student consistency and academic performance</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 18 }}>
                {[
                  { name: "Akash Tiwari", role: "UI/UX & Frontend Dev", av: "AT", col: "#00d4aa" },
                  { name: "Akash Foujdar", role: "Backend", av: "AF", col: "#6366f1" },
                  { name: "Lakshay Sharma", role: "Frontend Dev", av: "LS", col: "#f59e0b" },
                  { name: "Dhruv Tyagi", role: "Backend & API", av: "DT", col: "#ef4444" },
                  { name: "Jayant Kumar", role: "Database", av: "JK", col: "#a855f7" },
                ].map(m => (
                  <div key={m.name} className="wg" style={{ textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: m.col + "22", color: m.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, margin: "0 auto 12px", fontFamily: "var(--display)" }}>{m.av}</div>
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
                  {[["Name", "text", "Your name"], ["Email", "email", "your@email.com"], ["Subject", "text", "How can we help?"]].map(([l, t, ph]) => (
                    <div key={l} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{l}</div>
                      <input type={t} placeholder={ph} className="input-field" />
                    </div>
                  ))}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Message</div>
                    <textarea className="input-field" rows={5} placeholder="Your message..." style={{ resize: "vertical" }} />
                  </div>
                  <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={() => alert("Message sent successfully! We will get back to you soon.")}>Send Message →</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[["📍", "Address", "GLA University, Mathura, UP 281406"], ["📧", "Email", "studyspark@gla.ac.in"], ["🎓", "Team", "StudySpark: AI Habit Forge"]].map(([ic, l, v]) => (
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

      {/* Add Task Modal */}
      {modal?.type === "addTask" && (
        <Modal title="📝 Add Today's Task" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Task Description</div>
            <input className="input-field" placeholder="e.g. Practice binary search problems" value={newTask.text}
              onChange={e => setNewTask(p => ({ ...p, text: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Subject</div>
              <select className="input-field" value={newTask.subject} onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))}>
                {["DSA", "OS", "DBMS", "CN", "Algorithms"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Type</div>
              <select className="input-field" value={newTask.type} onChange={e => setNewTask(p => ({ ...p, type: e.target.value }))}>
                {["topic", "practice", "revision", "checkpoint"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Time</div>
            <input className="input-field" type="time" value={newTask.time === "9:00 AM" ? "09:00" : newTask.time}
              onChange={e => setNewTask(p => ({ ...p, time: e.target.value }))} />
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }}
            onClick={handleAddTask} disabled={taskAdding || !newTask.text.trim()}>
            {taskAdding ? "Adding..." : "➕ Add Task"}
          </button>
        </Modal>
      )}

      {/* Roadmap Progress Modal — uses live data */}
      {modal?.type === "roadmap" && (
        <Modal title="🗺️ Roadmap Progress" onClose={() => setModal(null)}>
          {roadmapProgress.map(r => (
            <div key={r.topic} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 600 }}>{r.topic}</span><span style={{ color: r.color, fontWeight: 700 }}>{r.pct}%</span></div>
              <div className="bar-track" style={{ height: 10 }}><div className="bar-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>✅ {r.done}/{r.total} modules · {r.total - r.done} remaining</div>
            </div>
          ))}
          {roadmapProgress.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13 }}>No roadmap yet. Generate one from the Roadmap page!</div>}
        </Modal>
      )}

      {/* Checkpoint Score History Modal — uses live data */}
      {modal?.type === "cpScores" && (
        <Modal title="📋 Checkpoint Score History" onClose={() => setModal(null)}>
          {cpScores.length > 0 ? cpScores.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ width: 28, fontWeight: 700, color: "var(--muted)" }}>{c.week}</span>
              <div className="bar-track" style={{ flex: 1 }}><div className="bar-fill" style={{ width: `${c.s}%`, background: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }} /></div>
              <span style={{ width: 36, fontWeight: 800, color: c.s >= 70 ? "var(--green)" : c.s >= 50 ? "var(--yellow)" : "var(--red)" }}>{c.s}%</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.s >= 70 ? "✅ Strong" : c.s >= 50 ? "⚠️ Average" : "❌ Weak"}</span>
            </div>
          )) : <div style={{ color: "var(--muted)", fontSize: 13 }}>No checkpoint scores yet. Take a test!</div>}
          <div style={{ marginTop: 16, background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 10, padding: 14, fontSize: 13, color: "var(--muted)" }}>
            📌 &lt;50% = full restructure · 50–69% = targeted fix · 70%+ = optimize only
          </div>
        </Modal>
      )}

      {/* Tasks Modal */}
      {modal?.type === "tasks" && (
        <Modal title="📅 Today's Study Tasks" onClose={() => setModal(null)}>
          {tasks.length > 0 ? tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div className={`task-cb ${t.done ? "done" : ""}`} onClick={() => handleToggleTask(t.id)}>{t.done ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>{t.text}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.time} · {t.subj} · <span style={{ textTransform: "capitalize", color: t.type === "topic" ? "var(--accent)" : t.type === "practice" ? "var(--accent3)" : "var(--accent4)" }}>{t.type}</span></div>
              </div>
              <span style={{ cursor: "pointer", color: "var(--muted)", fontSize: 15 }} onClick={() => handleDeleteTask(t.id)}>🗑️</span>
            </div>
          )) : <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>No tasks today. Add some!</div>}
          <button className="btn-primary" style={{ width: "100%", padding: 11, fontSize: 14, marginTop: 16 }} onClick={() => { setModal(null); setTimeout(() => setModal({ type: "addTask" }), 100); }}>
            ➕ Add New Task
          </button>
        </Modal>
      )}

      {/* Risk Level Modal — uses live data */}
      {modal?.type === "risk" && (
        <Modal title="⚠️ Risk Level Analysis" onClose={() => setModal(null)}>
          <div style={{ fontSize: 48, fontWeight: 900, color: riskColor, fontFamily: "var(--display)", marginBottom: 12 }}>{riskLabel}</div>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>Overall academic health: <strong style={{ color: "var(--accent)" }}>{risk}%</strong></p>
          {roadmapProgress.map(r => (
            <div key={r.topic} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
              <span>{r.topic}</span>
              <span style={{ color: r.pct >= 70 ? "var(--green)" : r.pct >= 50 ? "var(--yellow)" : "var(--red)", fontWeight: 700 }}>
                {r.pct >= 70 ? "✅ Low" : r.pct >= 50 ? "⚠️ Moderate" : "❌ High"} ({r.pct}%)
              </span>
            </div>
          ))}
        </Modal>
      )}

      {/* Heatmap Modal — uses live weakTopics */}
      {modal?.type === "heatmap" && (
        <Modal title="🔥 Weak Topic Heatmap" onClose={() => setModal(null)}>
          {weakTopics.length > 0 ? weakTopics.map(t => (
            <div key={t.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 28, borderRadius: 6, background: t.lvl === "critical" ? "rgba(239,68,68,0.18)" : t.lvl === "danger" ? "rgba(245,158,11,0.14)" : "rgba(0,212,170,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: t.lvl === "critical" ? "var(--red)" : t.lvl === "danger" ? "var(--yellow)" : "var(--green)" }}>{t.s}%</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.t}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.lvl === "critical" ? "🔴 Critical — rebuild fundamentals" : t.lvl === "danger" ? "🟡 Needs attention" : "🟢 Moderate"}</div>
              </div>
            </div>
          )) : <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>No weak topics identified. Keep studying!</div>}
        </Modal>
      )}

      {/* Consistency Modal — uses live consistencyData */}
      {modal?.type === "consistency" && (
        <Modal title="🔗 Consistency Tracker" onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { val: `🔥 ${streak}`, label: "Day Streak", col: "var(--accent)", bg: "rgba(0,212,170,0.08)", border: "rgba(0,212,170,0.2)" },
              { val: completionPct + "%", label: "Completion", col: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
              { val: riskLabel, label: "Risk Level", col: riskColor, bg: `${riskColor}10`, border: `${riskColor}30` },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.col, fontFamily: "var(--display)" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Last 35 days</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ fontSize: 9, fontWeight: 700, textAlign: "center", color: "var(--muted)", paddingBottom: 5 }}>{d}</div>)}
              {Array.from({ length: 35 }).map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (34 - i));
                const dateStr = d.toISOString().split("T")[0];
                const activity = consistencyData[dateStr] || 0;
                const intensity = Math.min(activity, 5);
                const colors = ["var(--surface3)", "rgba(0,212,170,0.15)", "rgba(0,212,170,0.3)", "rgba(0,212,170,0.5)", "rgba(0,212,170,0.75)", "var(--accent)"];
                return <div key={i} title={`${dateStr}: ${activity} activities`} style={{ aspectRatio: "1", background: colors[intensity], border: "1px solid var(--border)", borderRadius: 3 }} />;
              })}
            </div>
          </div>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>🏆 Badges</div>
          {badges.length > 0 ? badges.map(b => (
            <div key={b.name} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <div><div style={{ fontWeight: 600 }}>{b.name}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>{b.desc}</div></div>
            </div>
          )) : <div style={{ color: "var(--muted)", fontSize: 13 }}>No badges earned yet.</div>}
        </Modal>
      )}

      {/* Trend Modal — uses live analyticsData */}
      {modal?.type === "trend" && (
        <Modal title="📈 Performance Trend" onClose={() => setModal(null)} wide>
          {analyticsData.length > 0 ? (
            <>
              <svg viewBox="0 0 500 140" style={{ width: "100%", marginBottom: 16 }}>
                {[35, 70, 105].map(y => <g key={y}><line x1="40" y1={140 - y} x2="480" y2={140 - y} stroke="var(--border)" strokeWidth="1" /><text x="32" y={144 - y} fill="var(--muted)" fontSize="10" textAnchor="end">{y}</text></g>)}
                <polyline fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={analyticsData.map((d, i) => `${60 + i * 58},${140 - d.score * 1.2}`).join(" ")} />
                {analyticsData.map((d, i) => (
                  <g key={i}>
                    <circle cx={60 + i * 58} cy={140 - d.score * 1.2} r="6" fill={d.score >= 70 ? "var(--green)" : d.score >= 50 ? "var(--yellow)" : "var(--red)"} />
                    <text x={60 + i * 58} y={140 - d.score * 1.2 - 12} fill="var(--text)" fontSize="11" textAnchor="middle" fontWeight="700">{d.score}</text>
                    <text x={60 + i * 58} y="138" fill="var(--muted)" fontSize="10" textAnchor="middle">{d.week}</text>
                  </g>
                ))}
              </svg>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {[
                  ["Avg Score", `${Math.round(analyticsData.reduce((a, b) => a + b.score, 0) / analyticsData.length)}%`, "var(--accent)"],
                  ["Sessions", analyticsData.reduce((a, b) => a + (b.sessions || 0), 0), "var(--accent4)"],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ background: "var(--surface3)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: c, fontFamily: "var(--display)" }}>{v}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>No analytics data yet. Complete some checkpoint tests!</div>}
        </Modal>
      )}

      {modal?.type === "history" && (
        <Modal title="🔄 Routine Change History" onClose={() => setModal(null)}>
          {cpScores.length > 0 ? cpScores.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: h.s < 50 ? "rgba(239,68,68,0.12)" : h.s < 70 ? "rgba(245,158,11,0.12)" : "rgba(0,212,170,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {h.s < 50 ? "🔃" : h.s < 70 ? "✏️" : "✅"}
              </div>
              <div><div style={{ fontWeight: 600 }}>{h.week} — Score: {h.s}%</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Checkpoint Test Result</div></div>
            </div>
          )) : <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>No history available.</div>}
        </Modal>
      )}

      {modal?.type === "upcoming" && (
        <Modal title="⏰ Upcoming Checkpoints" onClose={() => setModal(null)}>
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)" }}>
            Next checkpoint will be generated automatically based on your weekly progress.
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: 11 }} onClick={() => { setModal(null); setActive("checkpoint"); }}>Take a Checkpoint Now →</button>
        </Modal>
      )}

      {modal?.type === "badges" && (
        <Modal title="🏆 Badges & Achievements" onClose={() => setModal(null)}>
          {badges.length > 0 ? badges.map(b => (
            <div key={b.name} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{b.icon}</div>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div><div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{b.desc}</div></div>
            </div>
          )) : <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>No badges earned yet. Complete your first checkpoint!</div>}
        </Modal>
      )}

      {modal?.type === "editProfile" && (
        <Modal title="✏️ Edit Profile" onClose={() => setModal(null)}>
          <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 10 }}>
            {/* Image Upload System */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <img id="profile-img-preview" src={liveUser.profilePic || `https://ui-avatars.com/api/?name=${liveUser.name.replace(' ', '+')}&background=random`} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, border: '2px solid var(--accent)' }} alt="Preview" />
              <input type="file" id="profile-file-input" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const img = document.getElementById('profile-img-preview');
                    img.src = ev.target.result;
                    img.dataset.delete = "false";
                  };
                  reader.readAsDataURL(file);
                }
              }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-outline" style={{ fontSize: 12, padding: '8px 16px', borderRadius: 20 }} onClick={() => document.getElementById('profile-file-input').click()}>Upload</button>
                <button className="btn-outline" style={{ fontSize: 12, padding: '8px 16px', borderRadius: 20, color: '#f87171', borderColor: '#f87171' }} onClick={() => {
                  const img = document.getElementById('profile-img-preview');
                  img.src = `https://ui-avatars.com/api/?name=${liveUser.name.replace(' ', '+')}&background=random`;
                  img.dataset.delete = "true";
                }}>Delete</button>
              </div>
            </div>

            {/* Profile Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                ["Full Name", "text", liveUser.name, "full"],
                ["Phone Number", "text", liveUser.phone, "phone"],
                ["Date of Birth", "date", liveUser.dob, "dob"],
                ["Roll No.", "text", liveUser.roll, "roll"],
                ["Branch", "text", liveUser.branch, "branch"],
                ["Education / Degree", "text", liveUser.education, "education"],
                ["Graduation Year", "text", liveUser.year, "year"],
                ["Skills (comma separated)", "text", liveUser.skills, "skills"]
              ].map(([l, t, v, id]) => (
                <div key={id}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{l}</div>
                  <input type={t} defaultValue={v} className="input-field" id={`profile-${id}`} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>

            {/* About Me block */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Short Bio / About</div>
              <textarea defaultValue={liveUser.about} className="input-field" id="profile-about" style={{ width: '100%', minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={async () => {
              const nameParts = document.getElementById('profile-full').value.split(' ');
              const fname = nameParts[0] || '';
              const lname = nameParts.slice(1).join(' ') || '';

              const payload = {
                fname, lname,
                phone: document.getElementById('profile-phone').value,
                dob: document.getElementById('profile-dob').value,
                roll: document.getElementById('profile-roll').value,
                branch: document.getElementById('profile-branch').value,
                education: document.getElementById('profile-education').value,
                year: document.getElementById('profile-year').value,
                skills: document.getElementById('profile-skills').value.split(',').map(s => s.trim()).filter(Boolean),
                about: document.getElementById('profile-about').value
              };

              const imgEl = document.getElementById('profile-img-preview');
              const picSrc = imgEl.src;
              if (picSrc.startsWith('data:image')) {
                payload.profilePic = picSrc;
              } else if (imgEl.dataset.delete === "true") {
                payload.profilePic = "";
              }

              try {
                const saved = await authService.updateProfile(payload);
                setLiveUser(prev => ({
                  ...prev,
                  name: `${fname} ${lname}`.trim(),
                  phone: payload.phone, dob: payload.dob,
                  roll: payload.roll, branch: payload.branch,
                  education: payload.education, year: payload.year,
                  skills: payload.skills.join(', '), about: payload.about,
                  profilePic: saved.profilePic === "" ? null : (saved.profilePic || prev.profilePic)
                }));
                setModal(null);
              } catch (e) {
                alert("Failed to update profile.");
              }
            }}>Save Changes</button>
          </div>
        </Modal>
      )}

      {modal?.type === "settings" && (
        <Modal title="⚙️ Settings" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🎨 Theme</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["dark", "light"].map(t => (
                <button key={t} onClick={async () => {
                  setTheme(t);
                  try { await authService.updateProfile({ settings: { theme: t, notifications: settings } }); } catch (e) { }
                }}
                  style={{ padding: 14, background: theme === t ? "rgba(0,212,170,0.1)" : "var(--surface2)", border: `2px solid ${theme === t ? "var(--accent)" : "var(--border)"}`, borderRadius: 12, color: theme === t ? "var(--accent)" : "var(--text)", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--font)", transition: '0.2s' }}>
                  {t === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🔔 Notifications</div>
            {["Checkpoint Reminders", "Daily Study Alerts", "Streak Notifications", "Weak Topic Alerts"].map(n => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 14 }}>{n}</span>
                <div
                  onClick={() => toggleSetting(n)}
                  style={{ width: 42, height: 22, borderRadius: 99, background: settings[n] ? "var(--accent)" : "var(--surface3)", cursor: "pointer", position: "relative", transition: "0.3s" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: settings[n] ? "#000" : "var(--muted)", position: "absolute", top: 3, left: settings[n] ? 23 : 3, transition: "0.3s" }} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 15, background: "var(--red)" }} onClick={() => { authService.logout(); navigate("/"); }}>🚪 Logout</button>
        </Modal>
      )}

      {modal?.type === "stat" && (
        <Modal title={modal.data.label} onClose={() => setModal(null)}>
          <div style={{ fontSize: 48, fontWeight: 900, color: modal.data.color, fontFamily: "var(--display)", marginBottom: 8 }}>{modal.data.val}</div>
          <div style={{ color: "var(--muted)", fontSize: 15 }}>{modal.data.sub}</div>
        </Modal>
      )}

      {/* Inject spin animation for submitting state */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Floating AI Chat Bot */}
      <AIChatBot user={liveUser} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Study Plan Sub-Page Component
// ─────────────────────────────────────────────────────────────────────────────
function AiStudyPlanPage({ liveUser, weakTopics, streak, enrolledCourses }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.getStudyPlan();
      setPlan(data);
    } catch (err) {
      console.error("Study plan error:", err);
      setError("Could not generate study plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dayColors = ["#00d4aa", "#6366f1", "#f59e0b", "#ef4444", "#a855f7", "#22c55e", "#38bdf8"];

  return (
    <div>
      <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🤖 AI Study Plan</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Personalized 7-day plan generated by Gemini AI based on your performance.</div>

      {/* Context banner */}
      <div style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(99,102,241,0.08))", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 13 }}>👤 <strong>{liveUser.name}</strong></div>
        <div style={{ fontSize: 13 }}>🔥 <strong>{streak} day streak</strong></div>
        <div style={{ fontSize: 13 }}>📚 <strong>{enrolledCourses.join(", ") || "No courses"}</strong></div>
        {weakTopics.length > 0 && <div style={{ fontSize: 13 }}>⚠️ Weak: <strong>{weakTopics.map(t => t.t).join(", ")}</strong></div>}
      </div>

      {!plan && !loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🧠</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ready to Generate Your Plan</div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Gemini AI will analyze your performance and create a personalized weekly schedule.</div>
          <button className="btn-primary" style={{ padding: "14px 36px", fontSize: 15 }} onClick={fetchPlan}>Generate My Study Plan ✨</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16, display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>Generating your personalized plan...</div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>This may take 10–15 seconds</div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 14, color: "var(--red)", marginBottom: 20 }}>{error}</div>
          <button className="btn-outline" style={{ padding: "12px 28px" }} onClick={fetchPlan}>Try Again</button>
        </div>
      )}

      {plan && !loading && (
        <div>
          {/* Focus Tip */}
          {plan.focus_tip && (
            <div style={{ background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, fontSize: 14, lineHeight: 1.7 }}>
              💡 <strong style={{ color: "var(--accent)" }}>This week's focus:</strong> {plan.focus_tip}
            </div>
          )}

          {/* Day cards */}
          {plan.plan ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {plan.plan.map((day, i) => (
                <div key={day.day} style={{ background: "var(--surface)", border: `1px solid ${dayColors[i % 7]}40`, borderRadius: 16, padding: 20, borderTop: `3px solid ${dayColors[i % 7]}` }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 800, color: dayColors[i % 7], marginBottom: 12 }}>{day.day}</div>
                  {day.tasks?.map((task, ti) => (
                    <div key={ti} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: dayColors[i % 7], flexShrink: 0, marginTop: 6 }} />
                      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{task}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : plan.raw ? (
            /* Fallback: raw text from AI */
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)" }}>{plan.raw}</div>
          ) : null}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button className="btn-outline" style={{ padding: "12px 24px", fontSize: 14 }} onClick={fetchPlan}>🔄 Regenerate</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
