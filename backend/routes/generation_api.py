import logging
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from backend.repositories.roadmap_repository import RoadmapRepository
from backend.services.generation_manager import GenerationManager

generation_bp = Blueprint('generation', __name__)
logger = logging.getLogger(__name__)


@generation_bp.route('/node/<int:node_id>/status', methods=['GET'])
@jwt_required()
def get_node_status(node_id):
    node = RoadmapRepository.get_node_by_id(node_id)
    if not node:
        return jsonify({"error": "Node not found"}), 404

    jobs = GenerationManager.get_jobs_for_node(node_id)

    # Auto-trigger Notes generation if no job exists and material is not present
    if "notes" not in jobs and (not node.material or not node.material.beginner_notes):
        GenerationManager.trigger_job(node.topic_id, node_id, "notes")
        jobs = GenerationManager.get_jobs_for_node(node_id)

    return jsonify({
        "jobs": jobs
    }), 200


@generation_bp.route('/node/<int:node_id>/retry/<string:job_type>', methods=['POST'])
@jwt_required()
def retry_node_job(node_id, job_type):
    node = RoadmapRepository.get_node_by_id(node_id)
    if not node:
        return jsonify({"error": "Node not found"}), 404

    if job_type not in ["notes", "assessment", "illustrations"]:
        return jsonify({"error": "Invalid job type"}), 400

    logger.info(f"Retrying job '{job_type}' for Node ID {node_id} (Topic ID {node.topic_id})")
    GenerationManager.trigger_job(node.topic_id, node_id, job_type)
    jobs = GenerationManager.get_jobs_for_node(node_id)

    return jsonify({
        "message": f"Job {job_type} has been re-triggered",
        "jobs": jobs
    }), 200
