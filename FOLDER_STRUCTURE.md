# Folder Structure: NeuraFlow AI

NeuraFlow AI separates responsibilities by components, keeping front-end code and back-end logic modular, as required by the Architecture Rules.

```
NeuraFlow AI/
├── README.md
├── PROJECT_PLAN.md
├── DATABASE_SCHEMA.md
├── API_DOCUMENTATION.md
├── FOLDER_STRUCTURE.md
├── DEVELOPMENT_ROADMAP.md
│
├── backend/
│   ├── app.py                  # Flask Application Factory
│   ├── config.py               # Environment configuration settings
│   ├── requirements.txt        # Backend python dependencies
│   │
│   ├── database/
│   │   └── db.py               # SQLAlchemy core database object
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py             # User accounts & secure auth schemas
│   │   └── learning.py         # Topics, roadmaps, quizzes, progress schemas
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # Auth Blueprint (/register, /login, /profile)
│   │   └── learning.py         # Study Blueprint (/generate, /topics, /roadmap, etc)
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── graph.py            # LangGraph StateGraph coordination flow
│   │   └── nodes.py            # Research, Notes, Quiz, Interview agents
│   │
│   ├── prompts/
│   │   ├── __init__.py
│   │   └── templates.py        # System instructions and prompt templates
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py             # Request filters and API validators
│   │
│   └── utils/
│       ├── __init__.py
│       └── helpers.py          # PDF export helpers, JSON utilities
│
└── frontend/
    ├── package.json
    ├── vite.config.ts          # Vite build and path alias config
    ├── tailwind.config.js      # Tailwind style themes and utilities
    ├── index.html              # Core HTML structure
    │
    └── src/
        ├── main.tsx            # Application entrypoint
        ├── App.tsx             # Route settings and core layout bindings
        ├── index.css           # Global CSS variables, custom Tailwind imports
        │
        ├── components/         # Shared presentation elements
        │   ├── Button.tsx
        │   ├── Input.tsx
        │   ├── Card.tsx
        │   ├── GlassCard.tsx   # Glossy overlay effect styling element
        │   ├── LoadingScreen.tsx
        │   └── ProgressBar.tsx
        │
        ├── pages/              # Application views mapped to routes
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── Dashboard.tsx   # Topic search & overall study analytics
        │   ├── LearningSpace.tsx # Split screen interactive study console
        │   └── Profile.tsx
        │
        ├── layouts/            # Page layouts
        │   └── DashboardLayout.tsx # Sidebar + Header + Container structure
        │
        ├── hooks/              # Reusable react hooks
        │   └── useAuth.ts
        │
        ├── contexts/           # Global react contexts
        │   └── AuthContext.tsx # JWT session management
        │
        ├── services/           # Api integration modules
        │   ├── api.ts          # Axios config with JWT header interceptors
        │   └── learning.ts     # Communication definitions for study API
        │
        └── utils/              # Reusable frontend helper functions
            └── formatters.ts   # Date and text processing helpers
```
