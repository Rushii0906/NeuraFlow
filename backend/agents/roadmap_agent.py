import typing_extensions as typing
from backend.agents.nodes import call_gemini_json_with_schema

# Schema Definitions for Structured Outputs
class ResourceDict(typing.TypedDict):
    title: str
    url: str

class RoadmapNodeSpecDict(typing.TypedDict):
    title: str
    description: str
    difficulty: str
    estimated_time: str
    prerequisites: typing.List[str]
    resources: typing.List[ResourceDict]

class RoadmapSpecDict(typing.TypedDict):
    nodes: typing.List[RoadmapNodeSpecDict]


ROADMAP_PREREQ_PROMPT = """You are an expert curriculum designer.
Analyze the requested topic: "{topic}"
Generate a structured, progressive learning roadmap.
The roadmap must have between 4 to 6 learning nodes (topics/chapters) connected by prerequisite relationships.
The roadmap must start with foundational concepts and lead to advanced implementation, allowing branching paths (e.g. Node 2 and Node 3 both unlock from Node 1, and both are required for Node 4, etc.).

For each node, define:
1. title: Node title (e.g., "Intro to Vectors")
2. description: Short summary of what is covered in this step.
3. difficulty: One of "Beginner", "Intermediate", "Advanced"
4. estimated_time: Estimated study time (e.g., "1.5 hours", "45 mins")
5. prerequisites: A list of titles of OTHER nodes generated in this request that must be completed before starting this node. Foundations should have an empty list [].
6. resources: A list of 2 helpful study resource objects, each having a "title" and a "url" (relevant website references or educational links).

IMPORTANT: Do NOT include any numbering prefixes in the node titles (e.g. do NOT write "1. Intro", write "Intro" instead).

Respond ONLY with a JSON object in the following format:
{{
  "nodes": [
    {{
      "title": "Node Title",
      "description": "Short description...",
      "difficulty": "Beginner",
      "estimated_time": "1 hour",
      "prerequisites": [],
      "resources": [
        {{"title": "Resource Website", "url": "https://example.com/resource"}}
      ]
    }}
  ]
}}
"""

def roadmap_agent(topic: str) -> dict:
    """Agent node to research a topic and generate a structured list of roadmap nodes with prerequisites."""
    prompt = ROADMAP_PREREQ_PROMPT.format(topic=topic)
    return call_gemini_json_with_schema(prompt, RoadmapSpecDict)
