import logging
from backend.database.db import db
from backend.models.learning import Topic, RoadmapNode, Material, Quiz, QuizQuestion, InterviewQuestion, Illustration

logger = logging.getLogger(__name__)

class CacheService:
    @staticmethod
    def get_cached_topic(topic_title: str, user_id: int) -> int:
        """
        Check if a fully generated topic exists for any user.
        If yes, clone it (nodes, prerequisites, notes, quizzes, illustrations) 
        for the requesting user and return the new topic ID.
        Otherwise, return None.
        """
        # Find any completed topic with matching title
        existing_topic = Topic.query.filter(
            Topic.title.ilike(topic_title),
            Topic.status == 'completed'
        ).first()

        if not existing_topic:
            return None

        logger.info(f"Cache HIT for topic: '{topic_title}' (ID: {existing_topic.id}). Cloning for User ID {user_id}...")

        try:
            # 1. Clone the Topic
            new_topic = Topic(
                user_id=user_id,
                title=existing_topic.title,
                status='completed'
            )
            db.session.add(new_topic)
            db.session.flush() # Populate new_topic.id

            # 2. Clone RoadmapNodes
            old_nodes = RoadmapNode.query.filter_by(topic_id=existing_topic.id).order_by(RoadmapNode.order).all()
            node_map = {} # Maps old_node.id -> new_node_obj
            
            for old_node in old_nodes:
                new_node = RoadmapNode(
                    topic_id=new_topic.id,
                    title=old_node.title,
                    description=old_node.description,
                    order=old_node.order,
                    difficulty=old_node.difficulty,
                    estimated_time=old_node.estimated_time,
                    resources_json=old_node.resources_json
                )
                db.session.add(new_node)
                db.session.flush() # Populate new_node.id
                node_map[old_node.id] = new_node

            # 3. Clone Node Prerequisites
            for old_id, new_node in node_map.items():
                old_node = RoadmapNode.query.get(old_id)
                if old_node and old_node.prerequisites:
                    for old_prereq in old_node.prerequisites:
                        new_prereq = node_map.get(old_prereq.id)
                        if new_prereq:
                            new_node.prerequisites.append(new_prereq)
            
            db.session.flush()

            # 4. Clone Materials (Notes), Quizzes, and Interview Questions
            for old_id, new_node in node_map.items():
                old_node = RoadmapNode.query.get(old_id)
                if not old_node:
                    continue

                # Material (Notes)
                if old_node.material:
                    new_material = Material(
                        node_id=new_node.id,
                        beginner_notes=old_node.material.beginner_notes,
                        detailed_notes=old_node.material.detailed_notes,
                        revision_notes=old_node.material.revision_notes
                    )
                    db.session.add(new_material)

                # Quiz & QuizQuestions
                if old_node.quiz:
                    new_quiz = Quiz(
                        node_id=new_node.id,
                        title=old_node.quiz.title
                    )
                    db.session.add(new_quiz)
                    db.session.flush()

                    for old_q in old_node.quiz.questions:
                        new_q = QuizQuestion(
                            quiz_id=new_quiz.id,
                            question_text=old_q.question_text,
                            options_json=old_q.options_json,
                            correct_answer=old_q.correct_answer,
                            explanation=old_q.explanation
                        )
                        db.session.add(new_q)

                # Interview Questions
                for old_iq in old_node.interview_questions:
                    new_iq = InterviewQuestion(
                        node_id=new_node.id,
                        question=old_iq.question,
                        answer=old_iq.answer
                    )
                    db.session.add(new_iq)

            # 5. Clone Illustrations
            old_illustrations = Illustration.query.filter_by(topic_id=existing_topic.id).all()
            for old_ill in old_illustrations:
                new_ill = Illustration(
                    topic_id=new_topic.id,
                    section_name=old_ill.section_name,
                    concept=old_ill.concept,
                    illustration_type=old_ill.illustration_type,
                    caption=old_ill.caption,
                    prompt=old_ill.prompt,
                    image_url=old_ill.image_url,
                    display_order=old_ill.display_order,
                    is_hidden=old_ill.is_hidden
                )
                db.session.add(new_ill)

            db.session.commit()
            logger.info(f"Successfully cloned topic to ID {new_topic.id}")
            return new_topic.id

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to clone cached topic: {e}")
            raise e
