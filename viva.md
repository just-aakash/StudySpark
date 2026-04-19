# 🎓 StudySpark - Viva Preparation Guide

This document covers the complete technology stack used in **StudySpark**, along with potential viva (oral examination) questions and conceptual explanations to help you prepare.

---

## 🏗️ 1. Frontend Technologies

### React.js (v19)
**Description:** A JavaScript library for building user interfaces based on reusable components. React uses a Virtual DOM to optimize rendering performance.
**Potential Viva Questions:**
*   **Q: Why did you choose React for this project?**
    *   *Answer:* React allows for building complex, interactive UIs using modular, reusable components. Its Virtual DOM ensures efficient DOM updates, which is crucial for dynamic features like the AI Coding Arena, real-time leaderboard, and live timers.
*   **Q: What are React Hooks, and which ones did you use?**
    *   *Answer:* Hooks let you use state and lifecycle features in functional components without writing classes. Common ones used are `useState` (for managing local state like inputs), `useEffect` (for side effects like fetching data from the backend or Gemini API), and potentially `useRef` (for referencing DOM elements).
*   **Q: What is the Virtual DOM?**
    *   *Answer:* A lightweight copy of the actual DOM stored in memory. When state changes, React updates the Virtual DOM first, compares it with the previous version (diffing), and then applies *only* the calculated differences to the real browser DOM. This makes UI rendering much faster.

### Vite
**Description:** A modern, extremely fast build tool and development server.
**Potential Viva Questions:**
*   **Q: Why use Vite instead of Create React App (Webpack)?**
    *   *Answer:* Vite provides significantly faster cold server starts and Instant Hot Module Replacement (HMR). It serves source code over native ES Modules (ESM) during development, so it only transforms code on demand as the browser requests it, rather than bundling the entire app on every save.

### Tailwind CSS
**Description:** A utility-first CSS framework for rapidly building custom user interfaces directly in HTML/JSX.
**Potential Viva Questions:**
*   **Q: What is the advantage of using Tailwind CSS over standard CSS or Bootstrap?**
    *   *Answer:* Tailwind eliminates the need to switch context between CSS and JSX files, speeding up development. Unlike Bootstrap, which provides pre-designed (often generic-looking) components, Tailwind provides low-level utility classes (like `flex`, `p-4`, `text-center`) allowing for completely custom, unique designs without writing raw CSS.

### Framer Motion
**Description:** A production-ready motion library for React that makes creating complex animations simple.
**Potential Viva Questions:**
*   **Q: How did you handle animations in your project?**
    *   *Answer:* I used Framer Motion. It allows declarative animations by replacing standard HTML tags with `motion` tags (e.g., `<motion.div>`) and providing properties like `initial`, `animate`, and `exit`. It was essential for creating the immersive, gamified UI experience.

---

## ⚙️ 2. Backend Technologies

### Node.js
**Description:** A JavaScript runtime environment built on Chrome's V8 engine that allows executing JavaScript code server-side.
**Potential Viva Questions:**
*   **Q: Is Node.js single-threaded? How does it handle multiple simultaneous requests?**
    *   *Answer:* Yes, Node.js runs on a single main thread. However, it handles concurrency using a non-blocking, asynchronous I/O model and an "Event Loop". When an I/O operation (like querying the database or calling the Gemini API) is initiated, Node offloads it to the system kernel and continues executing other code. Once the operation finishes, a callback is placed in the event queue to be processed.

### Express.js
**Description:** A minimal and flexible Node.js web application framework providing robust features for APIs and routing.
**Potential Viva Questions:**
*   **Q: What is Middleware in Express?**
    *   *Answer:* Middleware are functions that execute during the request-response cycle. They have access to the request object (`req`), response object (`res`), and the `next` function. In StudySpark, middleware is used for parsing JSON bodies (`express.json()`), handling CORS, and verifying JWT authentication tokens before allowing access to protected routes.

