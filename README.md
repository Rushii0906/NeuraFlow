# NeuraFlow AI

NeuraFlow AI is an AI-powered personalized learning companion that transforms any topic into a complete, structured learning path. It generates roadmaps, beginner and detailed notes, revision summaries, quizzes, and interview preparation questions, all while tracking user progress and scores in real time.

## Key Features

- **Personalized Roadmaps**: Automatically research and outline any topic into sequential roadmap nodes.
- **Hierarchical Learning Material**: Each node includes three levels of generated text (Beginner Notes, Detailed Notes, and Revision Guides).
- **Interactive Quizzes**: Multiple-choice quizzes generated dynamically to validate understanding.
- **Interview Prep**: Structured interview questions and answers mapping to the learning nodes.
- **Progress Tracking**: Real-time stats on completed nodes, roadmap percentage, and quiz scores.
- **PDF Export**: Allows download of revision summaries and notes for offline learning.
- **Glassmorphic Dark Mode**: A premium, state-of-the-art developer dashboard with fluid micro-animations.

---

## Tech Stack

### Frontend
- **React (Vite + TS)**
- **Tailwind CSS v4** (Modern utility framework with CSS configurations)
- **Framer Motion** (Fluid UI animations)
- **React Router v6** (App routing)
- **Axios** (API communication with auto-attaching JWT interceptors)
- **React Markdown** (Markdown renderer for notes)

### Backend
- **Flask** (Python Web Framework)
- **LangGraph & LangChain** (AI Agent workflow management)
- **Google Gemini API** (Underlying LLM powering the agents)
- **SQLAlchemy** (ORM for database operations)
- **Flask-JWT-Extended** (JWT Token authentication)
- **Supabase PostgreSQL** (Relational Database)

---

## Project Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (using `uv` or `venv`):
   ```bash
   uv venv
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```
4. Configure your `.env` file (copy from `.env.example`):
   ```env
   SECRET_KEY=your_flask_secret_key
   DATABASE_URL=sqlite:///../neuraflow.db # Or your Supabase PostgreSQL connection string in production
   JWT_SECRET_KEY=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Run the backend development server:
   ```bash
   flask run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run the frontend development server:
   ```bash
   npm run dev
   ```

---

## Deployment Instructions

### Frontend (Vercel)
The React frontend is optimized for deployment to Vercel as a single-page application (SPA):
1. Import your repository into the Vercel dashboard.
2. Set the **Root Directory** configuration to `frontend`.
3. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Add the following **Environment Variable**:
   - `VITE_API_URL`: `https://your-deployed-backend-api.com/api`
5. Deploy. The included `vercel.json` will automatically handle URL rewrites to `/index.html` for frontend SPA routing.

### Backend (Render / Railway / Koyeb)
Since NeuraFlow uses parallel background threading for progressive AI generation (spawning worker threads for notes, assessment, and illustrations), it requires a persistent Python environment:
1. Deploy the `backend` directory to a platform supporting persistent Python/WSGI servers (e.g. Render Web Services, Railway, or Koyeb).
2. Use Python 3.10+ and set the start command to:
   ```bash
   gunicorn backend.app:create_app
   ```
3. Set the following **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string (e.g., `postgresql://postgres:[password]@db.[ref].supabase.co:6543/postgres?sslmode=require`)
   - `SECRET_KEY`: A secure random string
   - `JWT_SECRET_KEY`: A secure random string
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `GROQ_API_KEY`: Your Groq API Key

---

## License
MIT License.
