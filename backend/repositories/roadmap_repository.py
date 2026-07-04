from backend.database.db import db
from backend.models.learning import Topic, RoadmapNode, Illustration

class RoadmapRepository:
    @staticmethod
    def get_topic_by_id(topic_id):
        return Topic.query.get(topic_id)

    @staticmethod
    def get_node_by_id(node_id):
        return RoadmapNode.query.get(node_id)

    @staticmethod
    def get_nodes_by_topic_id(topic_id):
        return RoadmapNode.query.filter_by(topic_id=topic_id).order_by(RoadmapNode.order).all()

    @staticmethod
    def create_topic(user_id, title):
        topic = Topic(user_id=user_id, title=title, status='generating')
        db.session.add(topic)
        db.session.flush() # Populate ID
        return topic

    @staticmethod
    def create_node(topic_id, title, description, order, difficulty=None, estimated_time=None, resources=None):
        node = RoadmapNode(
            topic_id=topic_id,
            title=title,
            description=description,
            order=order,
            difficulty=difficulty,
            estimated_time=estimated_time
        )
        if resources:
            node.resources = resources
        db.session.add(node)
        db.session.flush() # Populate ID
        return node

    @staticmethod
    def add_prerequisite(node_id, prerequisite_node_id):
        node = RoadmapNode.query.get(node_id)
        prereq = RoadmapNode.query.get(prerequisite_node_id)
        if node and prereq and prereq not in node.prerequisites:
            node.prerequisites.append(prereq)
            db.session.flush()

    @staticmethod
    def get_illustrations_by_topic_id(topic_id):
        return Illustration.query.filter_by(topic_id=topic_id).order_by(Illustration.display_order).all()

    @staticmethod
    def delete_topic(topic_id):
        topic = Topic.query.get(topic_id)
        if topic:
            db.session.delete(topic)
            db.session.flush()
        return topic

    @staticmethod
    def commit():
        db.session.commit()

    @staticmethod
    def rollback():
        db.session.rollback()
