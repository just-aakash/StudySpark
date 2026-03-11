import { useState } from "react";
import "../styles/login.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

/* Eye icons */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* Google G */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#8aadcc" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#7a9dbc" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#6a8dac" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#5a7d9c" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* Facebook F */
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8aadcc">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

/* GitHub */
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8aadcc">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

/* Student scene SVG */
const StudentScene = () => (
  <svg viewBox="0 0 320 380" className="mockup-photo-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="lampGlow" cx="30%" cy="40%" r="60%">
        <stop offset="0%" stopColor="rgba(255,200,120,0.18)"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
      <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a2535"/>
        <stop offset="100%" stopColor="#0d1520"/>
      </linearGradient>
    </defs>
    {/* Ambient glow */}
    <ellipse cx="100" cy="200" rx="140" ry="120" fill="url(#lampGlow)"/>
    {/* Desk */}
    <rect x="0" y="290" width="320" height="90" rx="4" fill="url(#deskGrad)" opacity="0.9"/>
    {/* Lamp base */}
    <rect x="40" y="210" width="6" height="80" rx="3" fill="#1e2d3d" opacity="0.8"/>
    <path d="M43 210 Q60 170 80 165" stroke="#1e2d3d" strokeWidth="5" fill="none" opacity="0.8"/>
    <ellipse cx="85" cy="162" rx="18" ry="8" fill="#2a3d50" opacity="0.8"/>
    {/* Lamp glow cone */}
    <path d="M75 168 L50 285 L120 285 L100 168 Z" fill="rgba(255,200,100,0.06)"/>
    {/* Plant pot */}
    <rect x="230" y="258" width="30" height="32" rx="4" fill="#1a2535" opacity="0.7"/>
    <ellipse cx="245" cy="258" rx="18" ry="6" fill="#1e2d3d" opacity="0.7"/>
    <path d="M245 255 Q235 230 220 220" stroke="#2a4a30" strokeWidth="3" fill="none" opacity="0.6"/>
    <path d="M245 255 Q255 225 270 215" stroke="#2a4a30" strokeWidth="3" fill="none" opacity="0.6"/>
    <ellipse cx="218" cy="218" rx="12" ry="8" fill="#2a4a30" opacity="0.5"/>
    <ellipse cx="272" cy="212" rx="12" ry="8" fill="#2a4a30" opacity="0.5"/>
    {/* Person body */}
    <ellipse cx="160" cy="380" rx="80" ry="20" fill="rgba(0,0,0,0.3)"/>
    <rect x="115" y="240" width="90" height="120" rx="20" fill="#1a2535" opacity="0.85"/>
    {/* Head */}
    <ellipse cx="155" cy="225" rx="28" ry="30" fill="#2a3545" opacity="0.9"/>
    {/* Hair */}
    <path d="M127 215 Q135 195 155 192 Q175 192 183 210" fill="#1a2530" opacity="0.9"/>
    {/* Arm writing */}
    <path d="M155 300 Q140 320 110 330" stroke="#1a2535" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.85"/>
    {/* Pen */}
    <rect x="95" y="328" width="3" height="16" rx="1.5" fill="#3a5a7a" opacity="0.8" transform="rotate(-30 95 328)"/>
    {/* Notebook */}
    <rect x="80" y="285" width="120" height="18" rx="3" fill="#1e2d3d" opacity="0.7"/>
    {/* Laptop */}
    <rect x="160" y="265" width="120" height="80" rx="6" fill="#0d1825" opacity="0.7"/>
    <rect x="163" y="268" width="114" height="74" rx="4" fill="rgba(74,158,255,0.06)"/>
    {/* Laptop screen glow */}
    <rect x="155" y="340" width="136" height="8" rx="4" fill="#0d1520" opacity="0.8"/>
    {/* Mug */}
    <rect x="255" y="274" width="22" height="26" rx="4" fill="#1a2535" opacity="0.7"/>
    <path d="M277 282 Q285 282 285 290 Q285 298 277 298" stroke="#1a2535" strokeWidth="3" fill="none" opacity="0.6"/>
    {/* Steam */}
    <path d="M262 270 Q265 262 262 255" stroke="rgba(200,220,240,0.2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M270 268 Q273 260 270 253" stroke="rgba(200,220,240,0.15)" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleLogin = () => {
  const dummyEmail = "akash.tiwari_cs24@gla.ac.in";
  const dummyPassword = "12345";

  if (email === dummyEmail && password === dummyPassword) {
    navigate("/dashboard");
  } else {
    alert("Invalid email or password");
  }
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="blob blob-1"/>
      <div className="blob blob-2"/>
      <div className="blob blob-3"/>
      <div className="blob blob-4"/>

      {/* Star dots */}
      <span className="star-dot sd1">✦</span>
      <span className="star-dot sd2">✦</span>
      <span className="star-dot sd3">✦</span>
      <span className="star-dot sd4">✦</span>
      <span className="star-dot sd5">✦</span>
      <span className="star-dot sd6">✦</span>

      {/* Top Logo */}
      <div className="top-logo">
        <img src={logo} alt="StudySpark Logo" className="logo-img"/>
          StudySpark
      </div>

      {/* LEFT — App mockup */}
      <div className="login-left">
        <div className="mockup-card">
          {/* Student photo overlay */}
          <div className="mockup-photo">
            <StudentScene/>
          </div>

          {/* Inner nav */}
          <div className="mockup-nav">
            <div className="mockup-nav-links">
              <span>Home</span><span>About Us</span><span>Blog</span><span>Contact Us</span>
            </div>
          </div>

          {/* Body */}
          <div className="mockup-body">
            {/* Sidebar */}
            <div className="mockup-sidebar">
              {["Dashboard","Roadmap","Checkpoints","About Us","Contact Us"].map((item, i) => (
                <div key={item} className={`mockup-sidebar-item${i===0?" active":""}`}>
                  <div className={`sidebar-dot${i===0?" active":""}`}/>
                  {item}
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="mockup-main">
              <div className="mockup-main-title">DSA Roadmap</div>
              <div className="mockup-row">
                {/* Donut / progress */}
                <div className="donut-card">
                  <div className="donut-label">DSA Roadmap</div>
                  <div className="donut-wrap">
                    {/* Circular arc */}
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(40,70,110,0.5)" strokeWidth="8"/>
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#4a9eff" strokeWidth="8"
                        strokeDasharray={`${2*Math.PI*30*0.45} ${2*Math.PI*30*0.55}`}
                        strokeDashoffset={2*Math.PI*30*0.25}
                        strokeLinecap="round"/>
                      <text x="40" y="44" textAnchor="middle" fill="#c8ddf0" fontSize="14" fontWeight="700">45%</text>
                    </svg>
                    <div className="donut-sub">45% Completed</div>
                  </div>
                </div>

                {/* Checkpoint cards */}
                <div className="checkpoint-cards">
                  <div className="checkpoint-card cp-card-1">
                    <div className="cp-title">Checkpoint 1</div>
                    <div className="cp-sub">Arrays<br/>Prog/branching<br/>In 3 days</div>
                    <span className="cp-badge cp-badge-1">Soon</span>
                  </div>
                  <div className="checkpoint-card cp-card-2">
                    <div className="cp-title">Checkpoint 2</div>
                    <div className="cp-sub">Fng Bprint<br/>In 4 days</div>
                    <span className="cp-badge cp-badge-2">Soon</span>
                  </div>
                </div>
              </div>

              {/* Performance chart */}
              <div className="perf-card">
                <div className="perf-title">Checkpoint Performance</div>
                <svg width="100%" height="55" viewBox="0 0 300 55">
                  {/* Grid lines */}
                  {[10,20,30,40].map(y=>(
                    <line key={y} x1="20" y1={y} x2="280" y2={y} stroke="rgba(60,90,130,0.2)" strokeWidth="0.5"/>
                  ))}
                  {/* Bars */}
                  {[
                    {x:40,h:22,label:"Week 1"},
                    {x:100,h:28,label:"Week 2"},
                    {x:160,h:38,label:"Week 3"},
                    {x:220,h:44,label:"Week 4"},
                  ].map(b=>(
                    <g key={b.x}>
                      <rect x={b.x-10} y={48-b.h} width="20" height={b.h} rx="2"
                        fill="rgba(74,158,255,0.25)"/>
                      <text x={b.x} y="55" textAnchor="middle" fill="#3a5a7a" fontSize="6">{b.label}</text>
                    </g>
                  ))}
                  {/* Line */}
                  <polyline
                    points="40,26 100,20 160,10 220,4"
                    fill="none" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {[{x:40,y:26,v:"60%"},{x:100,y:20,v:"60%"},{x:160,y:10,v:"86%"},{x:220,y:4,v:"75%"}].map(pt=>(
                    <g key={pt.x}>
                      <circle cx={pt.x} cy={pt.y} r="3" fill="#4a9eff"/>
                      <text x={pt.x} y={pt.y-5} textAnchor="middle" fill="#8aadcc" fontSize="6">{pt.v}</text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Topics */}
              <div className="topics-row">
                <div className="topic-chip">
                  <div className="topic-dot" style={{background:"#4a9eff"}}/>
                  <span className="topic-name">Arrays</span>
                  <span className="topic-pct">80%</span>
                </div>
                <div className="topic-chip">
                  <div className="topic-dot" style={{background:"#ff8844"}}/>
                  <span className="topic-name">Recursion</span>
                  <span className="topic-pct">55%</span>
                </div>
                <div className="topic-chip">
                  <div className="topic-dot" style={{background:"#4a88ff"}}/>
                  <span className="topic-name">Graphs</span>
                  <span className="topic-pct">65%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div className="login-right">
        <div className="login-card">
          <h2>Log in to StudySpark</h2>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon"><PersonIcon/></span>
              <input
                type="email"
                className="form-input"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><LockIcon/></span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="input-toggle" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeClosed/> : <EyeOpen/>}
              </button>
            </div>
            <a className="forgot-link">Forgot password?</a>
          </div>

          <button className="btn-login" onClick={handleLogin}>
            Log in
          </button>

          <div className="signup-row">
            Don't have an account? <a>Sign up</a>
          </div>

          <div className="divider">or</div>

          <div className="social-row">
            <button className="social-btn" title="Google"><GoogleIcon/></button>
            <button className="social-btn" title="Facebook"><FacebookIcon/></button>
            <button className="social-btn" title="GitHub"><GitHubIcon/></button>
          </div>
        </div>
      </div>
    </div>
  );
}