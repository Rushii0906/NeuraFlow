from backend.app import create_app
from backend.models import User, Topic, RoadmapNode, Material, Quiz, QuizQuestion, InterviewQuestion, UserProgress

app = create_app()

with app.app_context():
    print("--- Database Content Check ---")
    users = User.query.all()
    print(f"Users ({len(users)}):")
    for u in users:
        print(f"  - ID: {u.id}, Name: {u.name}, Email: {u.email}")
        
    topics = Topic.query.all()
    print(f"\nTopics ({len(topics)}):")
    for t in topics:
        print(f"  - ID: {t.id}, Title: {t.title}, Status: {t.status}, Created At: {t.created_at}")
        nodes = RoadmapNode.query.filter_by(topic_id=t.id).all()
        print(f"    Roadmap Nodes ({len(nodes)}):")
        for n in nodes:
            print(f"      * Node ID {n.id}: {n.title} (Order: {n.order})")
            material = Material.query.filter_by(node_id=n.id).first()
            quiz = Quiz.query.filter_by(node_id=n.id).first()
            interviews = InterviewQuestion.query.filter_by(node_id=n.id).all()
            print(f"        Notes: {'Yes' if material else 'No'}, Quiz: {'Yes' if quiz else 'No'}, Interview QA: {len(interviews)} items")
            
    progress = UserProgress.query.all()
    print(f"\nUser Progress Records ({len(progress)}):")
    for p in progress:
        print(f"  - User ID: {p.user_id}, Node ID: {p.node_id}, Completed: {p.is_completed}, Quiz Score: {p.quiz_score}")
