import { useState, useEffect, useRef } from "react";
import "../styles/Dashboard.css";
import logo from "../assets/logo.png";
import DashboardHome from "../pages/DashboardHome";
import Roadmap from "../pages/Roadmap";
import About from "../pages/About";
import Checkpoints from "../pages/Checkpoints";
import Contact from "../pages/Contact";

const I = {
  Dashboard: () => <svg className="db-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Roadmap: () => <svg className="db-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>,
  Checkpoints: () => <svg className="db-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  About: () => <svg className="db-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Contact: () => <svg className="db-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3a5a7a" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>,
  Profile: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Logout: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Task: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a8aaa" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Avatar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8aadcc" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

const PerfChart = () => {
const data = [
    { week:"Week 1", val:60, x:80 },
    { week:"Week 2", val:68, x:200 },
    { week:"Week 3", val:74, x:320 },
    { week:"Week 4", val:78, x:440 },
];
  const toY = v => 40 + 100 * (1 - v / 100);
  const pts = data.map(d => `${d.x},${toY(d.val)}`).join(" ");
return (
    <svg width="100%" viewBox="0 0 520 165" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(74,180,200,0.18)"/>
          <stop offset="100%" stopColor="rgba(74,180,200,0)"/>
        </linearGradient>
      </defs>
      {[0,25,50,75,100].map(v => (
        <g key={v}>
          <line x1="55" y1={toY(v)} x2="480" y2={toY(v)} stroke="rgba(60,90,130,0.25)" strokeWidth="1" strokeDasharray="4,4"/>
          <text x="44" y={toY(v)+4} textAnchor="end" fill="#3a5a7a" fontSize="10">{v}%</text>
        </g>
      ))}
      <polygon points={`80,${toY(0)} ${pts} 440,${toY(0)}`} fill="url(#areaG)"/>
      <polyline points={pts} fill="none" stroke="#5abdd0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map(d => (
        <g key={d.week}>
          <circle cx={d.x} cy={toY(d.val)} r="5" fill="#5abdd0" stroke="#0d1520" strokeWidth="2"/>
          <text x={d.x} y={toY(d.val)-10} textAnchor="middle" fill="#8aadcc" fontSize="11" fontWeight="600">{d.val}%</text>
          <text x={d.x} y="158" textAnchor="middle" fill="#3a5a7a" fontSize="10">{d.week}</text>
        </g>
      ))}
    </svg>
);
};

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [dropOpen, setDropOpen] = useState(false);
  const [streak] = useState({
current:7,
best:15
});
  const dropRef = useRef(null);


  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const navItems = [
    { label:"Dashboard", Icon:I.Dashboard },
    { label:"Roadmap", Icon:I.Roadmap },
    { label:"Checkpoints", Icon:I.Checkpoints },
    { label:"About Us", Icon:I.About },
    { label:"Contact Us", Icon:I.Contact },
  ];

  const [tasks,setTasks] = useState([
{ title:"Study Binary Search Concept", sub:"Concept Study", tag:"Concept Study", done:false },
{ title:"Solve 10 Array Problems", sub:"Practice Problems", tag:"Practice Problems", done:false },
{ title:"Revise Recursion Notes", sub:"Revision", tag:"Revision", done:false },
{ title:"Complete Practice Quiz", sub:"Practice Quiz", tag:"Practice Quiz", done:false },
]);

const handleLogout = () => {
localStorage.removeItem("token")
window.location.href = "/login"
}

