import { useState } from "react";
import "../styles/Home.css";
import logo from "../assets/logo.png";
import post1 from "../assets/post1.jpg";
import post2 from "../assets/post2.jpg";
import post3 from "../assets/post3.jpg";
import { Link } from "react-router-dom";

const Scene1 = () => (
  <svg width="100%" height="180" viewBox="0 0 300 180" style={{position:"absolute",top:0,left:0}}>
    <defs>
      <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1a2030"/><stop offset="100%" stopColor="#0a0f18"/>
      </linearGradient>
    </defs>
    <rect width="300" height="180" fill="url(#sg1)"/>
    <ellipse cx="80" cy="90" rx="60" ry="40" fill="rgba(255,200,120,0.08)"/>
    <ellipse cx="120" cy="155" rx="30" ry="8" fill="rgba(0,0,0,0.3)"/>
    <rect x="100" y="100" width="40" height="50" rx="8" fill="#1a2535" opacity="0.6"/>
    <ellipse cx="120" cy="95" rx="14" ry="14" fill="#1e2d40" opacity="0.7"/>
    <rect x="70" y="120" width="80" height="50" rx="4" fill="#0d1825" opacity="0.5"/>
    <rect x="72" y="122" width="76" height="46" rx="3" fill="rgba(74,158,255,0.08)"/>
  </svg>
);
const Scene2 = () => (
  <svg width="100%" height="180" viewBox="0 0 300 180" style={{position:"absolute",top:0,left:0}}>
    <defs>
      <linearGradient id="sg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#15202e"/><stop offset="100%" stopColor="#0a0f18"/>
      </linearGradient>
    </defs>
    <rect width="300" height="180" fill="url(#sg2)"/>
    <ellipse cx="150" cy="80" rx="80" ry="50" fill="rgba(200,220,255,0.05)"/>
    <ellipse cx="100" cy="155" rx="25" ry="7" fill="rgba(0,0,0,0.3)"/>
    <rect x="80" y="105" width="35" height="45" rx="8" fill="#1a2535" opacity="0.6"/>
    <ellipse cx="98" cy="100" rx="12" ry="12" fill="#1e2d40" opacity="0.7"/>
    <ellipse cx="175" cy="155" rx="25" ry="7" fill="rgba(0,0,0,0.3)"/>
    <rect x="155" y="100" width="35" height="50" rx="8" fill="#1a2535" opacity="0.6"/>
    <ellipse cx="172" cy="95" rx="12" ry="12" fill="#1e2d40" opacity="0.7"/>
  </svg>
);
const Scene3 = () => (
  <svg width="100%" height="180" viewBox="0 0 300 180" style={{position:"absolute",top:0,left:0}}>
    <defs>
      <linearGradient id="sg3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1a1e2a"/><stop offset="100%" stopColor="#0a0f18"/>
      </linearGradient>
    </defs>
    <rect width="300" height="180" fill="url(#sg3)"/>
    <ellipse cx="160" cy="100" rx="70" ry="50" fill="rgba(255,180,80,0.06)"/>
    <ellipse cx="150" cy="158" rx="30" ry="8" fill="rgba(0,0,0,0.3)"/>
    <rect x="125" y="100" width="45" height="55" rx="8" fill="#1a2535" opacity="0.6"/>
    <ellipse cx="148" cy="95" rx="14" ry="14" fill="#1e2d40" opacity="0.7"/>
    <rect x="90" y="130" width="110" height="30" rx="4" fill="#0d1825" opacity="0.6"/>
  </svg>
);

const SSLogo = () => (
  <svg width="32" height="32" viewBox="0 0 120 100" fill="none">
    <path d="M 15,42 A 18,18 0 1,1 51,42" stroke="white" strokeWidth="12" fill="none" strokeLinecap="butt"/>
    <path d="M 51,42 A 18,18 0 1,0 15,58" stroke="white" strokeWidth="12" fill="none" strokeLinecap="round"/>
    <path d="M 15,58 A 10,10 0 0,0 33,70" stroke="white" strokeWidth="12" fill="none" strokeLinecap="round"/>
    <path d="M 51,42 A 18,18 0 1,1 87,42" stroke="white" strokeWidth="12" fill="none" strokeLinecap="butt"/>
    <path d="M 87,30 A 10,10 0 0,0 105,18" stroke="white" strokeWidth="12" fill="none" strokeLinecap="round"/>
    <path d="M 87,42 A 18,18 0 1,0 51,58" stroke="white" strokeWidth="12" fill="none" strokeLinecap="round"/>
  </svg>
);

const TOPICS = [
  { name:"Arrays", pct:83 }, { name:"Recursion", pct:0 },
  { name:"Stacks", pct:55 }, { name:"Graphs", pct:33 },
];

