
import json
import re
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent.parent
CAREERS_FILE = BASE_DIR / "data" / "careers.json"


def load_careers():
    with open(CAREERS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def normalize_skill(skill):
    """Normalize skill names and common aliases."""
    normalized = skill.strip().lower()

    aliases = {
        "microsoft excel": "excel",
        "ms excel": "excel",
        "js": "javascript",
        "nodejs": "node.js",
        "rest api": "rest apis",
        "restful api": "rest apis",
    }

    return aliases.get(normalized, normalized)


def calculate_skill_match(user_skills, required_skills):
    user_skills = {
        normalize_skill(skill)
        for skill in (user_skills or [])
        if isinstance(skill, str) and skill.strip()
    }

    required_skills = {
        normalize_skill(skill)
        for skill in (required_skills or [])
        if isinstance(skill, str) and skill.strip()
    }

    matched_skills = user_skills.intersection(required_skills)
    missing_skills = required_skills.difference(user_skills)

    match_percentage = (
        (len(matched_skills) / len(required_skills)) * 100
        if required_skills else 0
    )

    return {
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "match_percentage": round(match_percentage, 2),
    }


def analyze_skill_gap(user_skills, required_skills):
    result = calculate_skill_match(user_skills, required_skills)
    missing = result["missing_skills"]

    return {
        "matched_skills": result["matched_skills"],
        "missing_skills": missing,
        "skills_to_improve": missing.copy(),
        "match_percentage": result["match_percentage"],
    }


def get_skills_to_improve(user_skills, required_skills):
    return analyze_skill_gap(user_skills, required_skills)["missing_skills"]


def calculate_interest_match(user_interests, career_interests):
    user_interests = {
        item.strip().lower()
        for item in (user_interests or [])
        if isinstance(item, str) and item.strip()
    }

    career_interests = {
        item.strip().lower()
        for item in (career_interests or [])
        if isinstance(item, str) and item.strip()
    }

    matched = user_interests.intersection(career_interests)

    percentage = (
        (len(matched) / len(career_interests)) * 100
        if career_interests else 0
    )

    return {
        "matched_interests": sorted(matched),
        "interest_percentage": round(percentage, 2),
    }


def extract_interests(resume_text):
    if not resume_text:
        return []

    match = re.search(
        r"\bINTERESTS\b\s*:?\s*(.*?)(?=\n\s*(?:SKILLS|EDUCATION|EXPERIENCE|PROJECTS|CERTIFICATIONS|TECHNICAL SKILLS)\s*:?\s*(?:\n|$)|$)",
        resume_text,
        re.IGNORECASE | re.DOTALL,
    )

    if not match:
        return []

    section = match.group(1).strip()
    interests = re.split(r"[,;\n]", section)

    return [
        item.strip(" \t-•")
        for item in interests
        if item.strip(" \t-•")
    ]


def _career_document(career):
    """Build a text document describing one career for TF-IDF."""
    return " ".join([
        career["career"],
        career["category"],
        " ".join(career.get("required_skills", [])),
        " ".join(career.get("related_interests", [])),
    ])


def calculate_similarity_scores(user_skills, user_interests, careers):
    """
    Compare the user's profile with career documents using TF-IDF
    vectors and cosine similarity.

    Returns similarity scores on a 0-100 scale.
    """
    profile_text = " ".join(
        (user_skills or []) + (user_interests or [])
    ).strip()

    if not profile_text or not careers:
        return {career["id"]: 0.0 for career in careers}

    career_documents = [_career_document(career) for career in careers]

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        stop_words="english",
    )

    career_vectors = vectorizer.fit_transform(career_documents)
    profile_vector = vectorizer.transform([profile_text])

    similarities = cosine_similarity(profile_vector, career_vectors)[0]

    return {
        career["id"]: round(float(score) * 100, 2)
        for career, score in zip(careers, similarities)
    }


def recommend_careers(user_skills, user_interests=None, top_n=5):
    if (
        not isinstance(top_n, int)
        or isinstance(top_n, bool)
        or top_n < 1
    ):
        raise ValueError("top_n must be a positive integer")

    if user_skills is None:
        user_skills = []

    if user_interests is None:
        user_interests = []

    # Keep only valid text values.
    user_skills = [
        skill for skill in user_skills
        if isinstance(skill, str) and skill.strip()
    ]

    user_interests = [
        interest for interest in user_interests
        if isinstance(interest, str) and interest.strip()
    ]

    careers = load_careers()

    # Preserve the existing TF-IDF similarity functionality.
    similarity_scores = calculate_similarity_scores(
        user_skills,
        user_interests,
        careers,
    )

    recommendations = []

    for career in careers:
        skill_result = calculate_skill_match(
            user_skills,
            career.get("required_skills", []),
        )

        interest_result = calculate_interest_match(
            user_interests,
            career.get("related_interests", []),
        )

        # Preserve the existing 70% skill + 30% interest score.
        original_score = (
            skill_result["match_percentage"] * 0.7
            + interest_result["interest_percentage"] * 0.3
        )

        similarity_score = similarity_scores.get(career["id"], 0.0)

        recommendations.append({
            "career": career["career"],
            "category": career["category"],
            "match_percentage": round(original_score, 2),
            "matched_skills": skill_result["matched_skills"],
            "missing_skills": skill_result["missing_skills"],
            "skills_to_improve": skill_result["missing_skills"].copy(),
            "similarity_score": similarity_score,
        })

    # Rank by the existing match score, then use TF-IDF to break ties.
    recommendations.sort(
        key=lambda item: (
            item["match_percentage"],
            item["similarity_score"],
        ),
        reverse=True,
    )

    return {"recommendations": recommendations[:top_n]}
