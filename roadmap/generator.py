from datetime import date


# Learning resources for commonly required career skills.
# Each skill contains a resource title, learning URL, and estimated hours.
RESOURCE_CATALOG = {
    "python": {
        "title": "Python Tutorial",
        "url": "https://docs.python.org/3/tutorial/",
        "hours": 6,
    },
    "sql": {
        "title": "SQL Tutorial",
        "url": "https://www.w3schools.com/sql/",
        "hours": 5,
    },
    "excel": {
        "title": "Excel Training",
        "url": "https://support.microsoft.com/excel",
        "hours": 4,
    },
    "power bi": {
        "title": "Power BI Learning",
        "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/",
        "hours": 6,
    },
    "tableau": {
        "title": "Tableau Training",
        "url": "https://www.tableau.com/learn/training",
        "hours": 5,
    },
    "statistics": {
        "title": "Statistics Learning",
        "url": "https://www.khanacademy.org/math/statistics-probability",
        "hours": 5,
    },
    "data visualization": {
        "title": "Data Visualization Learning",
        "url": "https://www.kaggle.com/learn/data-visualization",
        "hours": 4,
    },
}


def generate_learning_roadmap(
    career,
    missing_skills,
    skills_to_improve=None,
    daily_study_minutes=60,
):
    """Generate an ordered learning roadmap based on a user's career skill gaps."""

    # Validate the career name before generating the roadmap.
    if not isinstance(career, str) or not career.strip():
        raise ValueError("career must be a non-empty string")

    # The missing skills input must be a list.
    if not isinstance(missing_skills, list):
        raise ValueError("missing_skills must be a list")

    # Daily study time must be a positive integer.
    if not isinstance(daily_study_minutes, int) or daily_study_minutes <= 0:
        raise ValueError("daily_study_minutes must be a positive integer")

    # Use an empty list when no improvement skills are provided.
    skills_to_improve = skills_to_improve or []

    if not isinstance(skills_to_improve, list):
        raise ValueError("skills_to_improve must be a list")

    # Add improvement skills first, followed by missing skills.
    # Normalize names and remove duplicates to avoid repeated topics.
    ordered_skills = []
    for skill in skills_to_improve + missing_skills:
        if isinstance(skill, str) and skill.strip():
            normalized = skill.strip().lower()
            if normalized not in ordered_skills:
                ordered_skills.append(normalized)

    # Build the roadmap topics and calculate the total learning time.
    topics = []
    total_hours = 0

    for index, skill in enumerate(ordered_skills, start=1):

        # Use a known learning resource when available.
        # Otherwise, provide a Google search link for the skill.
        resource = RESOURCE_CATALOG.get(
            skill,
            {
                "title": f"Search learning resources for {skill.title()}",
                "url": (
                    "https://www.google.com/search?q="
                    + skill.replace(" ", "+")
                    + "+tutorial"
                ),
                "hours": 4,
            },
        )

        # Add the estimated time required for this topic.
        hours = resource["hours"]
        total_hours += hours

        # Add the topic with its resource, prerequisite, and initial status.
        topics.append({
            "topic_id": index,
            "skill": skill.title(),
            "title": resource["title"],
            "resource_url": resource["url"],
            "estimated_hours": hours,
            "prerequisites": (
                [topics[-1]["skill"]] if topics else []
            ),
            "status": "Pending",
        })

    # Convert total learning hours into minutes.
    total_minutes = total_hours * 60

    # Calculate the estimated number of study days.
    # Round up when the total time is not evenly divisible.
    estimated_days = (
        total_minutes + daily_study_minutes - 1
    ) // daily_study_minutes

    # Return the complete roadmap response.
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