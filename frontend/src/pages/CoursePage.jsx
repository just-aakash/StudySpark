import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Course.css";

const CoursePage = () => {
  const navigate = useNavigate();

  const courses = [
    { id: 1, title: "Data Structures & Algorithms", desc: "Master the foundations of computer science.", color: "#6366f1" },
    { id: 2, title: "Web Development (MERN Stack)", desc: "Build full-stack applications with React & Node.", color: "#00d4aa" },
    { id: 3, title: "Machine Learning with Python", desc: "Dive into world of AI and predictive models.", color: "#f59e0b" },
  ];

  return (
    <div className="course-page-container">
      <header className="course-header">
        <h1>Select Your <span className="highlight">Study Path</span></h1>
        <p>Pick a course and our AI will generate a personalized roadmap just for you.</p>
      </header>

      <div className="course-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card" style={{ borderTop: `4px solid ${course.color}` }}>
            <h3>{course.title}</h3>
            <p>{course.desc}</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Pick This Path →
            </button>
          </div>
        ))}
      </div>

      <button className="back-link" onClick={() => navigate('/')}>
        ← Back to Home
      </button>
    </div>
  );
};

export default CoursePage;
