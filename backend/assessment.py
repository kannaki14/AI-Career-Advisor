import os
import json
from google import genai


def generate_assessment_questions(skill_profile, questions_per_skill=10):
    """
    Generate AI-based assessment questions using Gemini.
    """

    technical_skills = skill_profile.get("technical_skills", [])

    if not technical_skills:
        return []

    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY")
    )

    skills_text = ", ".join(technical_skills)

    prompt = f"""
You are an AI skill assessment generator.

Create multiple-choice assessment questions for each of these
technical skills:

{skills_text}

For every skill:
- Create exactly 10 practical questions for each skill.
- For each skill:
  - 4 questions must be Basic difficulty.
  - 4 questions must be Intermediate difficulty.
  - 2 questions must be Advanced difficulty.
- Provide exactly 4 options for every question.
- Provide the correct answer for every question.
- Questions should test different concepts within the same skill.
- Do not create duplicate or nearly identical questions.
- Return ONLY valid JSON.

Use this format:
[
  {{
    "skill": "Python",
    "question": "Question here",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answer": "Correct option",
    "difficulty": "Basic"
  }}
]
"""

    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=prompt
    )

    return json.loads(response.text)