### MongoDB & Mongoose
**Description:** MongoDB is a NoSQL, document-oriented database. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.
**Potential Viva Questions:**
*   **Q: Why did you choose NoSQL (MongoDB) instead of SQL (MySQL/PostgreSQL)?**
    *   *Answer:* MongoDB stores data in flexible, JSON-like documents. In a project like StudySpark, where AI dynamically generates varied data structures (like customized study roadmaps, variable tasks, and dynamic coding challenges), a schema-less document database provides the agility needed to store these complex nested objects easily.
*   **Q: What is the purpose of Mongoose?**
    *   *Answer:* Mongoose acts as an ODM layer on top of MongoDB. It provides strict schema validation at the application level, helps manage relationships between data models, and translates JavaScript objects in our code to their document representation in the database.

---

## 🧠 3. Core AI Integration

### Google Generative AI (Gemini API)
**Description:** Google's Large Language Model API used as the core intelligence engine for StudySpark.
**Potential Viva Questions:**
*   **Q: How exactly is AI integrated into your application?**
    *   *Answer:* We use the `@google/generative-ai` SDK on the Node backend. It acts as the brain of the platform. We use it to:
        1. Dynamically generate personalized study roadmaps.
        2. Power the high-stakes Coding Arena by generating algorithmic challenges and evaluating the student's submitted code.
        3. Provide "Forensic Feedback" by analyzing incorrect quiz/checkpoint answers to conceptually explain to the student where they went wrong.
*   **Q: Did you face any challenges with the AI API, and how did you solve them?**
    *   *Answer:* Yes, I encountered "Quota Exceeded" (HTTP 429) rate limit errors from the Gemini API. To solve this and ensure platform stability, I implemented a MongoDB-based caching layer. When a prompt is generated, the system checks the database first. If a similar response exists and is fresh, it serves the cached response, significantly reducing API calls and improving speed.

---

## 🔐 4. Authentication & Security

### JSON Web Tokens (JWT) & Bcryptjs
**Description:** JWT is an open standard for securely transmitting information as a JSON object. Bcryptjs is a password hashing algorithm.
**Potential Viva Questions:**
*   **Q: Explain your authentication and authorization flow.**
    *   *Answer:* 
        1. **Registration:** User enters a password. The backend uses `bcryptjs` to hash this password before storing it in MongoDB.
        2. **Login:** User enters credentials. We hash the input and compare it to the DB. If matched, the server generates a JWT containing the user's ID, signed with a secret key (`JWT_SECRET`).
        3. **Access:** The client stores this JWT and sends it in the `Authorization: Bearer <token>` header on subsequent API requests. The backend middleware verifies the token signature to authenticate the user.
*   **Q: Why hash passwords, and why use bcrypt specifically?**
    *   *Answer:* Storing plain text passwords is a critical security vulnerability. We use bcrypt because it automatically generates a random "salt" (random string added to the password before hashing) to defend against rainbow table attacks. It is also intentionally slow (key stretching), which makes brute-force attacks computationally infeasible.

---

## 🚀 5. Architecture Concepts

### REST API Architecture
**Potential Viva Questions:**
*   **Q: What makes your backend API a "REST API"?**
    *   *Answer:* It follows REST (Representational State Transfer) principles. It uses standard HTTP methods (GET for reading, POST for creating, PUT/PATCH for updating, DELETE for removing). It treats data as resources identified by logical URLs (e.g., `/api/users`, `/api/roadmaps`). Importantly, it is stateless; the server does not store client state between requests—the JWT handles session state.

### Single Page Application (SPA)
**Potential Viva Questions:**
*   **Q: StudySpark is a Single Page Application. What does that mean?**
    *   *Answer:* An SPA is a web application that loads only a single HTML document (`index.html`). When the user navigates (using React Router), the browser does not reload the entire page from the server. Instead, JavaScript dynamically rewrites the current webpage with new data fetched via backend APIs. This results in a faster, app-like user experience without screen flickering.
