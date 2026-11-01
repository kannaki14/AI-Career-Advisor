
from backend.recommendation import (
    calculate_skill_match,
    recommend_careers,
    analyze_skill_gap,
    extract_interests
)


def test_skill_match():
    user_skills = ["Python", "SQL", "Excel"]
    required_skills = ["Python", "SQL", "Excel", "Power BI"]

    result = calculate_skill_match(
        user_skills,
        required_skills
    )

    assert result["matched_skills"] == [
        "excel",
        "python",
        "sql"
    ]

    assert result["missing_skills"] == [
        "power bi"
    ]

    assert result["match_percentage"] == 75.0


def test_career_recommendation():
    user_skills = [
        "Python",
        "SQL",
        "Excel",
        "Statistics"
    ]

    user_interests = [
        "Data Analysis",
        "Technology",
        "Problem Solving"
    ]

    results = recommend_careers(
        user_skills,
        user_interests,
        top_n=5
    )

    assert len(results["recommendations"]) == 5
    assert results["recommendations"][0]["career"] == "Data Analyst"
    assert results["recommendations"][0]["match_percentage"] == 58.0


def test_skill_gap_analysis():
    user_skills = ["Python", "SQL", "Excel"]
    required_skills = [
        "Python",
        "SQL",
        "Excel",
        "Power BI",
        "Statistics"
    ]

    result = analyze_skill_gap(
        user_skills,
        required_skills
    )

    assert result["matched_skills"] == [
        "excel",
        "python",
        "sql"
    ]

    assert result["missing_skills"] == [
        "power bi",
        "statistics"
    ]

    assert result["skills_to_improve"] == [
        "power bi",
        "statistics"
    ]

    assert result["match_percentage"] == 60.0


def test_extract_interests():
    resume_text = (
        "INTERESTS: Data Analysis, Machine Learning\n"
        "EDUCATION:\n"
        "B.Sc Computer Science"
    )

    result = extract_interests(resume_text)

    assert result == ["Data Analysis", "Machine Learning"]


def test_extract_interests_missing_section():
    resume_text = (
        "EDUCATION:\n"
        "B.Sc Computer Science"
    )

    result = extract_interests(resume_text)

    assert result == []