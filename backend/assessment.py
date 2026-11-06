
import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def generate_assessment_questions(skill_profile, questions_per_skill=5):
    """
    Generate 5 MCQs per technical skill:
    2 Medium and 3 Difficult, using one Gemini API call.
    """
    technical_skills = skill_profile.get("technical_skills", [])

    if not technical_skills:
        return []

    # Remove empty and duplicate skill names.
    technical_skills = list(dict.fromkeys(
        skill.strip()
        for skill in technical_skills
        if isinstance(skill, str) and skill.strip()
    ))

    if not technical_skills:
        return []

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing from the .env file.")

    client = genai.Client(api_key=api_key)

    skills_json = json.dumps(technical_skills, ensure_ascii=False)

    prompt = f"""
You are an expert technical assessment generator.

Generate exactly 5 multiple-choice questions for EACH skill
in this JSON list:
{skills_json}

STRICT REQUIREMENTS:
- Generate exactly 2 questions with difficulty "Medium" per skill.
- Generate exactly 3 questions with difficulty "Difficult" per skill.
- Do not use any other difficulty labels.
- Every question must test a distinct concept relevant to its skill.
- Each question must have exactly 4 distinct, non-empty options.
- The answer must exactly match one of the four options.
- Do not repeat questions.
- Set the "skill" field to the exact corresponding skill name.
- Return only a valid JSON array, without Markdown or extra text.

Each object must use this structure:
{{
  "skill": "Exact skill name",
  "question": "Question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "answer": "Option 1",
  "difficulty": "Medium"
}}
"""

    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=prompt,
        config={"response_mime_type": "application/json"},
    )

    response_text = (response.text or "").strip()

    if not response_text:
        raise ValueError("Gemini returned an empty assessment response.")

    # Remove Markdown code fences if present.
    response_text = re.sub(
        r"^```(?:json)?\s*|\s*```$",
        "",
        response_text,
        flags=re.IGNORECASE,
    ).strip()

    try:
        questions = json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Gemini returned invalid JSON. "
            f"Response preview: {response_text[:200]!r}"
        ) from exc

    if not isinstance(questions, list):
        raise ValueError("Gemini assessment response must be a JSON array.")

    # Validate each skill separately.
    all_questions = []

    for skill in technical_skills:
        valid_questions = []

        for question in questions:
            if not isinstance(question, dict):
                continue

            if question.get("skill") != skill:
                continue

            question_text = question.get("question")
            options = question.get("options")
            answer = question.get("answer")
            difficulty = str(question.get("difficulty", "")).strip().lower()

            if difficulty == "medium":
                normalized_difficulty = "Medium"
            elif difficulty in ("difficult", "hard"):
                normalized_difficulty = "Difficult"
            else:
                continue

            if (
                not isinstance(question_text, str)
                or not question_text.strip()
                or not isinstance(options, list)
                or len(options) != 4
                or not all(
                    isinstance(option, str) and option.strip()
                    for option in options
                )
                or len(set(options)) != 4
                or not isinstance(answer, str)
                or answer not in options
            ):
                continue

            valid_questions.append({
                "skill": skill,
                "question": question_text.strip(),
                "options": options,
                "answer": answer,
                "difficulty": normalized_difficulty,
            })

        medium_questions = [
            q for q in valid_questions if q["difficulty"] == "Medium"
        ]
        difficult_questions = [
            q for q in valid_questions if q["difficulty"] == "Difficult"
        ]

        if len(medium_questions) < 2 or len(difficult_questions) < 3:
            raise ValueError(
                f"Assessment generation was incomplete for '{skill}'. "
                f"Received {len(medium_questions)} valid Medium and "
                f"{len(difficult_questions)} valid Difficult questions. "
                "Please wait before retrying."
            )

        all_questions.extend(medium_questions[:2])
        all_questions.extend(difficult_questions[:3])

    return all_questions
