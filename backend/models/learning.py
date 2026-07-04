import json
from datetime import datetime
from backend.database.db import db

class Topic(db.Model):
    __tablename__ = 'topics'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='generating', nullable=False)  # 'generating', 'completed', 'failed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    nodes = db.relationship('RoadmapNode', backref='topic', cascade='all, delete-orphan', order_by='RoadmapNode.order', lazy=True)
    illustrations = db.relationship('Illustration', backref='topic', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


node_prerequisites = db.Table('node_prerequisites',
    db.Column('node_id', db.Integer, db.ForeignKey('roadmap_nodes.id', ondelete='CASCADE'), primary_key=True),
    db.Column('prerequisite_node_id', db.Integer, db.ForeignKey('roadmap_nodes.id', ondelete='CASCADE'), primary_key=True)
)


class RoadmapNode(db.Model):
    __tablename__ = 'roadmap_nodes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    order = db.Column(db.Integer, nullable=False)
    difficulty = db.Column(db.String(50), nullable=True)
    estimated_time = db.Column(db.String(100), nullable=True)
    resources_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    material = db.relationship('Material', backref='node', cascade='all, delete-orphan', uselist=False, lazy=True)
    quiz = db.relationship('Quiz', backref='node', cascade='all, delete-orphan', uselist=False, lazy=True)
    interview_questions = db.relationship('InterviewQuestion', backref='node', cascade='all, delete-orphan', lazy=True)
    progress_records = db.relationship('UserProgress', backref='node', cascade='all, delete-orphan', lazy=True)

    prerequisites = db.relationship(
        'RoadmapNode',
        secondary=node_prerequisites,
        primaryjoin='RoadmapNode.id==node_prerequisites.c.node_id',
        secondaryjoin='RoadmapNode.id==node_prerequisites.c.prerequisite_node_id',
        backref='prerequisite_for'
    )

    @property
    def resources(self):
        try:
            return json.loads(self.resources_json) if self.resources_json else []
        except Exception:
            return []

    @resources.setter
    def resources(self, val):
        self.resources_json = json.dumps(val)

    def to_dict(self, user_id=None):
        data = {
            "id": self.id,
            "topic_id": self.topic_id,
            "title": self.title,
            "description": self.description,
            "order": self.order,
            "difficulty": self.difficulty or "Beginner",
            "estimated_time": self.estimated_time or "1 hour",
            "resources": self.resources,
            "prerequisites": [p.id for p in self.prerequisites]
        }
        if user_id:
            # Query user progress on the fly if user_id is provided
            progress = UserProgress.query.filter_by(user_id=user_id, node_id=self.id).first()
            data["is_completed"] = progress.is_completed if progress else False
            data["quiz_score"] = progress.quiz_score if progress else None
            
            # Compute is_unlocked
            if not self.prerequisites:
                data["is_unlocked"] = True
            else:
                prereq_ids = [p.id for p in self.prerequisites]
                completed_count = UserProgress.query.filter(
                    UserProgress.user_id == user_id,
                    UserProgress.node_id.in_(prereq_ids),
                    UserProgress.is_completed == True
                ).count()
                data["is_unlocked"] = (completed_count == len(prereq_ids))
        else:
            data["is_unlocked"] = True
        return data


class Material(db.Model):
    __tablename__ = 'materials'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    node_id = db.Column(db.Integer, db.ForeignKey('roadmap_nodes.id', ondelete='CASCADE'), nullable=False)
    beginner_notes = db.Column(db.Text, nullable=False)
    detailed_notes = db.Column(db.Text, nullable=False)
    revision_notes = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "node_id": self.node_id,
            "beginner_notes": self.beginner_notes,
            "detailed_notes": self.detailed_notes,
            "revision_notes": self.revision_notes
        }


class Quiz(db.Model):
    __tablename__ = 'quizzes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    node_id = db.Column(db.Integer, db.ForeignKey('roadmap_nodes.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    questions = db.relationship('QuizQuestion', backref='quiz', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "node_id": self.node_id,
            "title": self.title,
            "questions": [q.to_dict() for q in self.questions]
        }


class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options_json = db.Column(db.Text, nullable=False)  # Serialized JSON list of strings
    correct_answer = db.Column(db.String(255), nullable=False)
    explanation = db.Column(db.Text, nullable=True)

    @property
    def options(self):
        try:
            return json.loads(self.options_json)
        except Exception:
            return []

    @options.setter
    def options(self, val):
        self.options_json = json.dumps(val)

    def to_dict(self):
        return {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "options": self.options,
            "correct_answer": self.correct_answer,
            "explanation": self.explanation
        }


class InterviewQuestion(db.Model):
    __tablename__ = 'interview_questions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    node_id = db.Column(db.Integer, db.ForeignKey('roadmap_nodes.id', ondelete='CASCADE'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "node_id": self.node_id,
            "question": self.question,
            "answer": self.answer
        }


class UserProgress(db.Model):
    __tablename__ = 'user_progress'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    node_id = db.Column(db.Integer, db.ForeignKey('roadmap_nodes.id', ondelete='CASCADE'), nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    quiz_score = db.Column(db.Integer, nullable=True)  # Store percentage (e.g. 0 to 100)
    completed_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'node_id', name='_user_node_uc'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "node_id": self.node_id,
            "is_completed": self.is_completed,
            "quiz_score": self.quiz_score,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class Illustration(db.Model):
    __tablename__ = 'illustrations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id', ondelete='CASCADE'), nullable=False)
    section_name = db.Column(db.String(255), nullable=False)
    concept = db.Column(db.String(255), nullable=False)
    illustration_type = db.Column(db.String(100), nullable=False)
    caption = db.Column(db.Text, nullable=False)
    prompt = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(512), nullable=True)
    display_order = db.Column(db.Integer, nullable=False)
    is_hidden = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "topic_id": self.topic_id,
            "section_name": self.section_name,
            "concept": self.concept,
            "illustration_type": self.illustration_type,
            "caption": self.caption,
            "prompt": self.prompt,
            "image_url": self.image_url,
            "display_order": self.display_order,
            "is_hidden": self.is_hidden,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class GenerationJob(db.Model):
    __tablename__ = 'generation_jobs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id', ondelete='CASCADE'), nullable=False)
    node_id = db.Column(db.Integer, db.ForeignKey('roadmap_nodes.id', ondelete='CASCADE'), nullable=True)
    job_type = db.Column(db.String(50), nullable=False)  # roadmap, notes, quiz, interview, illustrations
    status = db.Column(db.String(50), default='pending')  # pending, running, completed, failed
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "topic_id": self.topic_id,
            "node_id": self.node_id,
            "job_type": self.job_type,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error_message": self.error_message
        }


