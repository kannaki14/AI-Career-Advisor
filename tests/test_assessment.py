import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from backend.assessment import generate_assessment_questions


skill_profile = {
    "technical_skills": [
        "Python",
        "SQL",
        "Java"
    ]
}

questions = generate_assessment_questions(skill_profile)

print("\n========== ASSESSMENT QUESTIONS ==========\n")
print(questions)

print("\n===========================================\n")