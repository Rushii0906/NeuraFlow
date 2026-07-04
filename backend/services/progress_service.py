from datetime import datetime
from backend.repositories.roadmap_repository import RoadmapRepository
from backend.models.learning import UserProgress
from backend.database.db import db

class ProgressService:
    @staticmethod
    def check_prerequisites_completed(user_id, node_id):
        node = RoadmapRepository.get_node_by_id(node_id)
        if not node or not node.prerequisites:
            return True
            
        prereq_ids = [p.id for p in node.prerequisites]
        completed_count = UserProgress.query.filter(
            UserProgress.user_id == user_id,
            UserProgress.node_id.in_(prereq_ids),
            UserProgress.is_completed == True
        ).count()
        return completed_count == len(prereq_ids)

    @staticmethod
    def mark_node_complete(user_id, node_id, quiz_score=None):
        node = RoadmapRepository.get_node_by_id(node_id)
        if not node:
            raise ValueError("Node not found")
            
        # Optional: verify prerequisites are completed before marking complete
        if not ProgressService.check_prerequisites_completed(user_id, node_id):
            raise PermissionError("Cannot complete node: prerequisites not completed")

        progress = UserProgress.query.filter_by(user_id=user_id, node_id=node_id).first()
        if not progress:
            progress = UserProgress(user_id=user_id, node_id=node_id)
            db.session.add(progress)

        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
        
        if quiz_score is not None:
            if progress.quiz_score is None or int(quiz_score) > progress.quiz_score:
                progress.quiz_score = int(quiz_score)

        db.session.flush()
        return progress
