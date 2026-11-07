import json
import math
import os
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from google import genai

from roadmap.generator import (
    apply_career_topic_order,
    collect_unique_skills,
    order_skills_for_career,
    skill_label,
)

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

_FENCE_PREFIX = re.compile(r"^```(?:json)?\s*", re.IGNORECASE)
_FENCE_SUFFIX = re.compile(r"\s*```$")


class RoadmapGenerationError(Exception):
    """Raised when Gemini cannot produce a valid, normalized roadmap."""


def generate_ai_learning_roadmap(
    career,
    missing_skills,
    skills_to_improve=None,
    daily_study_minutes=60,
):
    """Generate a personalized roadmap with Gemini and normalize the result."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RoadmapGenerationError("unavailable")

    skills_to_improve = skills_to_improve or []
    prompt = _build_prompt(
        career,
        missing_skills,
        skills_to_improve,
        daily_study_minutes,
    )

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt,
        )
        payload = _extract_json_object(getattr(response, "text", None))
        return normalize_ai_roadmap(
            payload,
            career=career,
            daily_study_minutes=daily_study_minutes,
            missing_skills=missing_skills,
            skills_to_improve=skills_to_improve,
        )
    except RoadmapGenerationError:
        raise
    except Exception:
        raise RoadmapGenerationError("unavailable") from None


def normalize_ai_roadmap(
    payload,
    career,
    daily_study_minutes,
    missing_skills=None,
    skills_to_improve=None,
):
    """Validate model output and rebuild totals in Python."""
    if not isinstance(payload, dict):
        raise RoadmapGenerationError("invalid")

    if not isinstance(career, str) or not career.strip():
        raise RoadmapGenerationError("invalid")

    if not isinstance(daily_study_minutes, int) or daily_study_minutes <= 0:
        raise RoadmapGenerationError("invalid")

    raw_topics = payload.get("topics")
    if not isinstance(raw_topics, list):
        raise RoadmapGenerationError("invalid")

    requested_skills = _non_empty_skills(skills_to_improve) + _non_empty_skills(
        missing_skills
    )
    if requested_skills and not raw_topics:
        raise RoadmapGenerationError("invalid")

    topics = []
    previous_skills = []

    for index, raw_topic in enumerate(raw_topics, start=1):
        topic = _normalize_topic(raw_topic, index, previous_skills)
        topics.append(topic)
        previous_skills.append(topic["skill"])

    # Enforce career learning order for AI output (e.g. Full Stack Developer).
    topics = apply_career_topic_order(career, topics)
    total_hours = sum(topic["estimated_hours"] for topic in topics)

    total_minutes = total_hours * 60
    estimated_days = (
        math.ceil(total_minutes / daily_study_minutes) if total_minutes else 0
    )

    return {
        "career": career.strip(),
        "created_date": date.today().isoformat(),
        "daily_study_minutes": daily_study_minutes,
        "total_topics": len(topics),
        "estimated_total_hours": total_hours,
        "estimated_days": estimated_days,
        "overall_progress_percentage": 0,
        "topics": topics,
    }


def _non_empty_skills(skills):
    if not skills:
        return []
    if not isinstance(skills, list):
        raise RoadmapGenerationError("invalid")
    return [skill.strip() for skill in skills if isinstance(skill, str) and skill.strip()]


def _preferred_order_hint(career, ordered_skills):
    """Return an optional learning-order hint for known careers."""
    if not ordered_skills:
        return ""
    labels = [skill_label(skill) for skill in ordered_skills]
    return (
        "- Order topics exactly as: "
        + ", ".join(labels)
        + ".\n"
    )


def _build_prompt(career, missing_skills, skills_to_improve, daily_study_minutes):
    ordered_skills = order_skills_for_career(
        career,
        collect_unique_skills(skills_to_improve, missing_skills),
    )
    ordered_labels = [skill_label(skill) for skill in ordered_skills]
    missing = ", ".join(ordered_labels) or "none"
    improve = ", ".join(_non_empty_skills(skills_to_improve)) or "none"
    order_hint = _preferred_order_hint(career, ordered_skills)
    return f"""
You are an AI learning-roadmap generator.

