
def analyze_learning_progress(roadmap):
    topics = roadmap.get("topics", [])

    struggling_skills = []
    next_actions = []

    for topic in topics:
        skill = topic.get("skill", "Unknown skill")
        status = topic.get("status", "Pending")

        if status == "Failed":
            struggling_skills.append(skill)
            next_actions.append({
                "skill": skill,
                "reason": "Topic marked as Failed",
                "recommendation": (
                    f"Review the basics of {skill}, use the learning "
                    "resource again, and complete extra practice exercises."
                ),
                "action": "Repeat topic with additional practice",
            })

        elif status == "In Progress":
            next_actions.append({
                "skill": skill,
                "reason": "Topic is still in progress",
                "recommendation": (
                    f"Continue learning {skill} and complete a practice "
                    "exercise before marking it Completed."
                ),
                "action": "Continue learning",
            })

    completed_count = sum(
        topic.get("status") == "Completed" for topic in topics
    )

    progress = (
        round(completed_count / len(topics) * 100)
        if topics else 0
    )

    return {
        "overall_progress_percentage": progress,
        "completed_topics": completed_count,
        "total_topics": len(topics),
        "struggling_skills": struggling_skills,
        "next_actions": next_actions,
    }
