import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Dashboard.css";

const DashboardPage = ({ user }) => {
  const navigate = useNavigate();
  const displayName = user?.name || "Student";

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">StudySpark</div>
        <div className="nav-user">
          <span>{displayName}</span>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome back, <span className="user-name">{displayName}</span>! ⚡</h1>
          <p>Your AI-powered study roadmap is ready for today's milestones.</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>Daily Streak</h3>
            <p className="stat-value">5 Days</p>
          </div>
          <div className="stat-card">
            <h3>Checkpoint Score</h3>
            <p className="stat-value">88%</p>
          </div>
          <div className="stat-card">
            <h3>Risk Level</h3>
            <p className="stat-value low">Low</p>
          </div>
        </section>

        <section className="dashboard-content">
          <h2>Active Roadmap: Data Structures & Algorithms</h2>
          <div className="roadmap-preview">
            <p>You have 3 chapters to complete this week to reach your next checkpoint.</p>
            <button className="btn-primary">View Full Roadmap</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
