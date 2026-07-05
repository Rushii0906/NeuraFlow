import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.database.db import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize SQLAlchemy database
    db.init_app(app)
    
    # Auto-create tables in production/development on startup
    with app.app_context():
        db.create_all()
        
    # Initialize JWT Manager
    jwt = JWTManager(app)
    
    # Register blueprints (routes)
    from backend.routes.auth import auth_bp
    from backend.routes.learning import learning_bp
    from backend.routes.roadmap_api import roadmap_bp
    from backend.routes.generation_api import generation_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(learning_bp, url_prefix="/api/learning")
    app.register_blueprint(roadmap_bp, url_prefix="/api/roadmap")
    app.register_blueprint(generation_bp, url_prefix="/api/generation")
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404
        
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
        
    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "service": "NeuraFlow AI Backend"}), 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
