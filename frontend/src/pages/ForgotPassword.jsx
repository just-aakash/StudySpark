import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/forgot.css";

const DEMO_OTP = "427183";
 
function passwordStrength(pw) {
  if (!pw || pw.length < 1) return null;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
 
  if (pw.length < 4)  return { score: 0, pct: 12, label: "Too short",  color: "#ef4444", tip: "Use at least 8 characters" };
  if (score <= 1)     return { score: 1, pct: 25, label: "Weak",       color: "#ef4444", tip: "Add numbers & symbols" };
  if (score === 2)    return { score: 2, pct: 50, label: "Fair",       color: "#f59e0b", tip: "Add uppercase letters & symbols" };
  if (score === 3)    return { score: 3, pct: 72, label: "Good",       color: "#eab308", tip: "Getting there!" };
  if (score === 4)    return { score: 4, pct: 88, label: "Strong",     color: "#22c55e", tip: "Almost perfect" };
  return                     { score: 5, pct: 100, label: "Very Strong", color: "#00d4aa", tip: "Excellent password!" };
}
 
/* Shared sub-components */
function MethodCard({ icon, label, sub, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "16px 12px", border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 14, background: active ? "rgba(0,212,170,0.06)" : "var(--surface2)",
      cursor: "pointer", transition: "all 0.2s", textAlign: "center",
    }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--display)", color: active ? "var(--accent)" : "var(--text)" }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
    </button>
  );
}
 
function StepDot({ idx, current }) {
  const done    = idx < current;
  const active  = idx === current;
  return (
    <div style={{
      width: done || active ? 28 : 10, height: 10, borderRadius: 99,
      background: done ? "var(--green)" : active ? "var(--accent2)" : "var(--surface3)",
      transition: "all 0.35s ease", border: active ? "none" : "none",
    }} />
  );
}
 
function StepBar({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => <StepDot key={i} idx={i} current={current} />)}
      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>Step {current + 1} of {total}</span>
    </div>
  );
}
 
function Label({ children }) {
  return <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 7 }}>{children}</label>;
}
 
function InputField({ error, style: s, ...props }) {
  return (
    <input {...props} style={{
      width: "100%", background: "var(--surface3)", border: `1.5px solid ${error ? "var(--red)" : "var(--border)"}`,
      borderRadius: 10, padding: "11px 14px", color: "var(--text)", fontSize: 14,
      outline: "none", fontFamily: "var(--font)", transition: "border 0.2s", ...s,
    }}
    onFocus={e => { e.target.style.borderColor = error ? "var(--red)" : "var(--accent)"; }}
    onBlur={e  => { e.target.style.borderColor = error ? "var(--red)" : "var(--border)"; }}
    />
  );
}
 
function Btn({ children, variant = "primary", loading, style: s, ...props }) {
  const base = {
    width: "100%", padding: "13px", borderRadius: 12, fontSize: 15,
    fontWeight: 700, fontFamily: "var(--font)", cursor: "pointer",
    transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
  const variants = {
    primary:  { background: "var(--accent)",   color: "#000",         border: "none" },
    outline:  { background: "transparent",     color: "var(--text)",  border: "1.5px solid var(--border)" },
    danger:   { background: "var(--red)",      color: "#fff",         border: "none" },
    ghost:    { background: "var(--surface2)", color: "var(--text)",  border: "1.5px solid var(--border)" },
  };
  return (
    <button {...props} disabled={loading || props.disabled} style={{ ...base, ...variants[variant], opacity: (loading || props.disabled) ? 0.6 : 1, ...s }}>
      {loading && <span style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />}
      {children}
    </button>
  );
}
 
function AlertBox({ type, children }) {
  const colors = {
    error:   { bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.3)",    text: "var(--red)",    icon: "⚠️" },
    success: { bg: "rgba(0,212,170,0.08)",   border: "rgba(0,212,170,0.25)",   text: "var(--green)",  icon: "✅" },
    info:    { bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.25)",  text: "var(--accent2)", icon: "ℹ️" },
    warning: { bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.3)",   text: "var(--yellow)", icon: "⚡" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "11px 14px", fontSize: 13, color: c.text, lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start", animation: "slideIn 0.25s ease", marginBottom: 14 }}>
      <span style={{ flexShrink: 0 }}>{c.icon}</span>
      <span>{children}</span>
    </div>
  );
}
 
