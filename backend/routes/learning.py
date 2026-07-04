import logging
import threading
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.database.db import db
from backend.models.learning import Topic, RoadmapNode, Material, Quiz, QuizQuestion, InterviewQuestion, UserProgress, Illustration
from backend.agents.graph import graph_app

learning_bp = Blueprint('learning', __name__)
logger = logging.getLogger(__name__)

def run_agent_workflow(app, state):
    """Executes the LangGraph agent pipeline within the Flask application context."""
    with app.app_context():
        try:
            logger.info(f"Starting background agent graph for Topic ID {state['topic_id']}")
            result = graph_app.invoke(state)
            
            topic = Topic.query.get(state["topic_id"])
            if not topic:
                return

            if result.get("error"):
                logger.error(f"LangGraph execution reported error: {result['error']}")
                topic.status = "failed"
            elif len(topic.nodes) > 0:
                topic.status = "completed"
                logger.info(f"LangGraph execution succeeded for Topic ID {state['topic_id']}")
            else:
                topic.status = "failed"
                logger.warning(f"LangGraph finished with no roadmap nodes for Topic ID {state['topic_id']}")

            db.session.commit()
        except Exception as e:
            logger.error(f"Background thread failed during agent processing: {e}")
            try:
                topic = Topic.query.get(state["topic_id"])
                if topic:
                    topic.status = "failed"
                    db.session.commit()
            except Exception:
                db.session.rollback()


@learning_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    topic_title = data.get('topic', '').strip()

    if not topic_title:
        return jsonify({"error": "Topic name is required"}), 400

    try:
        from backend.services.cache_service import CacheService
        from backend.repositories.roadmap_repository import RoadmapRepository
        import threading

        # 1. Check Cache
        cached_id = CacheService.get_cached_topic(topic_title, user_id)
        if cached_id:
            return jsonify({
                "message": "Learning pathway loaded from cache",
                "topic_id": cached_id,
                "status": "completed"
            }), 200

        # 2. Cache Miss: Create Topic record
        topic = RoadmapRepository.create_topic(user_id, topic_title)
        RoadmapRepository.commit()

        # 3. Start background thread to generate roadmap structure
        def run_roadmap_gen(app, t_id, title):
            with app.app_context():
                try:
                    from backend.services.roadmap_generation_service import RoadmapGenerationService
                    RoadmapGenerationService.generate_roadmap_and_prerequisites(t_id, title)
                    
                    # Mark completed
                    topic_obj = RoadmapRepository.get_topic_by_id(t_id)
                    topic_obj.status = 'completed'
                    RoadmapRepository.commit()
                except Exception as ex:
                    logger.error(f"Roadmap generation thread failed: {ex}")
                    try:
                        topic_obj = RoadmapRepository.get_topic_by_id(t_id)
                        if topic_obj:
                            topic_obj.status = 'failed'
                            RoadmapRepository.commit()
                    except Exception:
                        RoadmapRepository.rollback()

        app_context = current_app._get_current_object()
        thread = threading.Thread(target=run_roadmap_gen, args=(app_context, topic.id, topic_title))
        thread.start()

        return jsonify({
            "message": "Learning pathway generation initiated",
            "topic_id": topic.id,
            "status": "generating"
        }), 202

    except Exception as e:
        return jsonify({"error": "Failed to create generation pipeline", "details": str(e)}), 500


@learning_bp.route('/topics', methods=['GET'])
@jwt_required()
def get_topics():
    user_id = int(get_jwt_identity())
    topics = Topic.query.filter_by(user_id=user_id).order_by(Topic.created_at.desc()).all()
    
    result = []
    for topic in topics:
        total_nodes = len(topic.nodes)
        completed_nodes = 0
        
        if total_nodes > 0:
            node_ids = [n.id for n in topic.nodes]
            completed_nodes = UserProgress.query.filter(
                UserProgress.user_id == user_id,
                UserProgress.node_id.in_(node_ids),
                UserProgress.is_completed == True
            ).count()
            
        progress_percentage = int((completed_nodes / total_nodes) * 100) if total_nodes > 0 else 0
        
        topic_data = topic.to_dict()
        topic_data["progress_percentage"] = progress_percentage
        topic_data["total_nodes"] = total_nodes
        topic_data["completed_nodes"] = completed_nodes
        result.append(topic_data)
        
    return jsonify({"topics": result}), 200


