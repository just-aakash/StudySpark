import { useState, useEffect } from "react";
import "../styles/home.css";
import Modal from "../components/Modal";
import logo from "../assets/logo.png";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [blogModal, setBlogModal] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [typed, setTyped] = useState("");
  const phrases = ["Build Study Habits.", "Track Every Milestone.", "Crush Your Exams.", "Stay Consistent."];
  const [pIdx, setPIdx] = useState(0); const [cIdx, setCIdx] = useState(0); const [del, setDel] = useState(false);
 
  useEffect(() => { const h = () => setScrolled(window.scrollY > 30); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      const w = phrases[pIdx];
      if (!del) { setTyped(w.slice(0, cIdx + 1)); if (cIdx + 1 === w.length) setTimeout(() => setDel(true), 1400); else setCIdx(c => c + 1); }
      else { setTyped(w.slice(0, cIdx - 1)); if (cIdx - 1 === 0) { setDel(false); setPIdx(i => (i + 1) % phrases.length); setCIdx(0); } else setCIdx(c => c - 1); }
    }, del ? 35 : 75);
    return () => clearTimeout(t);
  }, [typed, del, cIdx, pIdx]);
 
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
 
  const BLOGS = [
    { id: 1, icon: "🧠", tag: "Research", title: "The Science of Checkpoint-Based Learning", excerpt: "Spaced repetition and active recall at predefined checkpoints dramatically improve long-term retention compared to passive reading.", author: "Dr. Sayantan Sinha", date: "Mar 10, 2025", read: "5 min", bg: "linear-gradient(135deg,#001a14,#002a20)", content: "Checkpoint assessments force active recall — one of the most powerful learning strategies. Rather than passive re-reading, students who regularly test themselves at structured intervals retain 40–60% more information. StudySpark builds this into the system automatically, ensuring every study cycle ends with a meaningful evaluation." },
    { id: 2, icon: "🔥", tag: "Habits", title: "Why 93% of Students Abandon Study Plans", excerpt: "Research reveals that without continuous feedback loops, even the best study plans collapse within 2 weeks. Here's how to fix that.", author: "Akash Tiwari", date: "Mar 5, 2025", read: "4 min", bg: "linear-gradient(135deg,#1a0d00,#2a1500)", content: "The key to lasting study habits isn't willpower — it's feedback. When students don't see measurable progress, motivation evaporates. StudySpark's streak system, checkpoint scores, and adaptive roadmap adjustments create a continuous feedback loop that keeps learners on track, week after week." },
    { id: 3, icon: "🤖", tag: "AI & Learning", title: "How AI Prevents Academic Failure Before It Happens", excerpt: "Instead of reacting after exam failure, preventive AI systems like StudySpark intervene weeks before the damage is done.", author: "Lakshay Sharma", date: "Feb 28, 2025", read: "6 min", bg: "linear-gradient(135deg,#0a0018,#130028)", content: "Traditional platforms are curative — they respond after poor exam results. StudySpark is preventive. By monitoring roadmap adherence, running weekly conceptual checkpoints, and applying decision-tree logic to reroute study plans, the system catches academic drift before it becomes academic failure." },
  ];
 
  const TEAM = [
    { name: "Akash Tiwari", role: "UI/UX & Frontend Dev", av: "AT", col: "#00d4aa" },
    { name: "Akash Foujdar", role: "Backend", av: "AF", col: "#6366f1" },
    { name: "Lakshay Sharma", role: "Frontend Dev", av: "LS", col: "#f59e0b" },
    { name: "Dhruv Tyagi", role: "Backend & API", av: "DT", col: "#ef4444" },
    { name: "Jayant Kumar", role: "Database", av: "JK", col: "#a855f7" },
  ];
 
  const FEATS = [
    { icon: "🗺️", title: "Adaptive Roadmaps", desc: "Structured subject roadmaps divided into milestone checkpoints. AI reshapes the plan based on your checkpoint performance." },
    { icon: "📋", title: "Checkpoint Evaluation", desc: "Weekly interview-type conceptual questions + application problems to measure deep understanding, not just memorization." },
    { icon: "🤖", title: "AI Decision Engine", desc: "Score < 50%? Full restructure. 50–69%? Targeted fix. 70%+? Optimization only. Adaptive logic that actually works." },
    { icon: "📊", title: "Analytics Dashboard", desc: "Visual score trends, risk indicators, weak topic heatmaps, and consistency tracking in a single powerful view." },
    { icon: "🔥", title: "Streak & Badges", desc: "Daily login streaks, study badges, and a consistency tracker that gamifies your academic progress." },
    { icon: "⚠️", title: "Early Risk Detection", desc: "Risk level indicators alert you before performance decline reaches critical levels. Prevention over cure." },
  ];
 
  return (
    <div>
 
      {/* NAVBAR */}
      <nav className={`hn ${scrolled ? "scrolled" : ""}`}>
        <div className="hn-logo">
          <div className="hn-logo-box"><img src={logo} alt="StudySpark Logo" /></div>
          <span className="hn-logo-name">StudySpark</span>
        </div>
        <ul className="hn-links">
          {[["Features","features"],["Blog","blog"],["About Us","about"],["Contact","contact"]].map(([l,id]) => (
            <li key={id}><a onClick={() => scrollTo(id)}>{l}</a></li>
          ))}
        </ul>
        <div className="hn-btns">
          <button className="btn-outline hn-login" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-primary hn-reg" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>
 
      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <div className="hero-orb" style={{ width: 600, height: 600, top: "10%", left: "-10%", background: "rgba(0,212,170,0.04)" }} />
          <div className="hero-orb" style={{ width: 500, height: 500, top: "20%", right: "-8%", background: "rgba(99,102,241,0.04)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">🎓 AI-Powered Study Platform</div>
          <h1 className="hero-h1">
            <span className="hero-gradient">StudySpark</span><br />
            <span style={{ fontSize: "0.75em" }}>{typed}<span style={{ display: "inline-block", width: 3, height: "0.85em", background: "var(--accent)", marginLeft: 3, animation: "blink 1s infinite", verticalAlign: "middle" }} /></span>
          </h1>
          <p className="hero-p">An AI-powered preventive academic monitoring system that tracks your roadmap, evaluates you at checkpoints, and adapts your study plan — before failure happens.</p>
          <div className="hero-ctas">
            <button className="btn-primary h-cta1" onClick={() => navigate("/register")}>Get Started Free →</button>
            <button className="btn-outline h-cta2" onClick={() => scrollTo("features")}>See Features ↓</button>
          </div>
          <div className="hero-stats">
            {[["500+","Students Enrolled"],["92%","Grade Improvement"],["4.8★","User Rating"],["3x","Faster Progress"]].map(([n,l]) => (
              <div className="hstat" key={l}><div className="hstat-num">{n}</div><div className="hstat-lbl">{l}</div></div>
            ))}
          </div>
        </div>
      </section>
 
      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          {["Roadmap Tracking","Checkpoint Evaluation","AI Decision Engine","Streak System","Weak Topic Heatmap","Performance Analytics","Risk Indicators","Adaptive Routines","Roadmap Tracking","Checkpoint Evaluation","AI Decision Engine","Streak System","Weak Topic Heatmap","Performance Analytics","Risk Indicators","Adaptive Routines"].map((t, i) => (
            <div className="marquee-item" key={i}><span style={{ color: "var(--accent)" }}>◆</span>{t}</div>
          ))}
        </div>
      </div>
 
      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-tag">What We Offer</div>
        <h2 className="section-title">Everything You Need to Excel</h2>
        <p className="section-sub">A preventive, adaptive system that monitors and optimizes your academic journey in real time.</p>
        <div className="feat-grid">
          {FEATS.map((f, i) => (
            <motion.div
              key={f.title}
              className="feat-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* BLOG */}
      <section className="section" id="blog" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="section-tag">Insights</div>
        <h2 className="section-title">From Our Blog</h2>
        <p className="section-sub">Research-backed strategies and AI learning updates from the StudySpark team.</p>
        <div className="blog-grid">
          {BLOGS.map((b, i) => (
            <motion.div
              className="blog-card"
              key={b.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              onClick={() => setBlogModal(b)}
            >
              <div className="blog-thumb" style={{ background: b.bg }}>
                {b.icon}
              </div>

              <div className="blog-body">
                <div className="blog-tag">{b.tag}</div>
                <div className="blog-title">{b.title}</div>
                <div className="blog-excerpt">{b.excerpt}</div>

                <div className="blog-meta">
                  <span>✍️ {b.author}</span>
                  <span>🕐 {b.read} read</span>
                  <span>📅 {b.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* ABOUT US */}
      <section className="section" id="about">
        <div className="section-tag">The Team</div>
        <h2 className="section-title">Meet Our Team</h2>
        <p className="section-sub">StudySpark is developed by a passionate team of students focused on creating smart tools that helps learners build better study habits and stay productive</p>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <motion.div
              className="team-card"
              key={m.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <div className="team-av" style={{ background: m.col + "22", color: m.col }}>
              {m.av}
              </div>

              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* CONTACT */}
      <section className="section" id="contact" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div className="section-tag">Get In Touch</div>
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-wrap">
          <div className="contact-form">
            {sent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 48 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", margin: "14px 0 8px" }}>Message Sent!</div>
                <div style={{ color: "var(--muted)" }}>We'll get back to you within 24 hours.</div>
              </div>
            ) : (
              <>
                <div className="form-row">
                  {[["Name","text","Your name"],["Email","email","your@email.com"]].map(([l,t,ph]) => (
                    <div className="form-group" key={l}>
                      <label className="form-label">{l}</label>
                      <input className="input-field" type={t} placeholder={ph} value={contactForm[l.toLowerCase()]} onChange={e => setContactForm(p => ({ ...p, [l.toLowerCase()]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="input-field" rows={5} placeholder="How can we help you?" style={{ resize: "vertical" }} value={contactForm.msg} onChange={e => setContactForm(p => ({ ...p, msg: e.target.value }))} />
                </div>
                <button className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: 15 }} onClick={() => { if (contactForm.name && contactForm.email && contactForm.msg) setSent(true); }}>Send Message →</button>
              </>
            )}
          </div>
          <div className="contact-info">
            {[["📍","Location","GLA University, Mathura, UP 281406"],["📧","Email","akash.tiwari@gla.ac.in"],].map(([ic,l,v]) => (
              <div className="ci-card" key={l}><div className="ci-icon">{ic}</div><div><div className="ci-label">{l}</div><div className="ci-val">{v}</div></div></div>
            ))}
          </div>
        </div>
      </section>
 
      <footer className="home-footer">
        <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 800, color: "var(--accent)", marginBottom: 8 }}><div className="home-footer-logo"><img src={logo} alt="StudySpark Logo" /></div>StudySpark</div>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>AI Habit Forge</div>
        <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 12 }}>Built with ❤️ by Akash, Akash, Lakshay, Dhruv & Jayant</div>
      </footer>
 
      {blogModal && (
        <Modal title={blogModal.title} onClose={() => setBlogModal(null)}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>{blogModal.icon}</div>
          <div style={{ fontSize: 11, color: "var(--accent3)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{blogModal.tag}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>{blogModal.author} · {blogModal.date} · {blogModal.read} read</div>
          <p style={{ lineHeight: 1.85, color: "var(--text)", fontSize: 15 }}>{blogModal.content}</p>
        </Modal>
      )}
    </div>
  );
}