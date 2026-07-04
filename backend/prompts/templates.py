ROADMAP_PROMPT = """You are an expert curriculum designer.
Analyze the requested topic: "{topic}"
Generate a structured, progressive learning roadmap.
The roadmap must have between 3 to 4 sequential nodes (steps) that logically build on top of each other, starting from basic definitions to advanced implementation.

IMPORTANT: Do NOT include any numbering prefixes in the node titles (e.g. do NOT write "1. Intro", write "Intro" instead). The application will automatically number them based on their sequence.

Respond ONLY with a JSON object in the following format:
{{
  "nodes": [
    {{
      "title": "Node title (e.g., Foundations of covalent bonding)",
      "description": "Short summary of what is covered in this step",
      "order": 1
    }}
  ]
}}
"""

NOTES_PROMPT = """You are an elite educator simplifying complex technical topics.
For the topic "{topic}", write comprehensive study guides for the node: "{node_title}" (Context: {node_description}).

You must generate three distinct levels of learning notes in Markdown format, separated exactly by the lines "=== BEGINNER ===", "=== DETAILED ===", and "=== REVISION ===".

Format your response exactly as follows:
=== BEGINNER ===
[Insert beginner notes here. Use clear analogies, simple language, no complex math, and real-world examples.]

=== DETAILED ===
[Insert detailed notes here. In-depth technical explanation, core equations or formulas, code snippets, architectures, and precise terms.]

=== REVISION ===
[Insert revision notes here. High-yield bullet points, summaries, cheat sheets, and definitions of terms.]
"""

ASSESSMENT_PROMPT = """You are a professional assessor and technical interviewer.
Generate quiz questions and interview preparation questions for the node: "{node_title}" (Context: {node_description}) of the topic "{topic}".

You must generate:
1. Quiz: Exactly 4 challenging multiple-choice questions. Each must have:
   - Question text
   - Exactly 4 options
   - Correct answer (must match one of the options EXACTLY)
   - Explanation
2. Interview Preparation: Exactly 3 typical interview questions and detailed answers.

Respond ONLY with a JSON object in the following format:
{{
  "quiz_title": "Quiz Title (e.g., {node_title} Quiz)",
  "quiz_questions": [
    {{
      "question_text": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "..."
    }}
  ],
  "interview_questions": [
    {{
      "question": "...",
      "answer": "..."
    }}
  ]
}}
"""

ILLUSTRATION_PLANNER_PROMPT = """You are an expert educational illustrator and curriculum designer.
Analyze the following compiled learning notes for the topic: "{topic_title}".

Notes:
\"\"\"
{compiled_notes}
\"\"\"

Your task is to identify key concepts within these notes that are difficult, abstract, or would benefit significantly from visual learning.
Specifically, look for:
1. Abstract Concepts (e.g. Hash Table -> Mailbox analogy)
2. Workflows (e.g. Request -> Backend -> AI -> DB -> Response)
3. Comparisons (e.g. Stack vs Queue)
4. Timelines (e.g. History of AI)
5. Decision Trees (e.g. Logistic Regression vs other models)
6. Process Diagrams (e.g. Bubble Sort passes)
7. Memory Analogies (e.g. RAM as student's desk vs SSD as library)

Rank these concepts by their educational value. Select between 3 and 6 of the most valuable concepts to illustrate across the entire topic. Do not make illustrations for every single paragraph.

For each selected concept, design a creative visual metaphor in the "Ian Xiaohei" style.
The Ian Xiaohei style is characterized by:
- Minimalist, simple black line drawings
- Clean, hand-drawn feeling on a solid white background
- Friendly characters and visual metaphors (rather than realism)
- Professional, corporate-friendly, and lots of whitespace
- Small accent colors when necessary
- Absolutely NO anime, NO realistic art, NO 3D images, and NO generic stock vector art.

Determine which specific section/heading in the notes the illustration belongs to.

Respond ONLY with a JSON object in the following format:
{{
  "illustrations": [
    {{
      "section_name": "Name of the header/section in the notes (e.g. 'Core Algorithm' or 'Memory Models')",
      "concept": "The concept name (e.g. 'Stack vs Queue' or 'Big O Complexity')",
      "illustration_type": "One of: Concept, Workflow, Comparison, Timeline, Decision Tree, Process, Memory Analogy",
      "metaphor": "A detailed description of the hand-drawn sketch visual metaphor (e.g. 'A friendly cartoon robot standing in front of two pipes. The first pipe represents a stack where tennis balls are added and removed from the top. The second pipe represents a queue where balls roll in one side and out the other.')",
      "caption": "A concise, clear educational caption for the illustration to be shown underneath.",
      "placement": "after_section"
    }}
  ]
}}
"""

