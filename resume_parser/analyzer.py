import os
import json
from google import genai



def extract_name(resume_text):
    """
    Extract the candidate's name from the resume text.
    """

    lines = resume_text.strip().split("\n")

    if not lines:
        return "Unknown"

    for line in lines:
        line = line.strip()

        if line:
            return line

    return "Unknown"


def extract_education(resume_text):
    """
    Extract the education section from the resume.
    """

    lines = resume_text.splitlines()

    education = []
    inside_education = False

    section_headers = [
        "CAREER OBJECTIVE",
        "TECHNICAL SKILLS",
        "SOFT SKILLS",
        "PROJECTS",
        "CERTIFICATIONS",
        "INTERESTS"
    ]

    for line in lines:
        line = line.strip()

        if line == "EDUCATION":
            inside_education = True
            continue

        if inside_education and line in section_headers:
            break

        if inside_education and line:
            education.append(line)

    return education


def extract_technical_skills(resume_text):
    """
    Extract technical skills from the resume.
    """

    lines = resume_text.splitlines()

    technical_skills = []
    inside_skills = False

    section_headers = [
        "CAREER OBJECTIVE",
        "EDUCATION",
        "SOFT SKILLS",
        "PROJECTS",
        "CERTIFICATIONS",
        "INTERESTS"
    ]

    for line in lines:
        line = line.strip()

        if line == "TECHNICAL SKILLS":
            inside_skills = True
            continue

        if inside_skills and line in section_headers:
            break

        if inside_skills and line:
            skills = line.split(",")

            for skill in skills:
                skill = skill.strip()

                if skill:
                    technical_skills.append(skill)

    return technical_skills


def extract_soft_skills(resume_text):
    """
    Extract soft skills from the resume.
    """

    lines = resume_text.splitlines()

    soft_skills = []
    inside_skills = False

    section_headers = [
        "CAREER OBJECTIVE",
        "EDUCATION",
        "TECHNICAL SKILLS",
        "PROJECTS",
        "CERTIFICATIONS",
        "INTERESTS"
    ]

    for line in lines:
        line = line.strip()

        if line == "SOFT SKILLS":
            inside_skills = True
            continue

        if inside_skills and line in section_headers:
            break

        if inside_skills and line:
            skills = line.split(",")

            for skill in skills:
                skill = skill.strip()

                if skill:
                    soft_skills.append(skill)

    return soft_skills


def extract_projects(resume_text):
    """
    Extract the projects section from the resume.
    """

    lines = resume_text.splitlines()

    projects = []
    inside_projects = False

    section_headers = [
        "CAREER OBJECTIVE",
        "EDUCATION",
        "TECHNICAL SKILLS",
        "SOFT SKILLS",
        "CERTIFICATIONS",
        "INTERESTS"
    ]

    for line in lines:
        line = line.strip()

        if line == "PROJECTS":
            inside_projects = True
            continue

        if inside_projects and line in section_headers:
            break

        if inside_projects and line:
            projects.append(line)

    return projects


def extract_certifications(resume_text):
    """
    Extract the certifications section from the resume.
    """

    lines = resume_text.splitlines()

    certifications = []
    inside_certifications = False

    section_headers = [
        "CAREER OBJECTIVE",
        "EDUCATION",
        "TECHNICAL SKILLS",
        "SOFT SKILLS",
        "PROJECTS",
        "INTERESTS"
    ]

    for line in lines:
        line = line.strip()

        if line == "CERTIFICATIONS":
            inside_certifications = True
            continue

        if inside_certifications and line in section_headers:
            break

        if inside_certifications and line:
            certifications.append(line)

    return certifications


def analyze_resume_text(resume_text):
    """
    Analyze the extracted resume text.
    """

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")


    return {
        "name": extract_name(resume_text),
        "education": extract_education(resume_text),
        "technical_skills": extract_technical_skills(resume_text),
        "soft_skills": extract_soft_skills(resume_text),
        "projects": extract_projects(resume_text),
        "certifications": extract_certifications(resume_text),
        "resume_text": resume_text.strip()
    }


def create_skill_profile(analysis_result):
    """
    Create a skill profile from the analyzed resume.
    """

    skill_profile = {
        "name": analysis_result["name"],
        "education": analysis_result["education"],
        "technical_skills": analysis_result["technical_skills"],
        "soft_skills": analysis_result["soft_skills"],
        "projects": analysis_result["projects"],
        "certifications": analysis_result["certifications"]
    }

    return skill_profile
def analyze_resume_with_llm(resume_text):
    """
    Analyze resume text using Gemini LLM.
    """

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY")
    )

    prompt = f"""
You are an AI resume analysis system.

Analyze the following resume and extract the information below:

1. Candidate name
2. Education
3. Technical skills
4. Soft skills
5. Projects
6. Certifications

Return ONLY valid JSON in exactly this format:

{{
    "name": "Candidate name",
    "education": [],
    "technical_skills": [],
    "soft_skills": [],
    "projects": [],
    "certifications": []
}}

Rules:
- Do not invent information that is not present in the resume.
- Keep technical skills separate from soft skills.
- Include all clearly mentioned projects.
- Include all clearly mentioned certifications.
- Return empty lists when information is not available.

Resume:
{resume_text}
"""

    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=prompt
    )

    return json.loads(response.text)
