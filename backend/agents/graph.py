import logging
import os
import threading
import requests
import urllib.parse
from typing import TypedDict, List, Dict, Any
from flask import current_app
from langgraph.graph import StateGraph, END

from backend.agents.nodes import (
    research_and_roadmap_agent,
    generate_combined_content_agent,
    illustration_planner_agent
)
from backend.database.db import db
from backend.models.learning import Topic, RoadmapNode, Material, Quiz, QuizQuestion, InterviewQuestion, Illustration

logger = logging.getLogger(__name__)

class GraphState(TypedDict):
    topic_title: str
    topic_id: int
    user_id: int
    roadmap_nodes: List[Dict[str, Any]]
    current_node_index: int
    error: str

def create_roadmap_node(state: GraphState) -> Dict[str, Any]:
    """Node that generates the roadmap structure and saves it to the database."""
    topic_title = state["topic_title"]
    topic_id = state["topic_id"]
    
    try:
        from backend.services.roadmap_generation_service import RoadmapGenerationService
        saved_nodes = RoadmapGenerationService.generate_roadmap_and_prerequisites(topic_id, topic_title)
        return {
            "roadmap_nodes": saved_nodes,
            "current_node_index": 0,
            "error": ""
        }
    except Exception as e:
        logger.error(f"Error in create_roadmap_node: {e}")
        return {
            "error": str(e)
        }

def generate_node_content_node(state: GraphState) -> Dict[str, Any]:
    """Node that generates materials, quizzes, and interviews for the current node."""
    idx = state["current_node_index"]
    nodes = state["roadmap_nodes"]
    topic_title = state["topic_title"]
    
    if idx >= len(nodes):
        return state

    current_node = nodes[idx]
    node_id = current_node["id"]
    node_title = current_node["title"]
    node_desc = current_node["description"]
    
    try:
        # Generate all notes, quiz questions, and interview questions in a single API call
        content = generate_combined_content_agent(topic_title, node_title, node_desc)
        
        # Save Materials
        material = Material(
            node_id=node_id,
            beginner_notes=content.get("beginner_notes", ""),
            detailed_notes=content.get("detailed_notes", ""),
            revision_notes=content.get("revision_notes", "")
        )
        db.session.add(material)
        
        # Save Quiz
        quiz_obj = Quiz(
            node_id=node_id,
            title=content.get("quiz_title", f"{node_title} Quiz")
        )
        db.session.add(quiz_obj)
        db.session.flush()
        
        # Save Quiz Questions
        for q in content.get("quiz_questions", []):
            question = QuizQuestion(
                quiz_id=quiz_obj.id,
                question_text=q["question_text"],
                correct_answer=q["correct_answer"],
                explanation=q.get("explanation", "")
            )
            question.options = q["options"]
            db.session.add(question)
            
        # Save Interview Questions
        for q in content.get("interview_questions", []):
            interview = InterviewQuestion(
                node_id=node_id,
                question=q["question"],
                answer=q["answer"]
            )
            db.session.add(interview)
            
        db.session.commit()
        logger.info(f"Saved combined content for node: {node_title}")
        
    except Exception as e:
        logger.error(f"Error in generate_node_content_node for {node_title}: {e}")
        db.session.rollback()
        return {
            "current_node_index": idx + 1,
            "error": str(e)
        }
        
    return {
        "current_node_index": idx + 1
    }

