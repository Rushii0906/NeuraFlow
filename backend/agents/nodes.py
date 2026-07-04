import os
import json
import logging
import time
import re
import typing_extensions as typing
import google.generativeai as genai
from backend.prompts.templates import ROADMAP_PROMPT, NOTES_PROMPT, ASSESSMENT_PROMPT, ILLUSTRATION_PLANNER_PROMPT
from backend.config import Config

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    logger.warning("GEMINI_API_KEY environment variable is not set!")

# Schema Definitions for Structured Outputs
class RoadmapNodeDict(typing.TypedDict):
    title: str
    description: str
    order: int

class RoadmapDict(typing.TypedDict):
    nodes: typing.List[RoadmapNodeDict]

class QuizQuestionDict(typing.TypedDict):
    question_text: str
    options: typing.List[str]
    correct_answer: str
    explanation: str

class InterviewQuestionDict(typing.TypedDict):
    question: str
    answer: str

class AssessmentDict(typing.TypedDict):
    quiz_title: str
    quiz_questions: typing.List[QuizQuestionDict]
    interview_questions: typing.List[InterviewQuestionDict]

import requests

def get_gemini_model():
    # Use gemini-flash-latest for stable 15 RPM free tier limits
    return genai.GenerativeModel("gemini-flash-latest")

# Configure Groq
groq_key = os.getenv("GROQ_API_KEY")
groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

def call_groq_text(prompt: str) -> str:
    """Helper to call Groq completions for text."""
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": groq_model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=40)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]

def call_groq_json(prompt: str) -> dict:
    """Helper to call Groq completions in JSON mode."""
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }
    full_prompt = prompt + "\n\nCRITICAL: You must return the output as a valid JSON object matching the requested schema."
    payload = {
        "model": groq_model,
        "messages": [
            {"role": "user", "content": full_prompt}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }
    res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=40)
    res.raise_for_status()
    clean_text = res.json()["choices"][0]["message"]["content"].strip()
    if clean_text.startswith("```json"):
        clean_text = clean_text[7:]
    if clean_text.startswith("```"):
        clean_text = clean_text[3:]
    if clean_text.endswith("```"):
        clean_text = clean_text[:-3]
    return json.loads(clean_text.strip())

def call_gemini_text(prompt: str) -> str:
    """Helper to call active LLM and return raw text response with automatic retry on 429."""
    if groq_key:
        try:
            logger.info(f"Using Groq API ({groq_model}) for text generation...")
            return call_groq_text(prompt)
        except Exception as e:
            logger.warning(f"Groq API call failed: {e}. Falling back to Gemini...")

    max_retries = 6
    base_delay = 5.0
    
    for attempt in range(max_retries):
        try:
            model = get_gemini_model()
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "ResourceExhausted" in err_msg or "quota" in err_msg.lower():
                delay = base_delay
                match = re.search(r"retry in ([\d\.]+)s", err_msg)
                if match:
                    delay = float(match.group(1)) + 0.5  # Add small safety buffer
                else:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                
                logger.warning(f"Gemini API rate limit hit. Retrying in {delay:.2f} seconds... (Attempt {attempt+1}/{max_retries})")
                time.sleep(delay)
            else:
                logger.error(f"Error calling Gemini: {e}")
                raise e
                
    raise Exception("Max retries exceeded for Gemini API call due to rate limiting.")

