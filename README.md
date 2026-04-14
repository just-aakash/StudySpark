# StudySpark

StudySpark is a comprehensive learning and education platform featuring user authentication, course management, dynamic learning roadmaps, and a user dashboard to track progress and checkpoints. 

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)

## Features
- **User Authentication:** Secure signup, login, and password recovery using JWT and bcrypt.
- **Interactive Dashboard:** Track learning progress, access active courses, and view upcoming updates with a built-in calendar.
- **Course Management:** Browse, select, and enroll in various courses structured to enhance learning.
- **Learning Roadmaps:** Guided learning paths for different subjects or skills.
- **Checkpoints & Milestones:** Set and track learning milestones effectively.
- **Responsive & Modern Design:** A beautifully crafted, fully responsive UI built with Tailwind CSS and Framer Motion for a seamless experience across desktop and mobile devices.

## Tech Stack
### Frontend
- **React.js (v19)** - Core library for building the UI
- **Vite** - Lightning fast build tool and frontend development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Production-ready animation library for React
- **React Router DOM** - Declarative routing for React web applications
- **Axios** - Promise-based HTTP client for the browser and node.js
- **React Calendar** & **Sonner** - For calendar integration and toast notifications

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated, minimalist web framework for Node.js
- **MongoDB & Mongoose** - NoSQL database and object modeling tool for MongoDB
- **JSON Web Tokens (JWT)** - For secure, stateless user authentication
- **Bcrypt.js** - For secure password hashing

## Project Structure
```text
StudySpark/
├── backend/
│   ├── config/          # Database connection and environment configurations
│   ├── controllers/     # Route logic handling
│   ├── middlewares/     # Custom middlewares (e.g., auth verifications)
│   ├── models/          # Mongoose schemas (e.g., User)
│   ├── routes/          # Express route definitions (auth, roadmaps, checkpoints)
│   ├── package.json     # Backend dependencies
│   └── server.js        # Main entry point for the backend
└── frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── assets/      # Images, icons, etc.
    │   ├── components/  # Reusable React components (e.g., Modal)
    │   ├── pages/       # High-level views (Home, Login, Register, Dashboard, etc.)
    │   ├── services/    # API integration calls (Axios wrappers)
    │   ├── styles/      # Global CSS files
    │   ├── App.jsx      # Main application router
    │   └── main.jsx     # Frontend entry point
    ├── package.json     # Frontend dependencies
    ├── postcss.config.js# PostCSS settings
    ├── tailwind.config.js # Tailwind settings
    └── vite.config.js   # Vite settings
```

## Prerequisites
Ensure that the following tools are installed on your local machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)
- Git

## Installation
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd StudySpark
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

## Environment Variables
Create a `.env` file in the `backend/` directory and configure the appropriate keys based on your setup. A typical `.env` might look like:
```env
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secure_jwt_secret_key>
```

## Running the Application
### Start the Backend Server (Development mode)
Open a new terminal and run:
```bash
cd backend
npm run dev
# The backend API should now be running on http://localhost:5000
```

### Start the Frontend Application
Open another terminal and run:
```bash
cd frontend
npm run dev
# The frontend app will be available at http://localhost:5173
```
