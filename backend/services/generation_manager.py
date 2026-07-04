import threading
from datetime import datetime
from flask import current_app
from backend.database.db import db
from backend.models.learning import GenerationJob, RoadmapNode, Topic, Material, Quiz, QuizQuestion, InterviewQuestion, Illustration
import logging

logger = logging.getLogger(__name__)

def run_notes_generation(app, topic_id, node_id, job_id):
    with app.app_context():
        try:
            node = RoadmapNode.query.get(node_id)
            topic = Topic.query.get(topic_id)
            if not node or not topic:
                raise ValueError("Node or Topic not found")

            # Call notes agent
            from backend.agents.nodes import generate_notes_agent
            notes_data = generate_notes_agent(topic.title, node.title, node.description)

            # Save Material
            material = Material.query.filter_by(node_id=node_id).first()
            if not material:
                material = Material(node_id=node_id)
                db.session.add(material)
            
            material.beginner_notes = notes_data["beginner_notes"]
            material.detailed_notes = notes_data["detailed_notes"]
            material.revision_notes = notes_data["revision_notes"]

            # Update job status
            job = GenerationJob.query.get(job_id)
            job.status = 'completed'
            job.completed_at = datetime.utcnow()
            db.session.commit()
            logger.info(f"Notes generation completed for node {node_id}")

            # Trigger assessment and illustrations in parallel
            GenerationManager.trigger_job(topic_id, node_id, "assessment")
            GenerationManager.trigger_job(topic_id, node_id, "illustrations")

        except Exception as e:
            logger.error(f"Notes generation failed for node {node_id}: {e}")
            try:
                job = GenerationJob.query.get(job_id)
                if job:
                    job.status = 'failed'
                    job.completed_at = datetime.utcnow()
                    job.error_message = str(e)
                    db.session.commit()
            except Exception:
                db.session.rollback()


def run_assessment_generation(app, topic_id, node_id, job_id):
    with app.app_context():
        try:
            node = RoadmapNode.query.get(node_id)
            topic = Topic.query.get(topic_id)
            if not node or not topic:
                raise ValueError("Node or Topic not found")

            # Call assessment agent
            from backend.agents.nodes import generate_assessment_agent
            assess_data = generate_assessment_agent(topic.title, node.title, node.description)

            # Save Quiz
            quiz = Quiz.query.filter_by(node_id=node_id).first()
            if not quiz:
                quiz = Quiz(node_id=node_id, title=assess_data.get("quiz_title", f"{node.title} Quiz"))
                db.session.add(quiz)
                db.session.flush()

            # Clean existing quiz questions to prevent duplicates on retry
            QuizQuestion.query.filter_by(quiz_id=quiz.id).delete()
            
            for q_spec in assess_data.get("quiz_questions", []):
                q = QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=q_spec["question_text"],
                    correct_answer=q_spec["correct_answer"],
                    explanation=q_spec["explanation"]
                )
                q.options = q_spec["options"] # Using properties
                db.session.add(q)

            # Save Interview Prep
            InterviewQuestion.query.filter_by(node_id=node_id).delete()
            for i_spec in assess_data.get("interview_questions", []):
                iq = InterviewQuestion(
                    node_id=node_id,
                    question=i_spec["question"],
                    answer=i_spec["answer"]
                )
                db.session.add(iq)

            # Update job status
            job = GenerationJob.query.get(job_id)
            job.status = 'completed'
            job.completed_at = datetime.utcnow()
            db.session.commit()
            logger.info(f"Assessment generation completed for node {node_id}")

        except Exception as e:
            logger.error(f"Assessment generation failed for node {node_id}: {e}")
            try:
                job = GenerationJob.query.get(job_id)
                if job:
                    job.status = 'failed'
                    job.completed_at = datetime.utcnow()
                    job.error_message = str(e)
                    db.session.commit()
            except Exception:
                db.session.rollback()


def run_illustrations_generation(app, topic_id, node_id, job_id):
    with app.app_context():
        try:
            node = RoadmapNode.query.get(node_id)
            topic = Topic.query.get(topic_id)
            if not node or not topic:
                raise ValueError("Node or Topic not found")

            # Check if notes exist (illustrations planning requires note texts)
            material = Material.query.filter_by(node_id=node_id).first()
            if not material or not material.beginner_notes:
                raise ValueError("Cannot plan illustrations: notes not generated yet")

            # Plan illustrations
            from backend.agents.nodes import illustration_planner_agent
            notes_text = f"## Beginner\n{material.beginner_notes}\n## Detailed\n{material.detailed_notes}\n## Revision\n{material.revision_notes}"
            plan = illustration_planner_agent(topic.title, notes_text)

            ill_specs = plan.get("illustrations", [])
            existing_count = Illustration.query.filter_by(topic_id=topic_id).count()

            # Delete illustrations with matching section names under this topic to clean up
            section_names = [spec["section_name"] for spec in ill_specs]
            if section_names:
                Illustration.query.filter(
                    Illustration.topic_id == topic_id,
                    Illustration.section_name.in_(section_names)
                ).delete(synchronize_session='fetch')

            for idx, spec in enumerate(ill_specs):
                ill = Illustration(
                    topic_id=topic_id,
                    section_name=spec["section_name"],
                    concept=spec["concept"],
                    illustration_type=spec["illustration_type"],
                    caption=spec["caption"],
                    prompt=spec["metaphor"],
                    display_order=existing_count + idx + 1,
                    is_hidden=False
                )
                db.session.add(ill)
            
            db.session.flush()

            # Trigger background downloads
            from backend.agents.graph import generate_illustration_images_background
            thread = threading.Thread(
                target=generate_illustration_images_background,
                args=(app, topic_id)
            )
            thread.start()

            # Update job status
            job = GenerationJob.query.get(job_id)
            job.status = 'completed'
            job.completed_at = datetime.utcnow()
            db.session.commit()
            logger.info(f"Illustrations generation completed for node {node_id}")

        except Exception as e:
            logger.error(f"Illustrations generation failed for node {node_id}: {e}")
            try:
                job = GenerationJob.query.get(job_id)
                if job:
                    job.status = 'failed'
                    job.completed_at = datetime.utcnow()
                    job.error_message = str(e)
                    db.session.commit()
            except Exception:
                db.session.rollback()


class GenerationManager:
    @staticmethod
    def get_jobs_for_node(node_id):
        jobs = GenerationJob.query.filter_by(node_id=node_id).all()
        return {j.job_type: j.to_dict() for j in jobs}

    @staticmethod
    def trigger_job(topic_id, node_id, job_type):
        """
        Trigger an independent background generation job.
        If a job of the same type already exists for this node, reuse it and reset status.
        """
        # 1. Start job in DB
        job = GenerationJob.query.filter_by(topic_id=topic_id, node_id=node_id, job_type=job_type).first()
        if not job:
            job = GenerationJob(topic_id=topic_id, node_id=node_id, job_type=job_type)
            db.session.add(job)
        
        job.status = 'running'
        job.started_at = datetime.utcnow()
        job.completed_at = None
        job.error_message = None
        db.session.commit()
        
        # 2. Spawn thread
        app_context = current_app._get_current_object()
        
        if job_type == "notes":
            target_fn = run_notes_generation
        elif job_type == "assessment":
            target_fn = run_assessment_generation
        elif job_type == "illustrations":
            target_fn = run_illustrations_generation
        else:
            logger.error(f"Unknown job type: {job_type}")
            return job.id
            
        thread = threading.Thread(
            target=target_fn,
            args=(app_context, topic_id, node_id, job.id)
        )
        thread.start()
        return job.id