def call_gemini_json_with_schema(prompt: str, schema: typing.Any) -> dict:
    """Helper to call active LLM and force a JSON response conforming strictly to a schema with automatic retry on 429."""
    if groq_key:
        try:
            logger.info(f"Using Groq API ({groq_model}) for JSON generation...")
            return call_groq_json(prompt)
        except Exception as e:
            logger.warning(f"Groq JSON API call failed: {e}. Falling back to Gemini...")

    max_retries = 6
    base_delay = 5.0
    
    for attempt in range(max_retries):
        try:
            model = get_gemini_model()
            response = model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "response_schema": schema
                }
            )
            # Remove potential leading/trailing markdown code blocks if any
            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            return json.loads(clean_text.strip())
        except Exception as e:
            err_msg = str(e)
            is_json_err = isinstance(e, json.JSONDecodeError)
            if "429" in err_msg or "ResourceExhausted" in err_msg or "quota" in err_msg.lower() or is_json_err:
                delay = base_delay if not is_json_err else 1.0
                if is_json_err:
                    logger.warning(f"Failed to decode JSON from Gemini. Retrying... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(delay)
                    continue
                
                match = re.search(r"retry in ([\d\.]+)s", err_msg)
                if match:
                    delay = float(match.group(1)) + 0.5  # Add small safety buffer
                else:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                
                logger.warning(f"Gemini API rate limit hit. Retrying in {delay:.2f} seconds... (Attempt {attempt+1}/{max_retries})")
                time.sleep(delay)
            else:
                logger.error(f"Error calling Gemini: {e}")
                raise e
                
    raise Exception("Max retries exceeded for Gemini API call due to rate limiting.")

def research_and_roadmap_agent(topic: str) -> dict:
    """Agent node to research a topic and generate a structured list of roadmap nodes."""
    logger.info(f"Generating roadmap for topic: {topic}")
    prompt = ROADMAP_PROMPT.format(topic=topic)
    return call_gemini_json_with_schema(prompt, RoadmapDict)

def generate_notes_agent(topic: str, node_title: str, node_description: str) -> dict:
    """Agent node to generate study materials (beginner, detailed, and revision notes) in raw Markdown."""
    logger.info(f"Generating study notes for node: {node_title}")
    prompt = NOTES_PROMPT.format(topic=topic, node_title=node_title, node_description=node_description or "")
    raw_text = call_gemini_text(prompt)
    
    parts = re.split(r'===\s*(BEGINNER|DETAILED|REVISION)\s*===', raw_text)
    sections = {
        "beginner_notes": "",
        "detailed_notes": "",
        "revision_notes": ""
    }
    
    for i in range(1, len(parts), 2):
        section_name = parts[i].lower()
        content = parts[i+1].strip() if i+1 < len(parts) else ""
        if section_name == "beginner":
            sections["beginner_notes"] = content
        elif section_name == "detailed":
            sections["detailed_notes"] = content
        elif section_name == "revision":
            sections["revision_notes"] = content
            
    return sections

def generate_assessment_agent(topic: str, node_title: str, node_description: str) -> dict:
    """Agent node to generate quiz and interview prep questions in a structured JSON schema."""
    logger.info(f"Generating assessment (quiz and interviews) for node: {node_title}")
    prompt = ASSESSMENT_PROMPT.format(topic=topic, node_title=node_title, node_description=node_description or "")
    return call_gemini_json_with_schema(prompt, AssessmentDict)

def generate_combined_content_agent(topic: str, node_title: str, node_description: str) -> dict:
    """Agent node to generate both notes and assessment by calling the respective agents."""
    logger.info(f"Generating combined content for node: {node_title}")
    notes = generate_notes_agent(topic, node_title, node_description)
    assessment = generate_assessment_agent(topic, node_title, node_description)
    
    combined = {}
    combined.update(notes)
    combined.update(assessment)
    return combined

class IllustrationSpecDict(typing.TypedDict):
    section_name: str
    concept: str
    illustration_type: str
    metaphor: str
    caption: str
    placement: str

class IllustrationsListDict(typing.TypedDict):
    illustrations: typing.List[IllustrationSpecDict]

def illustration_planner_agent(topic_title: str, compiled_notes: str) -> dict:
    """Agent node to read compiled notes and plan 3-6 illustration specifications."""
    logger.info(f"Planning illustrations for topic: {topic_title}")
    prompt = ILLUSTRATION_PLANNER_PROMPT.format(topic_title=topic_title, compiled_notes=compiled_notes)
    return call_gemini_json_with_schema(prompt, IllustrationsListDict)


