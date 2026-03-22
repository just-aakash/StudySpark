import { useState} from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";


export default function LoginPage({onLogin}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPass, setShowPass] = useState(false);
 
  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };
 
  const handle = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      const data = await authService.login(form);
      onLogin(data);
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="login-page">
      <div className="bg-bubbles">
        {Array.from({ length: 10 }).map((_, i) => (
        <span key={i}></span>
        ))}
      </div>
      <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
 
      <div className="login-left">
        <div style={{ fontSize: 40, marginBottom: 20 }}>⚡</div>
        <div style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 99, padding: "5px 14px", fontSize: 12, color: "var(--accent)", fontWeight: 700, letterSpacing: 1, display: "inline-block", marginBottom: 20 }}>AI-Powered Academic Platform</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 38, fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
          Your Personalized<br /><span style={{ color: "var(--accent)" }}>Study Engine</span><br />Awaits.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75, maxWidth: 380, marginBottom: 36 }}>
          StudySpark monitors your roadmap, runs checkpoint evaluations, and adapts your study plan before you fall behind.
        </p>
        {["Checkpoint-based weekly evaluations","AI restructures roadmap when needed","Risk alerts before exams fail you","Streak & badge reward system"].map(f => (
          <div className="ll-feat" key={f}><div className="ll-dot" /><span style={{ fontSize: 14, color: "var(--muted)" }}>{f}</span></div>
        ))}
      </div>
 
      <div className="login-right">
        <div className="login-card">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800 }}>Welcome Back 👋</div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>Sign in to access your dashboard</div>
          </div>
 
          <div className="login-tab-bar">
            <button className={`login-tab ${tab === "login" ? "on" : ""}`} onClick={() => setTab("login")}>Login</button>
            <button className={`login-tab ${tab === "register" ? "on" : ""}`} onClick={() => navigate("/register")}>Register</button>
          </div>

          <div className="lf-group">
            <label className="lf-label">Email Address</label>
            <input className={`input-field ${errors.email ? "err" : ""}`} placeholder="john.wick@gla.ac.in" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            {errors.email && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.email}</span>}
          </div>
          <div className="lf-group">
            <label className="lf-label">Password</label>
            <div style={{ position: "relative" }}>
              <input className={`input-field ${errors.password ? "err" : ""}`} type={showPass ? "text" : "password"} placeholder="********" style={{ paddingRight: 40 }} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              <button className="pass-eye" onClick={() => setShowPass(s => !s)}>{showPass ? "🙈" : "👁️"}</button>
            </div>
            {errors.password && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.password}</span>}
          </div>
          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>Forgot password?</span>
          </div>
          {apiError && <div style={{ color: "var(--red)", textAlign: "center", marginBottom: 12, fontSize: 13, fontWeight: 600 }}>{apiError}</div>}

          <button className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: 15 }} onClick={handle} disabled={loading}>
            {loading ? <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> : "Login to Dashboard →"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} /><span>or continue with</span><div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <div className="social-row">
            {["🔵", "Google", "🔷", "LinkedIn", "⚫", "GitHub"].reduce((result, value, index, array) => {
              if (index % 2 === 0) result.push(array.slice(index, index + 2));
              return result;
            }, []).map(([ic,name]) => (
              <button key={name} className="soc-btn" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onLogin({ email: "social@gla.ac.in", name: "Akash Tiwari", isNew: false }); }, 1200); }}>{ic} {name}</button>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--muted)" }}>
            New here? <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 700 }} onClick={() => navigate("/register")}>Create an account</span>
          </div>
        </div>
      </div>
    </div>
  );
}