def generate_illustration_images_background(app, topic_id):
    """Background task to generate and download illustration images."""
    with app.app_context():
        try:
            from backend.models.learning import Illustration
            from backend.database.db import db
            
            illustrations = Illustration.query.filter_by(topic_id=topic_id, image_url=None).all()
            if not illustrations:
                return

            static_dir = os.path.join(app.root_path, 'static', 'illustrations')
            os.makedirs(static_dir, exist_ok=True)

            for ill in illustrations:
                try:
                    # Construct prompt
                    style_prefix = (
                        "Ian Xiaohei style, minimal educational sketch, simple black line drawing on a solid white background, "
                        "friendly characters, visual metaphor, clean, lots of whitespace, corporate and professional, hand-drawn feeling, "
                        "no realism, no 3D, no anime, no stock illustration. Visual metaphor: "
                    )
                    full_prompt = style_prefix + ill.prompt
                    
                    encoded_prompt = urllib.parse.quote(full_prompt)
                    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=600&height=400&nologo=true&private=true"
                    
                    response = requests.get(url, timeout=30)
                    if response.status_code == 200:
                        filename = f"ill_{ill.id}.jpg"
                        filepath = os.path.join(static_dir, filename)
                        with open(filepath, 'wb') as f:
                            f.write(response.content)
                        
                        ill.image_url = f"/static/illustrations/{filename}"
                        db.session.commit()
                        logger.info(f"Successfully generated and saved illustration {ill.id}")
                    else:
                        logger.error(f"Failed to generate illustration {ill.id}: HTTP status {response.status_code}")
                except Exception as ex:
                    logger.error(f"Error generating illustration {ill.id}: {ex}")
                    db.session.rollback()
        except Exception as e:
            logger.error(f"Error in generate_illustration_images_background: {e}")

def generate_illustrations_node(state: GraphState) -> Dict[str, Any]:
    """Node that scans generated notes, plans illustrations, and initiates async generation."""
    topic_id = state["topic_id"]
    topic_title = state["topic_title"]
    
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return state

        # Compile all notes into a single document for the planner
        compiled_notes = []
        for node in topic.nodes:
            if node.material:
                compiled_notes.append(f"## Chapter: {node.title}\n\n{node.material.detailed_notes}")
        
        notes_text = "\n\n".join(compiled_notes)
        if not notes_text.strip():
            logger.warning(f"No notes content found for topic {topic_id}; skipping illustration planning.")
            return state

        # Call Illustration Planner Agent
        spec_data = illustration_planner_agent(topic_title, notes_text)
        illustrations_list = spec_data.get("illustrations", [])
        
        # Save specs to the database
        for index, spec in enumerate(illustrations_list):
            ill = Illustration(
                topic_id=topic_id,
                section_name=spec.get("section_name", "").strip(),
                concept=spec.get("concept", "").strip(),
                illustration_type=spec.get("illustration_type", "Concept").strip(),
                caption=spec.get("caption", "").strip(),
                prompt=spec.get("metaphor", "").strip(),  # Metaphor is the prompt content
                display_order=index + 1
            )
            db.session.add(ill)
            
        db.session.commit()
        logger.info(f"Planned {len(illustrations_list)} illustrations for topic {topic_id}")
        
        # Launch background image generation thread
        app_context = current_app._get_current_object()
        thread = threading.Thread(
            target=generate_illustration_images_background, 
            args=(app_context, topic_id)
        )
        thread.start()
        
    except Exception as e:
        logger.error(f"Error in generate_illustrations_node for topic {topic_id}: {e}")
        db.session.rollback()
        
    return state

def content_routing_condition(state: GraphState):
    """Route: checks if there are more nodes to process or if there was a fatal error."""
    if state.get("error"):
        return "failed"
    
    idx = state["current_node_index"]
    nodes = state["roadmap_nodes"]
    
    if idx < len(nodes):
        return "generate_content"
    else:
        return "completed"

# Define the StateGraph
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("create_roadmap", create_roadmap_node)
workflow.add_node("generate_content", generate_node_content_node)
workflow.add_node("generate_illustrations", generate_illustrations_node)

# Set Entrypoint
workflow.set_entry_point("create_roadmap")

# Add conditional edge from create_roadmap
workflow.add_conditional_edges(
    "create_roadmap",
    content_routing_condition,
    {
        "generate_content": "generate_content",
        "failed": END
    }
)

# Add conditional edge from generate_content (loops until completed)
workflow.add_conditional_edges(
    "generate_content",
    content_routing_condition,
    {
        "generate_content": "generate_content",
        "completed": "generate_illustrations",
        "failed": END
    }
)

# Add edge from generate_illustrations to completion
workflow.add_edge("generate_illustrations", END)

# Compile Graph
graph_app = workflow.compile()