/* ================================================================
   SCREEN 1 — CHOOSE METHOD
================================================================ */
function ScreenMethod({ method, setMethod, email, setEmail, phone, setPhone, onSend, fieldError }) {
  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--display)", marginBottom: 8 }}>Forgot password? 🔐</div>
        <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65 }}>Choose how you want to reset your password.</div>
      </div>
 
      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <MethodCard icon="📱" label="Via OTP" sub="6-digit code sent to your phone" active={method === "otp"} onClick={() => setMethod("otp")} />
        <MethodCard icon="📧" label="Via Email" sub="Reset link sent to your inbox" active={method === "email"} onClick={() => setMethod("email")} />
      </div>
 
      {method === "otp" ? (
        <div style={{ marginBottom: 18, animation: "slideIn 0.25s ease" }}>
          <Label>Phone number</Label>
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ background: "var(--surface3)", border: "1.5px solid var(--border)", borderRight: "none", borderRadius: "10px 0 0 10px", padding: "11px 12px", fontSize: 14, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              🇮🇳 +91
            </div>
            <InputField
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/, "").slice(0, 10))}
              error={fieldError}
              s={{ borderRadius: "0 10px 10px 0", borderLeft: "none" }}
            />
          </div>
          {fieldError && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 5 }}>⚠️ {fieldError}</div>}
          <AlertBox type="info" style={{ marginTop: 12 }}>A 6-digit OTP will be sent via SMS to this number.</AlertBox>
        </div>
      ) : (
        <div style={{ marginBottom: 18, animation: "slideIn 0.25s ease" }}>
          <Label>Email address</Label>
          <InputField
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={fieldError}
          />
          {fieldError && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 5 }}>⚠️ {fieldError}</div>}
          <AlertBox type="info" style={{ marginTop: 12 }}>A secure reset link will be sent to <strong>{email || "your email"}</strong>. It expires in 15 minutes.</AlertBox>
        </div>
      )}
 
      <Btn onClick={onSend}>Send {method === "otp" ? "OTP →" : "reset link →"}</Btn>
    </div>
  );
}
 
