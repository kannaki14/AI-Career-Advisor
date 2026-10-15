import sys
from pathlib import Path

# Add the project root to Python's import path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from resume_parser.parser import extract_resume_text


file_path = project_root / "tests" / "sample_resume.pdf"

text = extract_resume_text(file_path)

print("\n========== EXTRACTED RESUME TEXT ==========\n")
print(text)
print("\n============================================\n")