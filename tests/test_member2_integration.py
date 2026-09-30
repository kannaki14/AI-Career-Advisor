import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.recommendation import recommend_careers


technical_skills = [
    "Python",
    "Java",
    "JavaScript",
    "HTML",
    "CSS",
    "SQL",
    "Git",
    "GitHub",
    "REST APIs"
]

interests = [
    "Artificial Intelligence",
    "Web Development",
    "Data Analysis",
    "Learning New Technologies"
]


recommendations = recommend_careers(
    technical_skills,
    interests,
    top_n=5
)


print("\n========== CAREER RECOMMENDATIONS ==========\n")

for recommendation in recommendations:
    print(recommendation)