/* ================================================================
   SCREEN 2a — OTP VERIFICATION
================================================================ */
function ScreenOTP({ phone, onVerified, onBack }) {
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [status, setStatus]     = useState(null); // null | "invalid" | "expired" | "success"
  const [timer, setTimer]       = useState(60);
  const [loading, setLoading]   = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [resendMsg, setResendMsg] = useState("");
  const inputRefs               = useRef([]);
  const timerRef                = useRef(null);
 
  const startTimer = () => {
    setTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  };
 
  useEffect(() => { startTimer(); inputRefs.current[0]?.focus(); return () => clearInterval(timerRef.current); }, []);
 
  const handleInput = (val, idx) => {
    const clean = val.replace(/\D/, "").slice(-1);
    const next  = [...otp]; next[idx] = clean; setOtp(next);
    setStatus(null);
    if (clean && idx < 5) inputRefs.current[idx + 1]?.focus();
  };
 
  const handleKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp]; next[idx - 1] = ""; setOtp(next);
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
  };
 
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
      e.preventDefault();
    }
  };
 
  const verify = () => {
    const entered = otp.join("");
    if (entered.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (timer === 0) { setStatus("expired"); setShakeKey(k => k + 1); return; }
      if (entered !== DEMO_OTP) { setStatus("invalid"); setShakeKey(k => k + 1); return; }
      setStatus("success");
      setTimeout(onVerified, 900);
    }, 900);
  };
 
  const resend = () => {
    setOtp(["", "", "", "", "", ""]);
    setStatus(null);
    setResendMsg("");
    startTimer();
    inputRefs.current[0]?.focus();
    setTimeout(() => setResendMsg("New OTP sent!"), 100);
    setTimeout(() => setResendMsg(""), 3000);
  };
 
  const borderFor = (i) => {
    if (status === "success") return "2px solid var(--green)";
    if (status === "invalid" || status === "expired") return "2px solid var(--red)";
    if (otp[i]) return "2px solid var(--accent)";
    return "1.5px solid var(--border)";
  };
 
  const timerColor = timer > 20 ? "var(--green)" : timer > 10 ? "var(--yellow)" : "var(--red)";
 
  return (
    <div className="fade-up">
      <StepBar total={3} current={1} />
 
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--display)", marginBottom: 8 }}>Enter OTP 📱</div>
        <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65 }}>
          We sent a 6-digit code via SMS to <span style={{ color: "var(--accent)", fontWeight: 600 }}>+91 {phone.slice(0,2)}{"●".repeat(6)}{phone.slice(-2)}</span>.
        </div>
      </div>
 
      {/* DEMO HINT */}
      <AlertBox type="warning">Demo OTP: <strong style={{ letterSpacing: 2 }}>{DEMO_OTP}</strong></AlertBox>
 
      <Label>One-time password</Label>
 
      {/* OTP BOXES */}
      <div key={shakeKey} style={{ display: "flex", gap: 10, marginBottom: 12, justifyContent: "center" }}
        className={status === "invalid" || status === "expired" ? "shake" : ""}>
        {otp.map((val, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={e => handleInput(e.target.value, i)}
            onKeyDown={e => handleKey(e, i)}
            onPaste={handlePaste}
            style={{
              width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 800,
              fontFamily: "var(--display)", border: borderFor(i), borderRadius: 12,
              background: status === "success" ? "rgba(0,212,170,0.08)" : status === "invalid" || status === "expired" ? "rgba(239,68,68,0.06)" : "var(--surface3)",
              color: "var(--text)", outline: "none", transition: "all 0.2s",
              caretColor: "var(--accent)",
            }}
          />
        ))}
      </div>
 
      {/* STATUS MESSAGES */}
      {status === "invalid" && (
        <AlertBox type="error">Incorrect OTP. Please check the code and try again.</AlertBox>
      )}
      {status === "expired" && (
        <AlertBox type="error">OTP has expired. Click "Resend OTP" to get a new code.</AlertBox>
      )}
      {status === "success" && (
        <AlertBox type="success">OTP verified successfully! Redirecting...</AlertBox>
      )}
      {resendMsg && <AlertBox type="success">{resendMsg}</AlertBox>}
 
      {/* TIMER ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {timer > 0 ? (
            <>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2.5px solid ${timerColor}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "border-color 0.5s" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: timerColor, fontFamily: "var(--display)" }}>{timer}</span>
              </div>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Resend available in <span style={{ color: timerColor, fontWeight: 700 }}>{timer}s</span></span>
            </>
          ) : (
            <span style={{ fontSize: 13, color: "var(--muted)" }}>OTP expired</span>
          )}
        </div>
        <button
          onClick={resend}
          disabled={timer > 0}
          style={{
            background: "none", border: "none", cursor: timer > 0 ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 700, color: timer > 0 ? "var(--muted)" : "var(--accent)",
            fontFamily: "var(--font)", padding: "4px 0", transition: "color 0.2s",
            opacity: timer > 0 ? 0.5 : 1,
          }}
        >
          🔄 Resend OTP
        </button>
      </div>
 
      <Btn onClick={verify} loading={loading} disabled={otp.join("").length < 6 || status === "success"}>
        {status === "success" ? "Verified ✓" : "Verify OTP"}
      </Btn>
      <Btn variant="outline" style={{ marginTop: 10 }} onClick={onBack}>← Back</Btn>
    </div>
  );
}
 
/* ================================================================
   SCREEN 2b — EMAIL SENT
================================================================ */
function ScreenEmailSent({ email, onSimulateClick, onBack }) {
  const [resent, setResent] = useState(false);
  const [count, setCount]   = useState(0);
 
  const resend = () => {
    setResent(true); setCount(c => c + 1);
    setTimeout(() => setResent(false), 3000);
  };
 
  return (
    <div className="fade-up">
      <StepBar total={3} current={1} />
 
      <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,212,170,0.1)", border: "2px solid rgba(0,212,170,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 18px", animation: "fadeIn 0.4s ease" }}>📧</div>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--display)", marginBottom: 10 }}>Check your inbox</div>
        <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
          We sent a secure reset link to<br />
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>{email}</span><br />
          <span style={{ fontSize: 12 }}>The link expires in <strong>15 minutes</strong>.</span>
        </div>
      </div>
 
      <AlertBox type="success">Reset link sent! Click the link in your email to set a new password.</AlertBox>
 
      {resent && <AlertBox type="success">Email resent to {email} {count > 1 ? `(${count}× total)` : ""}.</AlertBox>}
 
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>Didn't receive it?</div>
        {["Check your spam / junk folder", "Make sure you entered the correct email", "Wait a minute and try resending"].map((tip, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--muted)", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
            <span style={{ color: "var(--accent)", flexShrink: 0 }}>•</span>{tip}
          </div>
        ))}
      </div>
 
      <Btn variant="ghost" onClick={resend}>🔄 Resend email</Btn>
 
      {/* DEMO: simulate clicking the email link */}
      <div style={{ textAlign: "center", marginTop: 16, padding: "12px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Demo only</div>
        <button onClick={onSimulateClick} style={{ background: "none", border: "none", color: "var(--accent2)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", textDecoration: "underline" }}>
          Click here to simulate opening the email link →
        </button>
      </div>
 
      <Btn variant="outline" style={{ marginTop: 12 }} onClick={onBack}>← Back</Btn>
    </div>
  );
}
 
