import logging
import threading
from flask import current_app
from backend.repositories.roadmap_repository import RoadmapRepository
from backend.agents.roadmap_agent import roadmap_agent
from backend.agents.graph import graph_app

logger = logging.getLogger(__name__)

def run_agent_workflow(app, state):
    """Executes the LangGraph agent pipeline within the Flask application context."""
    with app.app_context():
        try:
            logger.info(f"Starting background agent graph for Topic ID {state['topic_id']}")
            result = graph_app.invoke(state)
            
            topic = RoadmapRepository.get_topic_by_id(state["topic_id"])
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

            RoadmapRepository.commit()
        except Exception as e:
            logger.error(f"Background thread failed during agent processing: {e}")
            try:
                topic = RoadmapRepository.get_topic_by_id(state["topic_id"])
                if topic:
                    topic.status = "failed"
                    RoadmapRepository.commit()
            except Exception:
                RoadmapRepository.rollback()


class RoadmapGenerationService:
    @staticmethod
    def generate_roadmap_and_prerequisites(topic_id, topic_title):
        # 1. Call RoadmapAgent to get the specifications
        spec = roadmap_agent(topic_title)
        nodes_data = spec.get("nodes", [])
        
        # 2. Save the nodes first and keep a mapping of Title -> Node object
        created_nodes = {}
        for index, node_spec in enumerate(nodes_data):
            node = RoadmapRepository.create_node(
                topic_id=topic_id,
                title=node_spec["title"],
                description=node_spec.get("description", ""),
                order=index + 1,
                difficulty=node_spec.get("difficulty", "Beginner"),
                estimated_time=node_spec.get("estimated_time", "1 hour"),
                resources=node_spec.get("resources", [])
            )
            created_nodes[node_spec["title"]] = node
            
        # 3. Establish prerequisite relationships
        for node_spec in nodes_data:
            node_title = node_spec["title"]
            prereq_titles = node_spec.get("prerequisites", [])
            
            node_obj = created_nodes.get(node_title)
            if not node_obj:
                continue
                
            for prereq_title in prereq_titles:
                prereq_node_obj = created_nodes.get(prereq_title)
                if prereq_node_obj:
                    RoadmapRepository.add_prerequisite(node_obj.id, prereq_node_obj.id)
                    
        RoadmapRepository.commit()
        
        # Return list of dicts for the graph state
        saved_nodes = []
        for title, node in created_nodes.items():
            saved_nodes.append({
                "id": node.id,
                "title": node.title,
                "description": node.description,
                "order": node.order
            })
        
        # Sort by order
        saved_nodes.sort(key=lambda x: x["order"])
        return saved_nodes

    @staticmethod
    def initialize_generation(user_id, topic_title):
        # 1. Create topic using Repository
        topic = RoadmapRepository.create_topic(user_id, topic_title)
        RoadmapRepository.commit()
        
        # 2. Prepare graph state
        state = {
            "topic_title": topic_title,
            "topic_id": topic.id,
            "user_id": user_id,
            "roadmap_nodes": [],
            "current_node_index": 0,
            "error": ""
        }
        
        # 3. Launch thread
        app_context = current_app._get_current_object()
        thread = threading.Thread(target=run_agent_workflow, args=(app_context, state))
        thread.start()
        
        return topic.id
