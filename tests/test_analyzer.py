import sys
from pathlib import Path

# Add the project root to Python's import path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from resume_parser.parser import extract_resume_text
from resume_parser.analyzer import analyze_resume_text
from resume_parser.analyzer import analyze_resume_text, create_skill_profile


# Read the sample resume
file_path = project_root / "tests" / "sample_resume.pdf"

resume_text = extract_resume_text(file_path)

# Analyze the extracted text
result = analyze_resume_text(resume_text)

print("\n========== RESUME ANALYSIS ==========\n")
print(result)

print("\n=====================================\n")
skill_profile = create_skill_profile(result)

print("\n========== SKILL PROFILE ==========\n")
print(skill_profile)

print("\n===================================\n")
print("\n========== SKILL PROFILE CHECK ==========\n")

required_fields = [
    "education",
    "technical_skills",
    "soft_skills",
    "projects",
    "certifications"
]

for field in required_fields:
    if field in skill_profile:
        print(f"{field}: OK")
    else:
        print(f"{field}: MISSING")

print("\n=========================================\n")