/* ================================================================
   SCREEN 3 — RESET PASSWORD FORM
================================================================ */
function ScreenReset({ onDone }) {
  const [pass, setPass]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
 
  const str = passwordStrength(pass);
 
  const validate = () => {
    const e = {};
    if (!pass || pass.length < 8) e.pass = "Password must be at least 8 characters";
    if (pass !== confirm)         e.confirm = "Passwords don't match";
    if (!confirm)                 e.confirm = "Please confirm your password";
    return e;
  };
 
  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onDone(); }, 1200);
  };
 
  const StrengthBar = () => (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 5, borderRadius: 99, background: "var(--surface3)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${str?.pct || 0}%`, background: str?.color, borderRadius: 99, transition: "width 0.4s ease, background 0.4s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: str?.color }}>{str?.label}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{str?.tip}</span>
      </div>
      {/* requirement checklist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginTop: 10 }}>
        {[
          ["≥ 8 characters", pass.length >= 8],
          ["Uppercase letter", /[A-Z]/.test(pass)],
          ["Number",          /[0-9]/.test(pass)],
          ["Special character", /[^a-zA-Z0-9]/.test(pass)],
        ].map(([label, met]) => (
          <div key={label} style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center", color: met ? "var(--green)" : "var(--muted)" }}>
            <span style={{ fontSize: 14 }}>{met ? "✓" : "○"}</span>{label}
          </div>
        ))}
      </div>
    </div>
  );
 
  return (
    <div className="fade-up">
      <StepBar total={3} current={2} />
 
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--display)", marginBottom: 8 }}>Set new password 🔒</div>
        <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65 }}>Choose a strong password you haven't used before.</div>
      </div>
 
      {/* NEW PASSWORD */}
      <div style={{ marginBottom: 20 }}>
        <Label>New password</Label>
        <div style={{ position: "relative" }}>
          <InputField
            type={showPass ? "text" : "password"}
            placeholder="Enter new password"
            value={pass}
            onChange={e => { setPass(e.target.value); setErrors(p => ({ ...p, pass: "" })); }}
            error={errors.pass}
            s={{ paddingRight: 42 }}
          />
          <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1, padding: 0 }}>
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
        {errors.pass && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 5 }}>⚠️ {errors.pass}</div>}
        {pass && <StrengthBar />}
      </div>
 
      {/* CONFIRM PASSWORD */}
      <div style={{ marginBottom: 22 }}>
        <Label>Confirm password</Label>
        <div style={{ position: "relative" }}>
          <InputField
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: "" })); }}
            error={errors.confirm}
            s={{ paddingRight: 42 }}
          />
          <button onClick={() => setShowConfirm(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1, padding: 0 }}>
            {showConfirm ? "🙈" : "👁️"}
          </button>
        </div>
        {errors.confirm && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 5 }}>⚠️ {errors.confirm}</div>}
        {confirm && pass === confirm && (
          <div style={{ fontSize: 12, color: "var(--green)", marginTop: 5 }}>✓ Passwords match</div>
        )}
        {confirm && pass !== confirm && !errors.confirm && (
          <div style={{ fontSize: 12, color: "var(--yellow)", marginTop: 5 }}>⚠️ Passwords don't match yet</div>
        )}
      </div>
 
      <Btn onClick={submit} loading={loading}>Set new password →</Btn>
    </div>
  );
}
 
