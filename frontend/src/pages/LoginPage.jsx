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
            {/* Google */}
            <button className="soc-btn soc-google" onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}>
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </button>
            {/* LinkedIn */}
            <button className="soc-btn soc-linkedin" onClick={() => window.location.href = "http://localhost:5000/api/auth/linkedin"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
            {/* GitHub */}
            <button className="soc-btn soc-github" onClick={() => window.location.href = "http://localhost:5000/api/auth/github"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--muted)" }}>
            New here? <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 700 }} onClick={() => navigate("/register")}>Create an account</span>
          </div>
        </div>
      </div>
    </div>
  );
}