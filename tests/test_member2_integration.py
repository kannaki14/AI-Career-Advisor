import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.recommendation import (
    recommend_careers,
    extract_interests
)


# Simulated output from Member 2 resume parser
resume_result = {
    "name": "ARUN KUMAR",
    "technical_skills": [
        "Python",
        "Java",
        "JavaScript",
        "HTML",
        "CSS",
        "SQL",
        "Git",
        "GitHub",
        "REST APIs"
    ],
    "soft_skills": [
        "Communication",
        "Teamwork",
        "Problem Solving",
        "Time Management",
        "Adaptability"
    ],
    "projects": [
        "AI Career Advisor",
        "Student Management System"
    ],
    "certifications": [
        "Python Programming Fundamentals - Online Certification",
        "Introduction to SQL - Online Certification"
    ],
    "resume_text": """ARUN KUMAR
TECHNICAL SKILLS
Python, Java, JavaScript, HTML, CSS, SQL, Git, GitHub, REST APIs

INTERESTS
Artificial Intelligence, Web Development, Data Analysis, Learning New Technologies"""
}


# Get skills from Member 2 output
technical_skills = resume_result["technical_skills"]

# Extract interests from Member 2 resume text
interests = extract_interests(
    resume_result["resume_text"]
)


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