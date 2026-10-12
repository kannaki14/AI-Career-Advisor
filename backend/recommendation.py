import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
CAREERS_FILE = BASE_DIR / "data" / "careers.json"


def load_careers():
    with open(CAREERS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def calculate_skill_match(user_skills, required_skills):
    user_skills = {
        skill.strip().lower()
        for skill in user_skills
    }

    required_skills = {
        skill.strip().lower()
        for skill in required_skills
    }

    matched_skills = user_skills.intersection(required_skills)
    missing_skills = required_skills.difference(user_skills)

    if required_skills:
        match_percentage = (
            len(matched_skills) / len(required_skills)
        ) * 100
    else:
        match_percentage = 0

    return {
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "match_percentage": round(match_percentage, 2)
    }


def analyze_skill_gap(user_skills, required_skills):
    skill_result = calculate_skill_match(
        user_skills,
        required_skills
    )

    matched_skills = skill_result["matched_skills"]
    missing_skills = skill_result["missing_skills"]

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skills_to_improve": missing_skills.copy(),
        "match_percentage": skill_result["match_percentage"]
    }


def get_skills_to_improve(user_skills, required_skills):
    skill_gap = analyze_skill_gap(
        user_skills,
        required_skills
    )

    return skill_gap["missing_skills"]


def calculate_interest_match(user_interests, career_interests):
    user_interests = {
        interest.strip().lower()
        for interest in user_interests
    }

    career_interests = {
        interest.strip().lower()
        for interest in career_interests
    }

    matched_interests = user_interests.intersection(
        career_interests
    )

    if career_interests:
        interest_percentage = (
            len(matched_interests) / len(career_interests)
        ) * 100
    else:
        interest_percentage = 0

    return {
        "matched_interests": sorted(matched_interests),
        "interest_percentage": round(interest_percentage, 2)
    }


def extract_interests(resume_text):
    if not resume_text:
        return []

    match = re.search(
        r"\bINTERESTS\b\s*:?\s*(.*?)(?=\n\s*(?:SKILLS|EDUCATION|EXPERIENCE|PROJECTS|CERTIFICATIONS|TECHNICAL SKILLS)\s*:?\s*(?:\n|$)|$)",
        resume_text,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return []

    interests_section = match.group(1).strip()

    interests = re.split(r"[,;\n]", interests_section)

    return [
        interest.strip(" \t-•")
        for interest in interests
        if interest.strip(" \t-•")
    ]


def recommend_careers(user_skills, user_interests=None, top_n=5):
    if user_interests is None:
        user_interests = []

    careers = load_careers()
    recommendations = []

    for career in careers:
        # Calculate skill match
        skill_result = calculate_skill_match(
            user_skills,
            career["required_skills"]
        )

        # Calculate interest match
        interest_result = calculate_interest_match(
            user_interests,
            career.get("related_interests", [])
        )

        # Combine skill and interest scores
        final_score = (
            skill_result["match_percentage"] * 0.7
            + interest_result["interest_percentage"] * 0.3
        )

        recommendations.append({
            "career": career["career"],
            "category": career["category"],
            "match_percentage": round(final_score, 2),
            "matched_skills": skill_result["matched_skills"],
            "missing_skills": skill_result["missing_skills"],
            "skills_to_improve": skill_result["missing_skills"].copy()
        })

    # Sort careers from highest to lowest match
    recommendations.sort(
        key=lambda career: career["match_percentage"],
        reverse=True
    )

    # Return the recommendations
    return {
        "recommendations": recommendations[:top_n]
    }