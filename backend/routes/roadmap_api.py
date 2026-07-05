import logging
import threading
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.repositories.roadmap_repository import RoadmapRepository
from backend.services.roadmap_generation_service import RoadmapGenerationService
from backend.services.progress_service import ProgressService
from backend.models.learning import UserProgress
from backend.services.cache_service import CacheService

roadmap_bp = Blueprint('roadmap', __name__)
logger = logging.getLogger(__name__)


@roadmap_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_roadmap():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    topic_title = data.get('topic', '').strip()

    if not topic_title:
        return jsonify({"error": "Topic name is required"}), 400

    try:
        # 1. Check Cache
        cached_id = CacheService.get_cached_topic(topic_title, user_id)
        if cached_id:
            return jsonify({
                "message": "Learning roadmap loaded from cache",
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
                    RoadmapGenerationService.generate_roadmap_and_prerequisites(t_id, title)
                    
                    # Mark completed
                    topic_obj = RoadmapRepository.get_topic_by_id(t_id)
                    topic_obj.status = 'completed'
                    RoadmapRepository.commit()
                    logger.info(f"Roadmap structure generated for topic ID {t_id}")
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
        import os
        if os.getenv("SYNC_GENERATION", "false").lower() == "true":
            run_roadmap_gen(app_context, topic.id, topic_title)
            return jsonify({
                "message": "Learning roadmap generation completed",
                "topic_id": topic.id,
                "status": "completed"
            }), 200
        else:
            thread = threading.Thread(target=run_roadmap_gen, args=(app_context, topic.id, topic_title))
            thread.start()

            return jsonify({
                "message": "Learning roadmap generation initiated",
                "topic_id": topic.id,
                "status": "generating"
            }), 202
    except Exception as e:
        logger.error(f"Failed to start roadmap generation: {e}")
        return jsonify({"error": "Failed to start learning path generation", "details": str(e)}), 500


@roadmap_bp.route('/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_roadmap(topic_id):
    user_id = int(get_jwt_identity())
    
    topic = RoadmapRepository.get_topic_by_id(topic_id)
    if not topic or topic.user_id != user_id:
        return jsonify({"error": "Topic not found"}), 404

    nodes = RoadmapRepository.get_nodes_by_topic_id(topic_id)
    
    # Resolving depths to build centered layers
    nodes_by_id = {node.id: node for node in nodes}
    
    def get_depth(node_id, visited=None):
        if visited is None:
            visited = set()
        if node_id in visited:
            return 0
        visited.add(node_id)
        
        node = nodes_by_id[node_id]
        if not node.prerequisites:
            return 0
        return max(get_depth(p.id, visited) for p in node.prerequisites) + 1

    # Group by depth
    layers = {}
    for node in nodes:
        d = get_depth(node.id)
        if d not in layers:
            layers[d] = []
        layers[d].append(node)

    # Generate React Flow nodes
    flow_nodes = []
    for d, layer_nodes in layers.items():
        num_nodes = len(layer_nodes)
        y = d * 160 + 50 # Spaced vertically
        for index, node in enumerate(layer_nodes):
            # Centering calculation
            x = 350 + (index - (num_nodes - 1) / 2) * 240
            
            flow_nodes.append({
                "id": str(node.id),
                "type": "customNode",
                "position": {"x": int(x), "y": int(y)},
                "data": node.to_dict(user_id=user_id)
            })

    # Generate React Flow edges
    flow_edges = []
    for node in nodes:
        for p in node.prerequisites:
            # Check if the prerequisite is completed by this user
            progress = UserProgress.query.filter_by(user_id=user_id, node_id=p.id).first()
            is_prereq_completed = progress.is_completed if progress else False
            
            flow_edges.append({
                "id": f"e_{p.id}_{node.id}",
                "source": str(p.id),
                "target": str(node.id),
                "animated": is_prereq_completed,
                "style": {
                    "stroke": "#3d27bc" if is_prereq_completed else "#c8c4d7",
                    "strokeWidth": 2.5
                }
            })

    return jsonify({
        "topic": topic.to_dict(),
        "nodes": flow_nodes,
        "edges": flow_edges
    }), 200


@roadmap_bp.route('/node/<int:node_id>/complete', methods=['POST'])
@jwt_required()
def complete_node(node_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    quiz_score = data.get('quiz_score')

    try:
        progress = ProgressService.mark_node_complete(user_id, node_id, quiz_score)
        RoadmapRepository.commit()
        return jsonify({
            "message": "Node marked completed successfully",
            "progress": progress.to_dict()
        }), 200
    except ValueError as val_err:
        return jsonify({"error": str(val_err)}), 404
    except PermissionError as perm_err:
        return jsonify({"error": str(perm_err)}), 403
    except Exception as e:
        RoadmapRepository.rollback()
        logger.error(f"Error completing node: {e}")
        return jsonify({"error": "Failed to complete node", "details": str(e)}), 500
