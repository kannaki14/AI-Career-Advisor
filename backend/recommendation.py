
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


def calculate_skill_match(user_skills, required_skills):
    user_skills = {skill.strip().lower() for skill in user_skills}
    required_skills = {skill.strip().lower() for skill in required_skills}

    matched_skills = user_skills.intersection(required_skills)
    missing_skills = required_skills.difference(user_skills)

    match_percentage = (
        (len(matched_skills) / len(required_skills)) * 100
        if required_skills else 0
    )

    return {
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "match_percentage": round(match_percentage, 2)
    }


def analyze_skill_gap(user_skills, required_skills):
    result = calculate_skill_match(user_skills, required_skills)
    missing = result["missing_skills"]

    return {
        "matched_skills": result["matched_skills"],
        "missing_skills": missing,
        "skills_to_improve": missing.copy(),
        "match_percentage": result["match_percentage"]
    }


def get_skills_to_improve(user_skills, required_skills):
    return analyze_skill_gap(user_skills, required_skills)["missing_skills"]


def calculate_interest_match(user_interests, career_interests):
    user_interests = {item.strip().lower() for item in user_interests}
    career_interests = {item.strip().lower() for item in career_interests}

    matched = user_interests.intersection(career_interests)

    percentage = (
        (len(matched) / len(career_interests)) * 100
        if career_interests else 0
    )

    return {
        "matched_interests": sorted(matched),
        "interest_percentage": round(percentage, 2)
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

    section = match.group(1).strip()
    interests = re.split(r"[,;\n]", section)

    return [
        item.strip(" \t-\u2022")
        for item in interests
        if item.strip(" \t-\u2022")
    ]


def _career_document(career):
    """Build a text document describing one career for TF-IDF."""
    return " ".join([
        career["career"],
        career["category"],
        " ".join(career.get("required_skills", [])),
        " ".join(career.get("related_interests", []))
    ])


def calculate_similarity_scores(user_skills, user_interests, careers):
    """
    Compare the user's profile with career documents using TF-IDF
    vectors and cosine similarity.

    Returns similarity scores on a 0–100 scale.
    """
    profile_text = " ".join(user_skills + user_interests).strip()

    if not profile_text:
        return {career["id"]: 0.0 for career in careers}

    career_documents = [_career_document(career) for career in careers]

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        stop_words="english"
    )

    # Fit TF-IDF to the career descriptions and transform the user profile.
    career_vectors = vectorizer.fit_transform(career_documents)
    profile_vector = vectorizer.transform([profile_text])

    similarities = cosine_similarity(profile_vector, career_vectors)[0]

    return {
        career["id"]: round(float(score) * 100, 2)
        for career, score in zip(careers, similarities)
    }


def recommend_careers(user_skills, user_interests=None, top_n=5):
    if user_interests is None:
        user_interests = []

    careers = load_careers()

    # New NLP similarity score.
    similarity_scores = calculate_similarity_scores(
        user_skills,
        user_interests,
        careers
    )

    recommendations = []

    for career in careers:
        skill_result = calculate_skill_match(
            user_skills,
            career["required_skills"]
        )

        interest_result = calculate_interest_match(
            user_interests,
            career.get("related_interests", [])
        )

        # Preserve the original score for compatibility with existing tests
        # and the frontend, while adding the ML/NLP score separately.
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
            "similarity_score": similarity_score
        })

    # Rank by the original score first, then use NLP similarity to break ties.
    recommendations.sort(
        key=lambda item: (
            item["match_percentage"],
            item["similarity_score"]
        ),
        reverse=True
    )

    return {"recommendations": recommendations[:top_n]}
