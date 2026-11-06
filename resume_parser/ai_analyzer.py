
import json
import os

from google import genai


MODEL_NAME = "gemini-3.1-flash-lite"


def analyze_resume_with_gemini(resume_text: str) -> dict:
    """Extract structured information from resume text using Gemini."""

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is empty.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Check your backend .env file."
        )

    client = genai.Client(api_key=api_key)

    prompt = """
    Analyze the resume text provided below.

    Extract only information supported by the resume. Do not invent skills,
    qualifications, experience, projects, certifications, or achievements.

    Return valid JSON with exactly these keys:
    {
      "name": "",
      "education": [],
      "technical_skills": [],
      "soft_skills": [],
      "projects": [],
      "certifications": [],
      "experience": [],
      "interests": []
    }

    Rules:
    - Use arrays of strings for all fields except name.
    - Include programming languages, frameworks, tools, and technical
      concepts in technical_skills when explicitly mentioned.
    - Include communication, teamwork, leadership, and similar skills
      in soft_skills only when supported by the resume.
    - Preserve relevant details in projects, certifications, education,
      and experience.
    - Do not treat suggested or hypothetical qualifications as completed.
    - Use an empty string or empty array when information is unavailable.
    - Technical skills must be actual technologies, programming languages,
  frameworks, libraries, databases, tools, or technical concepts.
- Extract technical skills from both the Technical Expertise section
  and project descriptions.
- Do not classify general abilities such as problem-solving as technical
  skills; place them in soft_skills when supported by the resume.
- Do not classify a project outcome or feature as a technical skill.
  For example, "AI-assisted food image validation" is a project feature
  unless a specific AI tool, model, or technique is identified.
- Remove duplicate and near-duplicate skills.
- Keep every skill as a separate string in its appropriate array.
- Do not invent skills or infer expertise merely because a technology
  appears in a project. Only list technologies explicitly mentioned.
- Keep certifications empty when no completed certification is listed.
- Deduplicate soft skills such as teamwork and team collaboration.

Rules:
- Use arrays of strings for all fields except name.
- Return a maximum of 8 technical skills, selecting only the most important skills for career assessment.
- Prioritize core programming languages, computer science concepts, databases, and major frameworks relevant to the resume.
- Prefer skills explicitly listed under the Technical Expertise section.
- Include a project technology only when it is significant, explicitly mentioned, and relevant to the person's career.
- Do not list every library, tool, API, or technology mentioned in the resume.
- Technical skills must be actual technologies, programming languages, frameworks, libraries, databases, tools, or technical concepts.
- Do not classify general abilities such as problem-solving as technical skills; place them in soft_skills when supported by the resume.
- Do not classify project features, outcomes, or descriptions as technical skills. For example, "AI-assisted food image validation" is a project feature unless a specific AI tool, model, or technique is identified.
- Remove duplicate and near-duplicate skills.
- Keep every skill as a separate string in its appropriate array.
- Do not invent skills or infer expertise merely because a technology appears in a project.
- Include communication, teamwork, leadership, and similar soft skills only when supported by the resume.
- Deduplicate soft skills such as teamwork and team collaboration.
- Preserve relevant details in projects, certifications, education, and experience.
- Do not treat suggested or hypothetical qualifications as completed.
- Keep certifications empty when no completed certification is listed.
- Use an empty string or empty array when information is unavailable.
- Return a maximum of 6 core technical skills.
- Prioritize skills most relevant to the user's stated career goal.
- If no career goal is provided, prioritize core programming languages,
  fundamental computer science concepts, and major technologies used
  in the resume's projects.
- Do not prioritize development environments or minor tools over
  programming languages and core technical concepts.
- Avoid listing overlapping skills separately when one already
  adequately represents the other for assessment purposes.
- Never invent skills or claim proficiency that the resume does not support.

    RESUME TEXT:
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt + resume_text,
        config={
            "response_mime_type": "application/json",

        },
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    result = json.loads(response.text)

    expected_keys = {
        "name",
        "education",
        "technical_skills",
        "soft_skills",
        "projects",
        "certifications",
        "experience",
        "interests",
    }

    if not isinstance(result, dict):
        raise ValueError("Gemini returned an unexpected response format.")

    for key in expected_keys:
        if key not in result:
            result[key] = [] if key != "name" else ""

    result["name"] = str(result["name"] or "")

    for key in expected_keys - {"name"}:
        if not isinstance(result[key], list):
            result[key] = []

        result[key] = [
            str(item).strip()
            for item in result[key]
            if item is not None and str(item).strip()
        ]

    return result
