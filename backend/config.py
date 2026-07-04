import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(override=True)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "neuraflow-secret-key-190382")
    
    # Database config (default to SQLite local database for easy zero-config startup)
    _db_url = os.getenv("DATABASE_URL", "sqlite:///../neuraflow.db")
    if _db_url and _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "neuraflow-jwt-super-secret-key-1823908")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    
    # Gemini API config
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
