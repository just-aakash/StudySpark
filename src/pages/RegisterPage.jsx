import { useState} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";



export default function RegisterPage({onRegister }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fname: "", lname: "", dob: "", email: "", phone: "", password: "", confirmPass: "",
    education: "", year: "", interests: [], skills: [], improveSkills: "", about: ""
  });
  const [errors, setErrors] = useState({});
 
  const INTERESTS = ["Machine Learning","Web Dev","Mobile Dev","Data Science","Cybersecurity","Cloud Computing","DSA","UI/UX Design","Blockchain","DevOps"];
  const SKILLS = ["JavaScript","Python","Java","C++","React","Node.js","MongoDB","SQL","Git","Docker"];
  const STEPS = ["Personal Info","Education","Skills & Interests","About You"];
 
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggle = (key, val) => setForm(p => ({ ...p, [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val] }));
 
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.fname) e.fname = "Required";
      if (!form.lname) e.lname = "Required";
      if (!form.email.includes("@")) e.email = "Valid email required";
      if (!form.phone.match(/^\d{10}$/)) e.phone = "Valid 10-digit number";
      if (form.password.length < 6) e.password = "Min 6 characters";
      if (form.password !== form.confirmPass) e.confirmPass = "Passwords don't match";
    }
    return e;
  };
 
  const next = () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    if (step < 3){
        setStep(s => s + 1);
    }
    else{
        localStorage.setItem("user", JSON.stringify(form));
        console.log("User registered:", form);
        navigate("/courses");
    }
  };
 
  return (
    <div className="reg-page">
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button className="btn-outline" style={{ padding: "7px 16px", fontSize: 13, marginBottom: 24 }} onClick={() => navigate("/login")}>← Back to Login</button>
 
        <div className="reg-header">
          <div style={{ fontFamily: "var(--display)", fontSize: 34, fontWeight: 800, marginBottom: 8 }}>Create Your Account 🚀</div>
          <div style={{ color: "var(--muted)", fontSize: 16 }}>Join StudySpark and start your AI-powered study journey</div>
        </div>
 
        {/* STEPPER */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className={`step-circle ${i < step ? "done" : i === step ? "active" : "pending"}`}>{i < step ? "✓" : i + 1}</div>
                {i < STEPS.length - 1 && <div className={`step-line ${i < step ? "done" : ""}`} />}
              </div>
              <div className="step-label" style={{ color: i === step ? "var(--accent)" : i < step ? "var(--accent)" : "var(--muted)", width: i < STEPS.length - 1 ? 96 : 80 }}>{s}</div>
            </div>
          ))}
        </div>
 
        <div className="reg-card">
          {/* STEP 0: PERSONAL INFO */}
          {step === 0 && (
            <>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Personal Information</h3>
              <div className="reg-grid-2">
                {[["First Name","fname","text","Akash"],["Last Name","lname","text","Tiwari"]].map(([l,k,t,ph]) => (
                  <div className="reg-group" key={k}>
                    <label className="reg-label">{l}</label>
                    <input className={`input-field ${errors[k] ? "err" : ""}`} type={t} placeholder={ph} value={form[k]} onChange={e => setF(k, e.target.value)} />
                    {errors[k] && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors[k]}</span>}
                  </div>
                ))}
              </div>
              <div className="reg-group">
                <label className="reg-label">Date of Birth</label>
                <input className="input-field" type="date" value={form.dob} onChange={e => setF("dob", e.target.value)} />
              </div>
              <div className="reg-group">
                <label className="reg-label">Email Address</label>
                <input className={`input-field ${errors.email ? "err" : ""}`} type="email" placeholder="akash@gla.ac.in" value={form.email} onChange={e => setF("email", e.target.value)} />
                {errors.email && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.email}</span>}
              </div>
              <div className="reg-group">
                <label className="reg-label">Mobile Number</label>
                <input className={`input-field ${errors.phone ? "err" : ""}`} type="tel" placeholder="9876543210" value={form.phone} onChange={e => setF("phone", e.target.value)} />
                {errors.phone && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.phone}</span>}
              </div>
              <div className="reg-grid-2">
                <div className="reg-group">
                  <label className="reg-label">Password</label>
                  <input className={`input-field ${errors.password ? "err" : ""}`} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setF("password", e.target.value)} />
                  {errors.password && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.password}</span>}
                </div>
                <div className="reg-group">
                  <label className="reg-label">Confirm Password</label>
                  <input className={`input-field ${errors.confirmPass ? "err" : ""}`} type="password" placeholder="Repeat password" value={form.confirmPass} onChange={e => setF("confirmPass", e.target.value)} />
                  {errors.confirmPass && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.confirmPass}</span>}
                </div>
              </div>
            </>
          )}
 
          {/* STEP 1: EDUCATION */}
          {step === 1 && (
            <>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Education Details</h3>
              <div className="reg-group">
                <label className="reg-label">Currently Studying In</label>
                <select className="input-field" value={form.education} onChange={e => setF("education", e.target.value)} style={{ appearance: "none" }}>
                  <option value="">Select your level...</option>
                  <option>Class 10th</option><option>Class 11th</option><option>Class 12th</option>
                  <option>B.Tech / B.E.</option><option>BCA</option><option>MCA</option>
                  <option>M.Tech</option><option>MBA</option><option>B.Sc</option><option>Other</option>
                </select>
              </div>
              {["B.Tech / B.E.","BCA","MCA","M.Tech","MBA"].includes(form.education) && (
                <div className="reg-group">
                  <label className="reg-label">Current Year</label>
                  <select className="input-field" value={form.year} onChange={e => setF("year", e.target.value)} style={{ appearance: "none" }}>
                    <option value="">Select year...</option>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
              )}
              <div className="reg-group">
                <label className="reg-label">College / School Name (optional)</label>
                <input className="input-field" placeholder="e.g. GLA University, Mathura" />
              </div>
              <div className="reg-group">
                <label className="reg-label">Branch / Stream (optional)</label>
                <input className="input-field" placeholder="e.g. Computer Science & Engineering" />
              </div>
            </>
          )}
 
          {/* STEP 2: SKILLS & INTERESTS */}
          {step === 2 && (
            <>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Skills & Interests</h3>
              <div className="reg-group">
                <label className="reg-label">Your Interests (select all that apply)</label>
                <div className="interest-grid">
                  {INTERESTS.map(i => (
                    <button key={i} className={`interest-chip ${form.interests.includes(i) ? "sel" : ""}`} onClick={() => toggle("interests", i)}>{i}</button>
                  ))}
                </div>
              </div>
              <div className="reg-group" style={{ marginTop: 16 }}>
                <label className="reg-label">Skills You Have</label>
                <div className="interest-grid">
                  {SKILLS.map(s => (
                    <button key={s} className={`interest-chip ${form.skills.includes(s) ? "sel" : ""}`} onClick={() => toggle("skills", s)}
                        style={{
                        "--acc": "var(--accent3)",
                        ...(form.skills.includes(s)? 
                        {
                        background: "rgba(99,102,241,0.1)",
                        borderColor: "var(--accent3)",
                        color: "var(--accent3)"
                        }: {})}}>
                        {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="reg-group" style={{ marginTop: 16 }}>
                <label className="reg-label">Skills You Want to Improve</label>
                <input className="input-field" placeholder="e.g. Dynamic Programming, System Design, SQL..." value={form.improveSkills} onChange={e => setF("improveSkills", e.target.value)} />
              </div>
            </>
          )}
 
          {/* STEP 3: ABOUT */}
          {step === 3 && (
            <>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>About You</h3>
              <div className="reg-group">
                <label className="reg-label">Tell us about yourself (max 100 words)</label>
                <textarea className="input-field" rows={6} placeholder="Write a short introduction — your goals, strengths, what you hope to achieve with StudySpark..." style={{ resize: "vertical" }}
                  value={form.about} onChange={e => { const words = e.target.value.trim().split(/\s+/).filter(Boolean); if (words.length <= 100) setF("about", e.target.value); }} />
                <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
                  {form.about.trim().split(/\s+/).filter(Boolean).length}/100 words
                </div>
              </div>
              <div style={{ background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 12, padding: "16px 20px", marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>🎉 Almost there!</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>After registration, you'll choose your course and StudySpark will generate a personalized AI roadmap for you.</div>
              </div>
            </>
          )}
 
          <div className="reg-nav">
            <button className="btn-outline" style={{ padding: "11px 28px", fontSize: 14 }} onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/login")} disabled={false}>
              {step === 0 ? "← Cancel" : "← Back"}
            </button>
            <button type="button" className="btn-primary" style={{ padding: "11px 28px", fontSize: 14 }} onClick={next}>
              {step < 3 ? "Continue →" : "Create Account →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}