from backend.recommendation import calculate_skill_match


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

from backend.recommendation import recommend_careers


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

    assert len(results) == 5
    assert results[0]["career"] == "Data Analyst"
    assert results[0]["match_percentage"] == 58.0

from backend.recommendation import analyze_skill_gap


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