Create a personalized learning roadmap for this target career and skill gaps.
Return ONLY valid JSON. Do not include markdown or commentary.

Target career: {career}
Missing skills: {missing}
Skills to improve: {improve}
Preferred topic order: {", ".join(ordered_labels) or "none"}
Daily study minutes: {daily_study_minutes}

JSON shape:
{{
  "career": "Career name",
  "created_date": "YYYY-MM-DD",
  "daily_study_minutes": 60,
  "total_topics": 1,
  "estimated_total_hours": 4,
  "estimated_days": 4,
  "overall_progress_percentage": 0,
  "topics": [
    {{
      "topic_id": 1,
      "skill": "Skill name",
      "title": "Resource title",
      "resource_url": "https://example.com/resource",
      "estimated_hours": 4,
      "prerequisites": [],
      "status": "Pending"
    }}
  ]
}}

Rules:
- Include one topic per requested skill, in a sensible learning order.
{order_hint}- Use real HTTP or HTTPS learning resource URLs.
- estimated_hours must be a positive number.
- estimated_total_hours must equal the sum of topic estimated_hours.
- estimated_days must assume {daily_study_minutes} minutes of study per day.
- prerequisites must only list earlier topic skills.
- Every topic status must be Pending.
"""


def _extract_json_object(text):
    if not isinstance(text, str) or not text.strip():
        raise RoadmapGenerationError("invalid")

    cleaned = text.strip()
    cleaned = _FENCE_PREFIX.sub("", cleaned)
    cleaned = _FENCE_SUFFIX.sub("", cleaned).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end <= start:
            raise RoadmapGenerationError("invalid") from None
        try:
            data = json.loads(cleaned[start:end + 1])
        except json.JSONDecodeError:
            raise RoadmapGenerationError("invalid") from None

    if not isinstance(data, dict):
        raise RoadmapGenerationError("invalid")
    return data


def _normalize_topic(raw_topic, topic_id, previous_skills):
    if not isinstance(raw_topic, dict):
        raise RoadmapGenerationError("invalid")

    skill = raw_topic.get("skill")
    title = raw_topic.get("title")
    if not isinstance(skill, str) or not skill.strip():
        raise RoadmapGenerationError("invalid")
    if not isinstance(title, str) or not title.strip():
        raise RoadmapGenerationError("invalid")

    hours = _positive_hours(raw_topic.get("estimated_hours"))
    url = _valid_http_url(raw_topic.get("resource_url"))
    prerequisites = _valid_prerequisites(
        raw_topic.get("prerequisites"),
        previous_skills,
    )

    return {
        "topic_id": topic_id,
        "skill": skill.strip(),
        "title": title.strip(),
        "resource_url": url,
        "estimated_hours": hours,
        "prerequisites": prerequisites,
        "status": "Pending",
    }


def _positive_hours(value):
    if isinstance(value, bool) or value is None:
        raise RoadmapGenerationError("invalid")

    if isinstance(value, int) and value > 0:
        return value

    if isinstance(value, float) and value > 0 and math.isfinite(value):
        return int(value) if value.is_integer() else value

    if isinstance(value, str) and value.strip():
        try:
            return _positive_hours(float(value.strip()))
        except (TypeError, ValueError, RoadmapGenerationError):
            raise RoadmapGenerationError("invalid") from None

    raise RoadmapGenerationError("invalid")


def _valid_http_url(value):
    if not isinstance(value, str):
        raise RoadmapGenerationError("invalid")

    parsed = urlparse(value.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise RoadmapGenerationError("invalid")
    if parsed.username or parsed.password:
        raise RoadmapGenerationError("invalid")
    return value.strip()


def _valid_prerequisites(value, previous_skills):
    if value is None:
        value = []
    if not isinstance(value, list):
        raise RoadmapGenerationError("invalid")

    allowed = {skill.casefold(): skill for skill in previous_skills}
    normalized = []
    for item in value:
        if not isinstance(item, str) or not item.strip():
            raise RoadmapGenerationError("invalid")
        canonical = allowed.get(item.strip().casefold())
        if canonical is None:
            raise RoadmapGenerationError("invalid")
        if canonical not in normalized:
            normalized.append(canonical)
    return normalized