@learning_bp.route('/roadmap/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_roadmap(topic_id):
    user_id = int(get_jwt_identity())
    topic = Topic.query.filter_by(id=topic_id, user_id=user_id).first()

    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    nodes = [n.to_dict(user_id=user_id) for n in topic.nodes]
    return jsonify({
        "topic": topic.to_dict(),
        "nodes": nodes
    }), 200


@learning_bp.route('/node/<int:node_id>/content', methods=['GET'])
@jwt_required()
def get_node_content(node_id):
    user_id = int(get_jwt_identity())
    
    # Verify node exists and belongs to the user
    node = RoadmapNode.query.get(node_id)
    if not node or node.topic.user_id != user_id:
        return jsonify({"error": "Node not found or access denied"}), 404

    material = node.material
    if not material:
        return jsonify({"error": "Learning material is still generating for this node"}), 202

    # Fetch interview questions
    interviews = [q.to_dict() for q in node.interview_questions]

    # Fetch progress
    progress = UserProgress.query.filter_by(user_id=user_id, node_id=node_id).first()

    return jsonify({
        "node_id": node_id,
        "title": node.title,
        "beginner_notes": material.beginner_notes,
        "detailed_notes": material.detailed_notes,
        "revision_notes": material.revision_notes,
        "interview_questions": interviews,
        "progress": progress.to_dict() if progress else {"is_completed": False, "quiz_score": None}
    }), 200


@learning_bp.route('/node/<int:node_id>/quiz', methods=['GET'])
@jwt_required()
def get_node_quiz(node_id):
    user_id = int(get_jwt_identity())
    
    node = RoadmapNode.query.get(node_id)
    if not node or node.topic.user_id != user_id:
        return jsonify({"error": "Node not found"}), 404

    quiz = node.quiz
    if not quiz:
        return jsonify({"error": "Quiz is not available for this node"}), 202

    return jsonify(quiz.to_dict()), 200


@learning_bp.route('/node/<int:node_id>/progress', methods=['POST'])
@jwt_required()
def update_progress(node_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    is_completed = data.get('is_completed', False)
    quiz_score = data.get('quiz_score')  # Can be None if they just read the notes

    node = RoadmapNode.query.get(node_id)
    if not node or node.topic.user_id != user_id:
        return jsonify({"error": "Node not found"}), 404

    try:
        progress = UserProgress.query.filter_by(user_id=user_id, node_id=node_id).first()
        if not progress:
            progress = UserProgress(user_id=user_id, node_id=node_id)
            db.session.add(progress)

        progress.is_completed = is_completed
        if is_completed:
            progress.completed_at = datetime.utcnow()
        if quiz_score is not None:
            # Only overwrite score if it's higher than previous score
            if progress.quiz_score is None or quiz_score > progress.quiz_score:
                progress.quiz_score = int(quiz_score)

        db.session.commit()
        return jsonify({
            "message": "Progress updated successfully",
            "progress": progress.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update progress", "details": str(e)}), 500


@learning_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    
    # 1. Total topics
    total_topics = Topic.query.filter_by(user_id=user_id).count()

    # 2. Get user's roadmap nodes and count completions
    topics = Topic.query.filter_by(user_id=user_id).all()
    topic_ids = [t.id for t in topics]
    
    total_nodes = 0
    completed_nodes = 0
    average_quiz_score = 0
    scores = []

    if topic_ids:
        all_nodes = RoadmapNode.query.filter(RoadmapNode.topic_id.in_(topic_ids)).all()
        total_nodes = len(all_nodes)
        
        node_ids = [n.id for n in all_nodes]
        if node_ids:
            progress_records = UserProgress.query.filter(
                UserProgress.user_id == user_id,
                UserProgress.node_id.in_(node_ids)
            ).all()
            
            for rec in progress_records:
                if rec.is_completed:
                    completed_nodes += 1
                if rec.quiz_score is not None:
                    scores.append(rec.quiz_score)

    if scores:
        average_quiz_score = round(sum(scores) / len(scores), 1)

    # 3. Recent activity list
    recent_activity = []
    if topic_ids:
        recent_progress = UserProgress.query.filter(
            UserProgress.user_id == user_id,
            UserProgress.is_completed == True
        ).order_by(UserProgress.completed_at.desc()).limit(5).all()

        for rec in recent_progress:
            node = RoadmapNode.query.get(rec.node_id)
            if node:
                recent_activity.append({
                    "topic_title": node.topic.title,
                    "node_title": node.title,
                    "completed_at": rec.completed_at.isoformat() if rec.completed_at else None
                })

    return jsonify({
        "total_topics": total_topics,
        "total_nodes": total_nodes,
        "completed_nodes": completed_nodes,
        "in_progress_nodes": total_nodes - completed_nodes,
        "average_quiz_score": average_quiz_score,
        "recent_activity": recent_activity
    }), 200


@learning_bp.route('/topic/<int:topic_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_topic(topic_id):
    user_id = int(get_jwt_identity())
    topic = Topic.query.filter_by(id=topic_id, user_id=user_id).first()
    if not topic:
        return jsonify({"error": "Topic not found"}), 404
        
    try:
        topic.status = 'failed'
        db.session.commit()
        return jsonify({"message": "Topic generation cancelled successfully", "status": "failed"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to cancel topic generation", "details": str(e)}), 500


@learning_bp.route('/topic/<int:topic_id>', methods=['DELETE'])
@jwt_required()
def delete_topic(topic_id):
    user_id = int(get_jwt_identity())
    topic = Topic.query.filter_by(id=topic_id, user_id=user_id).first()
    if not topic:
        return jsonify({"error": "Topic not found"}), 404
        
    try:
        db.session.delete(topic)
        db.session.commit()
        return jsonify({"message": "Topic deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete topic", "details": str(e)}), 500


@learning_bp.route('/topic/<int:topic_id>/illustrations', methods=['GET'])
@jwt_required()
def get_topic_illustrations(topic_id):
    user_id = int(get_jwt_identity())
    topic = Topic.query.filter_by(id=topic_id, user_id=user_id).first()
    if not topic:
        return jsonify({"error": "Topic not found"}), 404
        
    illustrations = Illustration.query.filter_by(topic_id=topic_id).order_by(Illustration.display_order).all()
    return jsonify({
        "illustrations": [ill.to_dict() for ill in illustrations]
    }), 200


@learning_bp.route('/illustration/<int:illustration_id>/regenerate', methods=['POST'])
@jwt_required()
def regenerate_illustration(illustration_id):
    user_id = int(get_jwt_identity())
    
    ill = Illustration.query.get(illustration_id)
    if not ill or ill.topic.user_id != user_id:
        return jsonify({"error": "Illustration not found"}), 404
        
    try:
        # Reset image_url to None so it generates a fresh one
        ill.image_url = None
        db.session.commit()
        
        # Trigger background image generation
        from backend.agents.graph import generate_illustration_images_background
        app_context = current_app._get_current_object()
        thread = threading.Thread(
            target=generate_illustration_images_background,
            args=(app_context, ill.topic_id)
        )
        thread.start()
        
        return jsonify({
            "message": "Illustration regeneration started",
            "illustration": ill.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to trigger regeneration", "details": str(e)}), 500


@learning_bp.route('/illustration/<int:illustration_id>/hide', methods=['POST'])
@jwt_required()
def toggle_hide_illustration(illustration_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    is_hidden = data.get('is_hidden', True)
    
    ill = Illustration.query.get(illustration_id)
    if not ill or ill.topic.user_id != user_id:
        return jsonify({"error": "Illustration not found"}), 404
        
    try:
        ill.is_hidden = is_hidden
        db.session.commit()
        return jsonify({
            "message": "Illustration visibility updated",
            "illustration": ill.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update visibility", "details": str(e)}), 500


