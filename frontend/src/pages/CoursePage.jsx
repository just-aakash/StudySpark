import { useState} from "react";
import { useNavigate } from "react-router-dom";


export default function CoursePage({ user, onCourseSelect }) {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
 
  const COURSES = [
    { id: "dsa", icon: "🌳", title: "Data Structures & Algorithms", desc: "Master arrays, trees, graphs, DP and sorting with structured problem-solving tracks.", tags: ["LeetCode Style","Interview Prep","Competitive Coding"], grad: "#00d4aa" },
    { id: "webdev", icon: "🌐", title: "Full Stack Web Development", desc: "Build modern web apps with React, Node.js, Express and MongoDB from scratch.", tags: ["React","Node.js","MongoDB","REST APIs"], grad: "#6366f1" },
    { id: "ml", icon: "🤖", title: "Machine Learning & AI", desc: "Learn supervised, unsupervised learning, neural networks and model deployment.", tags: ["Python","sklearn","TensorFlow","Kaggle"], grad: "#f59e0b" },
    { id: "dbms", icon: "🗃️", title: "Database Management Systems", desc: "Deep dive into SQL, normalization, transactions and NoSQL databases.", tags: ["SQL","MongoDB","Redis","Normalization"], grad: "#ef4444" },
    { id: "os", icon: "💻", title: "Operating Systems", desc: "Process scheduling, memory management, deadlocks and file systems.", tags: ["Processes","Memory","Scheduling","UNIX"], grad: "#a855f7" },
    { id: "cn", icon: "📡", title: "Computer Networks", desc: "TCP/IP, OSI model, routing algorithms, network security fundamentals.", tags: ["TCP/IP","HTTP","Sockets","Security"], grad: "#0ea5e9" },
    { id: "java", icon: "☕", title: "Java & OOP Mastery", desc: "Object-oriented programming, design patterns, JVM internals and collections.", tags: ["OOP","Collections","Spring","JVM"], grad: "#f97316" },
    { id: "python", icon: "🐍", title: "Python Programming", desc: "From scripting to automation, data processing and API development.", tags: ["Automation","Flask","Pandas","APIs"], grad: "#22c55e" },
    { id: "cloud", icon: "☁️", title: "Cloud Computing & DevOps", desc: "AWS, Docker, Kubernetes and CI/CD pipeline fundamentals.", tags: ["AWS","Docker","Kubernetes","CI/CD"], grad: "#38bdf8" },
  ];
 
  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      await import("../services/roadmapService").then(m => m.default.generateRoadmap(selected));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-page">
      {/* ... header ... */}
      <div className="course-header">
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
        <div style={{ display: "inline-block", background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 99, padding: "5px 14px", fontSize: 12, color: "var(--accent)", fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>STEP 5 · CHOOSE YOUR PATH</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, marginBottom: 14 }}>
          Welcome! 🎉<br />
          <span style={{ color: "var(--accent)" }}>Choose Your Courses</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          Select at least one course. StudySpark will generate a personalized AI roadmap and study plan based on your selection and skill profile.
        </p>
      </div>

      <div className="course-grid">
        {COURSES.map(c => (
          <div key={c.id} className={`course-card ${selected.includes(c.id) ? "sel" : ""}`} onClick={() => toggle(c.id)} style={{ "--grad": c.grad }}>
            <span className="course-icon">{c.icon}</span>
            <div className="course-title">{c.title}</div>
            <div className="course-desc">{c.desc}</div>
            <div className="course-tags">{c.tags.map(t => <span key={t} className="course-tag">{t}</span>)}</div>
          </div>
        ))}
      </div>

      <div className="course-footer">
        <div className="sel-count">
          {selected.length === 0 ? "Select at least 1 course to continue" : <><span>{selected.length}</span> course{selected.length > 1 ? "s" : ""} selected — roadmap will be generated for each</>}
        </div>
        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button className="btn-primary" style={{ padding: "13px 36px", fontSize: 15 }} disabled={selected.length === 0 || loading} onClick={handleGenerate} >
          {loading ? "Generating Roadmap..." : "On your way lord commander →"}
        </button>
      </div>
    </div>
  );
}