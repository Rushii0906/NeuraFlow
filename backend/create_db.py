from backend.app import create_app
from backend.database.db import db
from backend.models import User, Topic, RoadmapNode, Material, Quiz, QuizQuestion, InterviewQuestion, UserProgress

app = create_app()

with app.app_context():
    print("Creating all tables in PostgreSQL...")
    db.create_all()
    print("Database tables created successfully!")
