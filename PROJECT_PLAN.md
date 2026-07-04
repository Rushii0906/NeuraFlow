# Project Plan: NeuraFlow AI

NeuraFlow AI is designed as a structured learning platform powered by multi-agent AI. Below is the comprehensive project roadmap, architectural goals, feature definitions, and technical requirements.

## 1. Objectives & Scope
The main objective is to provide a complete learning platform where a user specifies a target topic, and a multi-agent orchestration generates structured roadmaps, learning notes, quizzes, and interview questions. Progress is tracked to gamify and structure learning.

### In Scope:
- User Authentication (JWT-based login, registration, and logout).
- Multi-agent pipeline via LangGraph to research, generate, structure, and save learning roadmaps and materials.
- Progressive disclosure UI (topics list $\rightarrow$ roadmap path $\rightarrow$ study materials $\rightarrow$ quizzes).
- Dynamic quiz engine with instant evaluation and feedback.
- Interactive interview preparation modules.
- Student learning statistics and dashboard charts.
- Dark mode first, responsive, modern glassmorphic web design.
- Export summaries and notes as PDF documents.

### Out of Scope (Future Sprints):
- File uploads (PDF, TXT) with Retrieval Augmented Generation (RAG).
- Voice commands / AI Voice reader.
- Collaborative study spaces and multi-user roadmap branching.

---

## 2. Product Architecture
The system follows a clean client-server architecture with separation of concerns:
1. **Frontend (SPA)**: Communicates with the Flask API backend. Displays UI in glassmorphic styling, uses Axios for HTTP requests, and Framer Motion for page/modal transitions.
2. **Backend API (Flask)**: Handles authentication, database management (via SQLAlchemy ORM), and triggers LangGraph AI workflows.
3. **AI Pipeline (LangGraph + Gemini)**: Coordinates research agents, content writers, quiz designers, and interview examiners. Operates asynchronously to avoid blocking API requests.
4. **Database (Supabase PostgreSQL / SQLite)**: Stores user credentials, generated topic paths, roadmap items, generated content, user quizzes, and completion progress.

---

## 3. Core Features Spec
### Feature 1: User Auth
- Secure signup with validated inputs (email check, password complexity).
- Secure password hashing on the backend (using bcrypt or Werkzeug security).
- Stateless JWT tokens stored securely on the client.
- Auth middleware protecting learning routes.

### Feature 2: Topic Generator & Roadmap Orchestrator
- Single input bar for topic requests.
- Triggers the LangGraph pipeline to generate roadmaps.
- Uses Server-Sent Events (SSE) or simple polling status endpoints to display real-time generation steps to the user (e.g. "Researching...", "Writing Beginner Notes...", "Drafting Quiz Questions...", "Finalizing Roadmap...").

### Feature 3: Interactive Study Space
- Split screen: Left side shows the roadmap tree, and right side displays the selected node's material.
- Study materials separated by tab: Beginner, Detailed, Revision, Quiz, Interview.
- Markdown renderer for beautiful note displays.

### Feature 4: Quiz Runner
- Quizzes are structured as multiple-choice questions (MCQs) with options.
- The user can select their answer, submit, see the correct answer, and read an AI-generated explanation.
- Progress is logged and aggregated into the user's statistics.

### Feature 5: Progress & Statistics Dashboard
- Visually engaging dashboard showing:
  - Topics completed and in progress.
  - Overall learning score (quiz performance).
  - Total roadmap nodes completed.
  - Beautiful visual charts (e.g., SVG-based charts or recharts).
