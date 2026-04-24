# StudySpark API Documentation

This document provides a comprehensive overview of the APIs used in the StudySpark platform.

## Base URL
The API base URL is: `http://localhost:5000/api` (default development port)

---

## 1. Authentication (`/api/auth`)

These endpoints handle user registration, login, password recovery, and third-party OAuth.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new user with full profile details. |
| `POST` | `/login` | Public | Authenticate user and receive a JWT token. |
| `POST` | `/forgot-password` | Public | Request a password reset via Email (link) or Phone (OTP). |
| `POST` | `/verify-otp` | Public | Verify the 6-digit OTP sent to the user's phone. |
| `POST` | `/reset-password/:token` | Public | Reset password using a valid reset token. |
| `GET` | `/google` | Public | Initiate Google OAuth flow. |
| `GET` | `/github` | Public | Initiate GitHub OAuth flow. |
| `GET` | `/linkedin` | Public | Initiate LinkedIn OAuth flow. |

**Example Registration Payload:**
```json
{
  "fname": "John",
  "lname": "Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "1234567890",
  "dob": "2000-01-01",
  "education": "B.Tech",
  "year": "3rd Year",
  "interests": ["Coding", "AI"],
  "skills": ["JavaScript"],
  "improveSkills": ["Python"]
}
```

---

## 2. Roadmaps (`/api/roadmaps`)

Handles the generation and tracking of personalized study roadmaps using Gemini AI.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/generate` | Private | Generate a new roadmap for given subjects using AI. |
| `GET` | `/active` | Private | Get the current active roadmap for the user. |
| `PATCH` | `/node/:nodeIndex` | Private | Update the status of a specific roadmap node (`done`, `current`, `pending`). |

---

## 3. Checkpoints & Quizzes (`/api/checkpoints`)

Manages subject-specific tests to validate user progress.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/history` | Private | Retrieve user's past checkpoint performance history. |
| `GET` | `/:subject` | Private | Get generated quiz questions for a specific subject. |
| `POST` | `/:subject/submit` | Private | Submit quiz answers and receive score/feedback. |

---

## 4. User Profile & Analytics (`/api/users`)

Manages user data, gamification, and focus tracking.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Private | Get logged-in user's profile details. |
| `PATCH` | `/profile` | Private | Update user profile information. |
| `GET` | `/analytics` | Private | Get study analytics (hours, focus score, streak). |
| `GET` | `/leaderboard` | Private | Get the global leaderboard data. |
| `POST` | `/sync-focus` | Private | Sync focus metrics (score, tab switches) from frontend. |

---

## 5. AI Features (`/api/ai`)

Direct interactions with the StudySpark AI assistant.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/advice` | Private | Get personalized study advice based on profile. |
| `POST` | `/explain` | Private | Ask AI to explain a specific topic. |
| `GET` | `/study-plan` | Private | Generate a daily study plan based on roadmap. |
| `POST` | `/chat` | Private | General-purpose AI chat for study help. |

---

## 6. Tasks (`/api/tasks`)

Simple daily task management.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/today` | Private | Get all tasks scheduled for today. |
| `POST` | `/` | Private | Create a new task. |
| `PATCH` | `/:id/toggle` | Private | Toggle task completion status. |
| `DELETE` | `/:id` | Private | Delete a task. |

---

## 7. Miscellaneous

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Private | List all available enrolled courses/subjects. |
| `POST` | `/api/contact` | Public | Submit the "Contact Us" form. |
| `GET` | `/` | Public | API Health Check (Root path). |

---

## Authentication Mechanism

StudySpark uses **JWT (JSON Web Tokens)** for secure API access.
1. Include the token in the `Authorization` header for all **Private** routes:
   `Authorization: Bearer <your_jwt_token>`
2. Tokens are typically valid for 30 days.
3. For OAuth, the token and user data are passed via query parameters to the frontend callback URL.