/* ================================================================
   SCREEN 4 — SUCCESS
================================================================ */
function ScreenSuccess({ onLogin }) {
  return (
    <div className="fade-up" style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,212,170,0.1)", border: "2px solid rgba(0,212,170,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px", animation: "fadeIn 0.4s ease" }}>✅</div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--display)", marginBottom: 10 }}>Password updated!</div>
      <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
        Your password has been reset successfully.<br />You can now log in with your new password.
      </div>
      <AlertBox type="success">For security, all other sessions have been logged out.</AlertBox>
      <Btn onClick={onLogin}>Go to login →</Btn>
    </div>
  );
}
 
/* ================================================================
   MAIN — FORGOT PASSWORD COMPONENT
================================================================ */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const onBack = () => navigate("/login");

  const [screen, setScreen] = useState("method");
  const [method, setMethod] = useState("otp");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [fieldError, setFieldError] = useState("");
 
  const handleSend = () => {
    if (method === "otp") {
      if (!phone || phone.length < 10) { setFieldError("Enter a valid 10-digit mobile number"); return; }
    } else {
      if (!email || !email.includes("@")) { setFieldError("Please enter a valid email address"); return; }
    }
    setFieldError("");
    setScreen(method === "otp" ? "otp" : "emailSent");
  };
 
  const screens = {
    method:    1,
    otp:       2,
    emailSent: 2,
    reset:     3,
    success:   4,
  };
 
  const titles = {
    method:    "Forgot password",
    otp:       "OTP verification",
    emailSent: "Email sent",
    reset:     "Reset password",
    success:   "All done",
  };
 
  const goBackFrom = () => {
    if (screen === "otp" || screen === "emailSent") setScreen("method");
    else if (screen === "reset") setScreen(method === "otp" ? "otp" : "emailSent");
  };
 
  return (
    <>
      <div className="forgot-container">
        <div style={{ width: "100%", maxWidth: 460 }}>
 
          {/* CARD */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: "36px 36px 32px", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}>
 
            {/* TOP BAR */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--accent),#00a87d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#000", fontFamily: "var(--display)" }}>⚡</div>
                <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 17, background: "linear-gradient(90deg,var(--accent),var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>StudySpark</span>
              </div>
              {screen !== "success" && (
                <button onClick={screen === "method" ? onBack : goBackFrom}
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "var(--font)", fontWeight: 600, transition: "all 0.2s" }}>
                  ← Back
                </button>
              )}
            </div>
 
            {/* SCREEN CONTENT */}
            {screen === "method" && (
              <ScreenMethod method={method} setMethod={m => { setMethod(m); setFieldError(""); }} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} onSend={handleSend} fieldError={fieldError} />
            )}
            {screen === "otp" && (
              <ScreenOTP phone={phone} onVerified={() => setScreen("reset")} onBack={() => setScreen("method")} />
            )}
            {screen === "emailSent" && (
              <ScreenEmailSent email={email} onSimulateClick={() => setScreen("reset")} onBack={() => setScreen("method")} />
            )}
            {screen === "reset" && (
              <ScreenReset onDone={() => setScreen("success")} />
            )}
            {screen === "success" && (
              <ScreenSuccess onLogin={onBack} />
            )}
          </div>
 
          {/* BOTTOM LINK */}
          {screen !== "success" && (
            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
              Remembered your password?{" "}
              <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", fontSize: 13 }}>Login</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}