const ALL_POSTS = [
  { id:1, image:post1, tag:"Study Tips", category:"Study Tips", title:"10 Proven Strategies to Improve Concentration While Studying", excerpt:"Struggling to focus? Discover ten effective strategies to boost your concentration and make the most out of your study sessions.", author:"Akash Tiwari", initials:"AT", date:"2 days ago" },
  { id:2, image:post2, tag:"Study Tips", category:"Study Tips", title:"How to Create Effective Study Plans Using StudySpark", excerpt:"Learn how StudySpark's AI-driven system helps you create effective and customized study plans that keep you on track.", author:"Dhruv Tyagi", initials:"DT", date:"5 days ago" },
  { id:3, image:post3, tag:"Study Tips", category:"Study Tips", title:"Understanding Adaptive Learning and Its Benefits", excerpt:"Curious about adaptive learning? Discover how it can personalize your study experience and boost your learning outcomes.", author:"Lakshay Sharma", initials:"LS", date:"1 week ago" },
  { id:4, Scene:Scene1, tag:"Productivity", category:"Productivity", title:"The Pomodoro Technique: A Deep Dive for Students", excerpt:"Learn how the Pomodoro method can transform your study sessions into focused, productive blocks of time.", author:"Akash Tiwari", initials:"AT", date:"2 weeks ago" },
  { id:5, Scene:Scene2, tag:"AI Learning", category:"AI Learning", title:"How AI Personalizes Your Learning Path", excerpt:"Explore how StudySpark's AI engine adapts to your unique strengths and weaknesses to create a smarter study roadmap.", author:"Dhruv Tyagi", initials:"DT", date:"3 weeks ago" },
  { id:6, Scene:Scene3, tag:"Habits", category:"Habits", title:"Building a Daily Study Routine That Actually Sticks", excerpt:"Consistency is key. Discover science-backed techniques to build study habits that last well beyond exam season.", author:"Lakshay Sharma", initials:"LS", date:"1 month ago" },
];

