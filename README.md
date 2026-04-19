# ⚡ StudySpark

An intelligent, adaptive learning platform powered by AI. StudySpark transforms the way students learn by offering dynamically generated study roadmaps, gamified assessments, and high-stakes coding challenges, all evaluated in real-time by the Google Gemini API.

## 🌟 Key Features

- **🤖 AI-Powered Study Planning**: Dynamically generate personalized learning roadmaps tailored to individual learning paths using the Gemini API.
- **⚔️ AI Coding Arena**: A high-stakes, gamified coding environment where students solve complex, AI-generated algorithmic challenges. Features an immersive UI, live timer, and progressive hints.
- **🧠 Forensic AI Feedback**: Get detailed, conceptual explanations for incorrect answers during checkpoint submissions to drive adaptive learning and deep understanding.
- **🏆 Gamified Experience**: Track progress with a competitive leaderboard, task management, and interactive checkpoints.
- **⚡ High Performance & Resilient**: Implements a MongoDB-based caching layer for AI responses to handle API rate limits (Quota Exceeded errors) gracefully and ensure platform stability.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS, Framer Motion (for smooth micro-animations)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **State Management / Data Fetching**: React Hooks, Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd StudySpark
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
StudySpark/
├── backend/          # Node.js + Express backend
│   ├── package.json
│   └── server.js     # Main entry point (includes AI and Caching logic)
└── frontend/         # React + Vite frontend
    ├── src/          # Source code including components & pages
    ├── index.html    # Entry HTML
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is licensed under the ISC License.
