import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.recommendation import (
    recommend_careers,
    extract_interests
)


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


resume_text = """ARUN KUMAR
Email: arun.kumar@example.com
TECHNICAL SKILLS
Python, Java, JavaScript, HTML, CSS, SQL, Git, GitHub, REST APIs
INTERESTS
Artificial Intelligence, Web Development, Data Analysis, Learning New Technologies"""


interests = extract_interests(resume_text)

print("\n========== EXTRACTED INTERESTS ==========\n")
print(interests)


recommendations = recommend_careers(
    technical_skills,
    interests,
    top_n=5
)


print("\n========== CAREER RECOMMENDATIONS ==========\n")

for recommendation in recommendations:
    print(recommendation)