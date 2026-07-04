# Development Roadmap: NeuraFlow AI

NeuraFlow AI will be implemented in sequential sprints to ensure high-quality delivery, rigorous testing, and solid separation of concerns.

---

## Sprint 1: Setup & Data Modeling (Days 1-2)
*Goal: Initialize directory environment, database tables, and configure global authentication.*

*   **Task 1.1**: Initialize folders `frontend/` and `backend/`.
*   **Task 1.2**: Set up Python virtual environment (`.venv`) and install dependencies (Flask, SQLAlchemy, JWT, LangGraph, dotenv).
*   **Task 1.3**: Configure Flask App Factory (`app.py`, `config.py`).
*   **Task 1.4**: Define database schemas (`user.py`, `learning.py`) using SQLAlchemy, implementing cascading deletions.
*   **Task 1.5**: Build authentication endpoints (`/register`, `/login`, `/profile`) with secure passwords.

---

## Sprint 2: Multi-Agent Orchestration via LangGraph (Days 3-4)
*Goal: Establish AI agents that research, create study plans, and generate comprehensive learning contents.*

*   **Task 2.1**: Set up LangGraph StateGraph schema (`graph.py`) to manage pipeline state.
*   **Task 2.2**: Define node functions (`nodes.py`):
    *   **Research Agent Node**: Queries Gemini to map out a structured learning plan.
    *   **Roadmap Node**: Details node subtopics and sequence.
    *   **Content Writer Node**: Generates Markdown notes (Beginner, Detailed, Revision).
    *   **Assessment Creator Node**: Generates MCQ quizzes and interview QA.
*   **Task 2.3**: Establish prompt templates (`templates.py`) to enforce valid JSON responses.
*   **Task 2.4**: Connect the endpoints to trigger roadmap generation asynchronously.

---

## Sprint 3: Frontend Foundation & Auth Integration (Days 5-6)
*Goal: Build Vite React project, configure global styles, and bind authentication context.*

*   **Task 3.1**: Create Vite project with TypeScript and configure Tailwind CSS.
*   **Task 3.2**: Implement custom glassmorphic styling inside `index.css` (custom cards, dark background gradients, neon borders).
*   **Task 3.3**: Implement Axios Client (`api.ts`) with request interceptors to auto-inject JWT tokens.
*   **Task 3.4**: Write `AuthContext` to manage tokens and auto-refresh sessions.
*   **Task 3.5**: Create Login and Signup pages utilizing Framer Motion animation.

---

## Sprint 4: Student Dashboard & Learning Studio (Days 7-8)
*Goal: Implement study interface, progress tracking, and interactive quizzes.*

*   **Task 4.1**: Create Dashboard view:
    *   Topic input bar.
    *   Topic creation status tracker.
    *   Student statistics dashboard (SVG completion charts).
*   **Task 4.2**: Design the interactive **Learning Space**:
    *   Interactive roadmap node tree.
    *   Study materials tabs (Beginner, Detailed, Revision notes).
    *   Markdown content visualizer.
*   **Task 4.3**: Implement interactive Quiz module:
    *   Displays questions, options, allows submission, provides explanation, tracks score, and reports results to database.
*   **Task 4.4**: Implement Interview Q&A cards with flip animations.

---

## Sprint 5: Refinement, PDF Export & Verification (Days 9-10)
*Goal: Clean up bugs, write tests, enable PDF exports, and finalize build.*

*   **Task 5.1**: Build client-side PDF export logic for notes and revision summaries.
*   **Task 5.2**: Conduct integration and security checks on JWT tokens and Flask routing.
*   **Task 5.3**: Optimize dashboard charts and Framer Motion layout animations.
*   **Task 5.4**: Create a Walkthrough showcasing the running platform.