const toggleTask = (index) => {
  const updated = [...tasks];
  updated[index].done = !updated[index].done;
  setTasks(updated);
};
const completedTasks = tasks.filter(t => t.done).length;

  const weakTopics = [
    { name:"Arrays", pct:80, color:"#3abba0", mcolor:"#2a8a78" },
    { name:"Recursion", pct:52, color:"#c8882a", mcolor:"#a06820" },
    { name:"Graphs", pct:65, color:"#4a78cc", mcolor:"#3a5aaa" },
  ];

  return (
    <div className="db-page">

      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo">
          <img src={logo} alt="StudySpark Logo" className="logo-img"/>
            StudySpark
        </div>
        <nav className="db-nav">
          {navItems.map(({ label, Icon }) => (
            <button key={label} className={`db-nav-item${activeNav===label?" active":""}`}
              onClick={() => setActiveNav(label)}>
              <Icon/> {label}
            </button>
          ))}
        </nav>
        <div className="db-sidebar-footer">
          <div className="db-footer-title">StudySpark</div>
          <div className="db-footer-sub">v 1.0.0 © 2025 Studyspark Inc.</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="db-main">

        {/* TOPBAR */}
        <div className="db-topbar">
          <button className="db-filter-btn"><I.Filter/></button>
          <div className="db-search-wrap">
            <I.Search/>
            <input placeholder="Search for something"/>
          </div>
          <div style={{position:"relative"}} ref={dropRef}>
            <div className="db-avatar" onClick={() => setDropOpen(v => !v)}>
              <I.Avatar/>
            </div>
            {dropOpen && (
              <div className="db-dropdown">
                <div className="db-dropdown-hi">Hi User</div>
                <button className="db-dropdown-item"><I.Profile/> My Profile</button>
                <button className="db-dropdown-item"><I.Settings/> Settings</button>
                <button className="db-dropdown-item" onClick={handleLogout}>
<I.Logout/> Logout
</button>
              </div>
            )}
          </div>
        </div>
            <div className="db-content">

{activeNav==="Dashboard" && (
<>

<DashboardHome/>

{/* ALL YOUR DASHBOARD CARDS */}
<div className="db-card streak-card">
...
</div>

<div className="db-card roadmap-card">
...
</div>

<div className="db-card checkpoints-card">
...
</div>

<div className="db-card weak-card">
...
</div>

<div className="db-card tasks-card">
...
</div>

<div className="db-card perf-card">
...
</div>

</>
)}

{activeNav==="Roadmap" && <Roadmap/>}

{activeNav==="About Us" && <About/>}

{activeNav==="Checkpoints" && <Checkpoints/>}

{activeNav==="Contact Us" && <Contact/>}

          
          {/* CONTENT */}
          <div className="db-card streak-card">
  <div className="db-card-title">Study Streak</div>

  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>

    <div style={{fontSize:"32px"}}>🔥</div>

    <div>
      <div style={{fontSize:"24px",fontWeight:"bold"}}>
        {streak.current} Days
      </div>

      <div style={{fontSize:"13px",color:"#8aadcc"}}>
        Best: {streak.best} Days
      </div>
    </div>

  </div>
</div>


          {/* DSA ROADMAP */}
          <div className="db-card roadmap-card">
            <div className="db-card-title">DSA Roadmap</div>
            <div className="roadmap-inner">
              <svg width="120" height="120" viewBox="0 0 120 120" style={{flexShrink:0}}>
                <defs>
                  <radialGradient id="arcBg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(20,40,70,0.8)"/>
                    <stop offset="100%" stopColor="rgba(10,20,40,0.4)"/>
                  </radialGradient>
                  <linearGradient id="arcStroke" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3a8aaa"/>
                    <stop offset="100%" stopColor="#5abdd0"/>
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="54" fill="url(#arcBg)"/>
                <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(40,70,110,0.4)" strokeWidth="10"
                  strokeDasharray="240 50" strokeDashoffset="20" strokeLinecap="round"/>
                <circle cx="60" cy="60" r="46" fill="none" stroke="url(#arcStroke)" strokeWidth="10"
                  strokeDasharray="113 289" strokeDashoffset="72" strokeLinecap="round"/>
              </svg>
              <div className="roadmap-info">
                <div className="roadmap-info-title">DSA Roadmap</div>
                <div className="roadmap-pct">45%</div>
                <div className="roadmap-sub">45% Completed</div>
                <div className="roadmap-bar-wrap"><div className="roadmap-bar-fill"/></div>
                <div className="roadmap-label">DSA Roadmap</div>
              </div>
            </div>
          </div>

          {/* UPCOMING CHECKPOINTS */}
          <div className="db-card checkpoints-card">
            <div className="db-card-title">Upcoming Checkpoints</div>
            <div className="checkpoints-scroll">
              {[
                { cls:"cp-card-1", badge:"cp-badge-1", badgeText:"Soon",
                  Icon:()=><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="rgba(80,180,190,0.5)" strokeWidth="2.5"/><circle cx="16" cy="16" r="6" stroke="rgba(80,180,190,0.7)" strokeWidth="2"/><circle cx="16" cy="16" r="2.5" fill="rgba(80,200,210,0.9)"/></svg>,
                  name:"Checkpoint 1", topic:"Arrays & Searching", days:"2" },
                { cls:"cp-card-2", badge:"cp-badge-2", badgeText:"Soon",
                  Icon:()=><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 6 A10 10 0 1 1 6 16 A10 10 0 0 1 16 6" stroke="rgba(160,140,230,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M16 10 A6 6 0 1 1 10 16" stroke="rgba(160,140,230,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>,
                  name:"Checkpoint 2", topic:"Recursion", days:"4" },
                { cls:"cp-card-3", badge:null, badgeText:null,
                  Icon:()=><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="8" y="8" width="16" height="16" rx="4" stroke="rgba(180,180,220,0.5)" strokeWidth="2.5"/><rect x="12" y="12" width="8" height="8" rx="2" fill="rgba(180,180,220,0.3)"/></svg>,
                  name:"Checkpoint 3", topic:"Dynamic Programming", days:"6" },
              ].map((cp, i) => (
                <div key={i} className={`cp-card ${cp.cls}`}>
                  <div className="cp-icon"><cp.Icon/></div>
                  <div className="cp-name">{cp.name}</div>
                  <div className="cp-topic">{cp.topic}</div>
                  <div className="cp-days">In <strong>{cp.days} days</strong></div>
                  {cp.badge && <span className={`cp-badge ${cp.badge}`}>{cp.badgeText}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* WEAK TOPICS */}
          <div className="db-card weak-card">
            <div className="db-card-title">Weak Topics</div>
            <div className="weak-grid">
              {weakTopics.map(t => (
                <div key={t.name} className="weak-item">
                  <div className="weak-item-name">{t.name}</div>
                  <div className="weak-bar-row">
                    <div className="weak-bar-track">
                      <div className="weak-bar-fill" style={{width:`${t.pct}%`,background:t.color}}/>
                    </div>
                    <span className="weak-pct">{t.pct}%</span>
                  </div>
                  <div className="weak-mini-bar" style={{width:`${t.pct*0.6}%`,background:t.mcolor,opacity:0.5}}/>
                </div>
              ))}
            </div>
          </div>

          {/* TODAY'S TASKS */}
<div className="db-card tasks-card">
  <div className="db-card-title">
  Today's Study Tasks
  <span className="task-progress">
    {completedTasks} / {tasks.length} Completed
  </span>
</div>

  {tasks.map((task, i) => (
    <div 
      key={i}
      className="task-item"
      onClick={() => toggleTask(i)}
      style={{cursor:"pointer"}}
    >

      <div className="task-left">
        <div className="task-icon"><I.Task/></div>

        <div>
          <div 
  className="task-title"
  style={{
    textDecoration: task.done ? "line-through" : "none",
    opacity: task.done ? 0.5 : 1
  }}
>
  {task.done ? "✔ " : ""}{task.title}
</div>
          <div className="task-sub">{task.sub}</div>
        </div>
      </div>

      <div className="task-tag">
        <div className="tag-dot"/>
        {task.tag}
      </div>

    </div>
  ))}

</div>

          {/* CHECKPOINT PERFORMANCE */}
          <div className="db-card perf-card">
            <div className="db-card-title">Checkpoint Performance</div>
            <PerfChart/>
          </div>

        </div>
      </div>
    </div>
  );
}