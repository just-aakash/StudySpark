# ⚡ StudySpark: AI-Powered Learning Evolution

StudySpark is a premium, intelligent, and adaptive learning platform designed to revolutionize the educational experience. By leveraging the power of **Google Gemini AI**, StudySpark provides students with personalized study paths, real-time feedback, and advanced productivity analytics, all wrapped in a stunning, high-performance interface.

---

## 🌟 Core Features

### 🤖 AI-Powered Roadmaps
*   **Dynamic Path Generation**: Enter any subject, and StudySpark generates a structured, multi-node study roadmap tailored to your educational level (e.g., 3rd Year Engineering).
*   **Progressive Learning**: Nodes are color-coded and trackable, allowing you to visualize your journey from novice to master.
*   **Context-Aware**: The AI considers your previous performance and "weak topics" to adjust future roadmap generations.

### 🧠 Smart Checkpoints (Quizzes)
*   **On-Demand Assessment**: Generate quizzes for any enrolled subject instantly.
*   **Intelligent Feedback**: Beyond simple "right/wrong" answers, StudySpark provides conceptual explanations for incorrect answers to ensure deep understanding.
*   **Performance History**: Track your scores over time to see your growth.

### 💬 AI Study Companion
*   **24/7 Chat Support**: Stuck on a concept? Chat with the integrated AI tutor for instant clarifications.
*   **Topic Explanations**: Ask for detailed breakdowns of complex topics directly within the platform.
*   **Personalized Advice**: Receive study tips based on your specific learning profile and goals.

### 📊 Productivity & Focus Analytics
*   **Focus Tracking**: The system monitors engagement, including tab switches, to calculate a real-time **Focus Score**.
*   **Risk Analysis**: AI evaluates your progress across all subjects to assign a **Risk Level** (Low, Moderate, High), helping you prioritize your efforts.
*   **Study Metrics**: Track your daily streaks, study hours, and overall engagement levels.

### 🏆 Gamified Experience
*   **Global Leaderboard**: Compete with students worldwide and climb the ranks based on your checkpoint scores.
*   **Streaks**: Build and maintain daily learning streaks to stay motivated.
*   **Task Management**: Integrated "Today's Tasks" module to keep your daily study goals organized.

### 🔐 Secure & Flexible Access
*   **Multi-Platform OAuth**: Seamless login via **Google**, **GitHub**, and **LinkedIn**.
*   **Standard Auth**: Secure local registration with OTP-based password recovery and email verification.

---

## 🛠️ Technology Stack

### Frontend
- **React 19 (Vite)**: For a blazing-fast, responsive user experience.
- **Tailwind CSS**: Modern, utility-first styling.
- **Framer Motion**: Premium micro-animations and smooth transitions.
- **Lucide React**: Clean, consistent iconography.

### Backend
- **Node.js & Express**: High-performance, scalable server-side architecture.
- **MongoDB (Mongoose)**: Robust, document-based data persistence.
- **Google Gemini API**: State-of-the-art LLM integration for all AI features.
- **JWT & Passport.js**: Advanced authentication and session management.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### Quick Start
1. **Clone the Repo**
   ```bash
   git clone https://github.com/just-aakash/StudySpark.git
   cd StudySpark
   ```

2. **Backend Setup**
   - Navigate to `/backend`, run `npm install`.
   - Create `.env` with `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
   - Run `npm run dev`.

3. **Frontend Setup**
   - Navigate to `/frontend`, run `npm install`.
   - Create `.env` with `VITE_API_URL=http://localhost:5000/api`.
   - Run `npm run dev`.

---

## 📂 Documentation
- **API Reference**: Detailed documentation of all endpoints can be found in [api.md](./api.md).
- **Viva Guide**: Technical insights and potential interview questions are available in [viva.md](./viva.md).

---

## 📝 License
This project is licensed under the ISC License.