const BlogCard = ({ post }) => (
  <div className="ss-blog-card">
    <div className="ss-blog-img-wrap">
      <img src={post.image} alt={post.title} className="ss-blog-img"/>
      <span className="ss-blog-tag">{post.tag}</span>
    </div>
    <div className="ss-blog-content">
      <div className="ss-blog-cat">{post.category}</div>
      <div className="ss-blog-card-title">{post.title}</div>
      <div className="ss-blog-excerpt">{post.excerpt}</div>
      <div className="ss-blog-footer">
        <div className="ss-author">
          <div className="ss-avatar">{post.initials}</div>
          <div>
            <div className="ss-author-name">{post.author}</div>
            <div className="ss-author-date">{post.date}</div>
          </div>
        </div>
        <button className="ss-btn-read-more">Read More</button>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [activeNav, setActiveNav] = useState("Home");
  const [showAll, setShowAll] = useState(false);

  

  return (
    <div className="ss-page">

      {/* NAV */}
      <nav className="ss-nav">
        <div className="ss-logo">
        <img src={logo} alt="StudySpark Logo" className="logo-img"/>
        StudySpark
        </div>
        <ul className="ss-nav-links">
  <li>
    <button onClick={() => document.getElementById("home").scrollIntoView({ behavior: "smooth" })}>
      Home
    </button>
  </li>

  <li>
    <button onClick={() => document.getElementById("insights").scrollIntoView({ behavior: "smooth" })}>
      Insights
    </button>
  </li>

  <li>
    <button onClick={() => document.getElementById("about").scrollIntoView({ behavior: "smooth" })}>
      About Us
    </button>
  </li>

  <li>
    <button onClick={() => document.getElementById("contact").scrollIntoView({ behavior: "smooth" })}>
      Contact Us
    </button>
  </li>
</ul>
        <div className="ss-nav-actions">
          <Link to="/login">
          <button className="ss-btn-login">Log in</button>
          </Link>
          <button className="ss-btn-register">Register</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="ss-hero">
        <div className="ss-hero-bg1" /><div className="ss-hero-bg2" />
        <span className="ss-star ss-s1">✦</span>
        <span className="ss-star ss-s2">✦</span>
        <span className="ss-star ss-s3">✦</span>
        <div className="ss-hero-content">
          <h1>Achieve Your Study Goals with AI-Driven Habit Formation</h1>
          <p>StudySpark is an AI-based platform that helps students build consistent study habits, track their academic progress, and achieve success.</p>
          <button className="ss-btn-get-started">Get Started</button>
        </div>
        <div className="ss-mockup">
          {/* Tablet */}
          <div className="ss-tablet">
            <div className="ss-tablet-bar">
              <span className="ss-tablet-brand">StudySpark</span>
              <div className="ss-tablet-nav">
                {["News","StartSum","Blog","Settings"].map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
            <div className="ss-tablet-body">
              <div className="ss-tablet-sidebar">
                <div className="ss-sidebar-list">
                  {["Dashboard","Progress","Completed","About Us","Contact Us"].map(item => (
                    <div key={item} className={`ss-sidebar-item${item === "Dashboard" ? " active" : ""}`}>{item}</div>
                  ))}
                </div>
                <div className="ss-mockup-main">
                  <div className="ss-mockup-title">DSA Roadmap</div>
                  <div className="ss-progress-card">
                    <div className="ss-progress-label">DSA Roadmap</div>
                    <div className="ss-progress-pct">45%</div>
                    <div className="ss-progress-sub">45% Completed</div>
                    <div className="ss-progress-bar-wrap"><div className="ss-progress-bar-fill" /></div>
                  </div>
                  <div className="ss-topic-row">
                    {TOPICS.map(t => (
                      <div key={t.name} className="ss-topic-item">
                        <div className="ss-topic-name">{t.name}</div>
                        <div className="ss-topic-pct">{t.pct}%</div>
                        <div className="ss-topic-mini-bar">
                          <div style={{height:"100%",background:"#4a9eff",borderRadius:2,width:`${t.pct}%`}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Phone */}
          <div className="ss-phone">
            <div className="ss-phone-bar">StudySpark</div>
            <div className="ss-phone-body">
              <div className="ss-phone-card">
                <div className="ss-phone-card-title">Checkpoint 1</div>
                <div className="ss-checkpoint-row">
                  <div className="ss-checkpoint">
                    <div className="ss-checkpoint-label">Checkpoint 1<br/>Savet & Seen<br/>exercise</div>
                    <span className="ss-checkpoint-btn">Start</span>
                  </div>
                  <div className="ss-checkpoint">
                    <div className="ss-checkpoint-label">Checkpoint 1<br/>Recursion<br/>in 4 days</div>
                    <span className="ss-checkpoint-btn">Start</span>
                  </div>
                </div>
              </div>
              <div style={{fontSize:9,color:"#556677",padding:"4px 0 2px"}}>Topten Checkpoint</div>
              <div className="ss-chart">
                {[20,28,16,22,32].map((h,i) => (
                  <div key={i} className="ss-chart-bar" style={{height:h,background:`rgba(74,158,255,${0.3+i*0.07})`}} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="insights" className="ss-blog">
        <div className="ss-section-header">
          <div className="ss-section-spacer" />
          <h2 className="ss-section-title">Latest Study Tips &amp; Insights</h2>
          
        </div>
        <div className="ss-blog-grid">
          {ALL_POSTS.slice(0,3).map(post => <BlogCard key={post.id} post={post} />)}
        </div>
      </section>
{/* ABOUT US */}
<section id="about" className="ss-about">
  <div className="ss-about-container">
    <h2>About StudySpark</h2>
    <p>
      StudySpark is an AI-powered learning platform designed to help students 
      build consistent study habits and achieve their academic and career goals. 
      Our platform analyzes each learner’s strengths, weaknesses, and interests 
      to generate personalized learning roadmaps.
    </p>

    <p>
      By combining smart technology with structured learning strategies, 
      StudySpark helps students stay focused, track their progress, and 
      continuously improve their skills. Whether you are preparing for exams 
      or learning new technologies, StudySpark makes learning more effective 
      and organized.
    </p>
  </div>
</section>

      {/* CTA */}
      <section className="ss-cta">
        <div className="ss-cta-bg1" /><div className="ss-cta-bg2" />
        <span className="ss-cta-star1">✦</span>
        <span className="ss-cta-star2">✦</span>
        <h2>Join StudySpark Today</h2>
        <p>Ready to take your studies to the next level? Sign up now and start building better study habits.</p>
        <div className="ss-cta-btns">
          <button className="ss-btn-signup">Sign Up for Free</button>
          <button className="ss-btn-cta-login">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Log in
          </button>
        </div>
      </section>
{/* CONTACT US */}
<section id="contact" className="ss-contact">
  <div className="ss-contact-container">
    <h2>Contact Us</h2>
    <p>If you have any questions or suggestions, feel free to reach out to us.</p>

    <div className="ss-contact-info">
    <p><strong>Email:</strong> 
        <a href="mailto: akash.tiwari_cs24@gla.ac.in">akash@example.com</a>
    </p>
    <p><strong>Phone:</strong> 
        <a href="tel: +918081569098">+91 9876543210</a>
    </p>
    </div>
  </div>
</section>
    </div>
  );
}