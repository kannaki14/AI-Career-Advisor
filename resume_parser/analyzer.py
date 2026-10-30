
import re


# Common resume section headings.
SECTION_ALIASES = {
    "OBJECTIVE": {
        "OBJECTIVE",
        "CAREER OBJECTIVE",
        "CAREER SUMMARY",
        "SUMMARY",
        "PROFILE",
        "PROFESSIONAL SUMMARY",
        "ABOUT ME",
        "ABOUT",
    },
    "EDUCATION": {
        "EDUCATION",
        "EDUCATIONAL QUALIFICATIONS",
        "ACADEMIC QUALIFICATIONS",
        "EDUCATIONAL BACKGROUND",
    },
    "TECHNICAL SKILLS": {
        "TECHNICAL SKILLS",
        "TECHNICAL SKILL",
        "TECHNOLOGY SKILLS",
        "TECHNOLOGIES",
        "PROGRAMMING SKILLS",
        "IT SKILLS",
        "COMPUTER SKILLS",
        "SKILLS",
    },
    "SOFT SKILLS": {
        "SOFT SKILLS",
        "PERSONAL SKILLS",
        "INTERPERSONAL SKILLS",
    },
    "PROJECTS": {
        "PROJECTS",
        "PROJECT",
        "ACADEMIC PROJECTS",
        "PERSONAL PROJECTS",
        "KEY PROJECTS",
    },
    "CERTIFICATIONS": {
        "CERTIFICATIONS",
        "CERTIFICATION",
        "CERTIFICATES",
        "LICENSES AND CERTIFICATIONS",
        "COURSES AND CERTIFICATIONS",
    },
    "ACHIEVEMENTS": {
        "ACHIEVEMENTS",
        "ACADEMIC ACHIEVEMENTS",
        "ACCOMPLISHMENTS",
        "AWARDS",
        "HONORS",
    },
    "EXPERIENCE": {
        "EXPERIENCE",
        "WORK EXPERIENCE",
        "PROFESSIONAL EXPERIENCE",
        "INTERNSHIPS",
        "INTERNSHIP",
        "EMPLOYMENT HISTORY",
    },
    "INTERESTS": {
        "INTERESTS",
        "AREAS OF INTEREST",
        "HOBBIES",
    },
    "OTHER": {
        "PERSONAL DETAILS",
        "CONTACT DETAILS",
        "LANGUAGES",
        "PUBLICATIONS",
        "RESPONSIBILITIES",
        "DECLARATION",
        "REFERENCES",
        "VOLUNTEER EXPERIENCE",
        "VOLUNTEERING",
    },
}

# Map normalized headings to their canonical section name.
HEADER_LOOKUP = {
    alias: section
    for section, aliases in SECTION_ALIASES.items()
    for alias in aliases
}

# A controlled vocabulary helps recognize skills mentioned in prose.
# Add terms here as your project needs to support more technologies.
KNOWN_TECHNICAL_SKILLS = {
    "python": "Python",
    "java": "Java",
    "c": "C",
    "c++": "C++",
    "c#": "C#",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "html": "HTML",
    "css": "CSS",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "excel": "Excel",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "scikit-learn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "data analysis": "Data Analysis",
    "data visualization": "Data Visualization",
    "git": "Git",
    "github": "GitHub",
    "linux": "Linux",
    "react": "React",
    "node.js": "Node.js",
    "express.js": "Express.js",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "rest api": "REST API",
    "rest apis": "REST API",
    "docker": "Docker",
    "aws": "AWS",
    "azure": "Azure",
    "google cloud": "Google Cloud",
    "problem solving": "Problem Solving",
    "communication": "Communication",
    "teamwork": "Teamwork",
    "leadership": "Leadership",
    "time management": "Time Management",
    "critical thinking": "Critical Thinking",
}

# Soft-skill entries in KNOWN_TECHNICAL_SKILLS must not appear in mentioned_skills.
SOFT_SKILL_KEYS = {
    "problem solving",
    "communication",
    "teamwork",
    "leadership",
    "time management",
    "critical thinking",
}

# Prose and list sections where technical skills may be mentioned in running text.
PROSE_SKILL_SECTIONS = {
    "PREAMBLE",
    "OBJECTIVE",
    "TECHNICAL SKILLS",
    "EXPERIENCE",
    "PROJECTS",
    "ACHIEVEMENTS",
    "CERTIFICATIONS",
    "EDUCATION",
}


def clean_text(text):
    """Normalize common PDF bullet characters and whitespace."""
    text = text or ""
    text = (
        text.replace("\ufeff", "")
        .replace("\u00a0", " ")
        .replace("\u2022", "\n")
        .replace("\u25cf", "\n")
        .replace("\u25aa", "\n")
        .replace("\u2023", "\n")
        .replace("\u00b7", "\n")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
    )

    cleaned_lines = []
    for line in text.splitlines():
        line = re.sub(r"[ \t]+", " ", line).strip()
        if line:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


def normalize_heading(line):
    """Normalize a possible section heading for comparison."""
    line = line.strip().upper()
    line = re.sub(r"^[\W_]+|[\W_]+$", "", line)
    line = re.sub(r"\s+", " ", line)
    return line.strip()


def detect_section_heading(line):
    """
    Return the canonical section name if the line is a known heading.
    Also supports headings such as 'EDUCATION:'.
    """
    normalized = normalize_heading(line)

    if normalized in HEADER_LOOKUP:
        return HEADER_LOOKUP[normalized]

    return None


def extract_sections(resume_text):
    """
    Split resume text into recognized sections.

    Text before the first recognized heading is stored under PREAMBLE.
    Repeated sections are combined.
    """
    text = clean_text(resume_text)
    sections = {"PREAMBLE": []}
    current_section = "PREAMBLE"

    for line in text.splitlines():
        heading = detect_section_heading(line)

        if heading:
            current_section = heading
            sections.setdefault(current_section, [])
            continue

        sections.setdefault(current_section, []).append(line)

    return {
        name: "\n".join(lines).strip()
        for name, lines in sections.items()
        if lines
    }


def extract_name(resume_text):
    """
    Extract a likely candidate name from the beginning of the resume.

    This is a heuristic, not guaranteed name recognition.
    """
    text = clean_text(resume_text)
    lines = text.splitlines()

    excluded_prefixes = (
        "phone:",
        "mobile:",
        "email:",
        "linkedin:",
        "github:",
        "address:",
        "location:",
        "portfolio:",
    )

    for line in lines[:8]:
        candidate = line.strip()
        lowered = candidate.lower()

        if not candidate:
            continue

        if detect_section_heading(candidate):
            continue

        if lowered.startswith(excluded_prefixes):
            continue

        if "@" in candidate or "://" in candidate:
            continue

        if re.search(r"\d{5,}", candidate):
            continue

        if len(candidate) > 60:
            continue

        if re.search(r"[.!?]", candidate):
            continue

        return candidate

    return "Unknown"


def get_section_text(resume_text, section_name):
    """Return text belonging to a recognized section."""
    sections = extract_sections(resume_text)

    # Combine related canonical sections when necessary.
    if section_name == "TECHNICAL SKILLS":
        names = ("TECHNICAL SKILLS",)
    elif section_name == "SOFT SKILLS":
        names = ("SOFT SKILLS",)
    elif section_name == "EDUCATION":
        names = ("EDUCATION",)
    elif section_name == "PROJECTS":
        names = ("PROJECTS",)
    elif section_name == "CERTIFICATIONS":
        names = ("CERTIFICATIONS",)
    elif section_name == "OBJECTIVE":
        names = ("OBJECTIVE",)
    elif section_name == "ACHIEVEMENTS":
        names = ("ACHIEVEMENTS",)
    else:
        names = (section_name,)

    return "\n".join(
        sections[name]
        for name in names
        if name in sections
    ).strip()


def extract_education(resume_text):
    """Extract education details from the education section."""
    text = get_section_text(resume_text, "EDUCATION")
    return text.splitlines() if text else []


def split_list_items(text):
    """
    Split skill lists on commas, semicolons, bullets, or line breaks.
    Preserve colons inside a value until category labels are handled.
    """
    text = re.sub(r"[•●▪‣·]", "\n", text)
    items = []

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue

        for item in re.split(r"[,;|]", line):
            item = item.strip().strip("-* \t")
            if item:
                items.append(item)

    return items


def remove_category_prefix(item):
    """
    Convert 'Programming Languages: C, Java' into individual values.
    A category-only line returns an empty string.
    """
    if ":" in item:
        prefix, remainder = item.split(":", 1)

        category_labels = {
            "programming languages",
            "programming language",
            "languages",
            "tools",
            "technologies",
            "technical skills",
            "databases",
            "frameworks",
            "libraries",
            "web technologies",
            "operating systems",
            "software",
            "platforms",
        }

        if prefix.strip().lower() in category_labels:
            return remainder.strip()

    return item.strip()


def extract_skills_from_section(text, allowed_skills=None):
    """
    Extract and clean skills from a skill section.

    If allowed_skills is supplied, keep only vocabulary entries
    that match a known skill.
    """
    found = []

    for raw_item in split_list_items(text):
        # Split category-labelled lists such as 'Programming Languages: C, Java'.
        raw_item = remove_category_prefix(raw_item)

        if not raw_item:
            continue

        # Remove any leftover category labels before processing.
        parts = [raw_item]

        if ":" in raw_item:
            prefix, remainder = raw_item.split(":", 1)
            if len(prefix) <= 40 and remainder.strip():
                parts = split_list_items(remainder)

        for part in parts:
            item = part.strip().strip("-* \t")
            if not item:
                continue

            if len(item) > 60:
                continue

            if any(mark in item for mark in ".!?"):
                continue

            lowered = item.casefold()

            # Reject obvious narrative and academic achievement text.
            if any(
                phrase in lowered
                for phrase in (
                    "cgpa",
                    "gpa",
                    "secured",
                    "academic achievement",
                    "consistently performed",
                    "seeking an",
                    "motivated",
                    "responsible for",
                    "successfully completed",
                )
            ):
                continue

            if allowed_skills is not None:
                normalized = re.sub(r"\s+", " ", lowered).strip()
                canonical = allowed_skills.get(normalized)

                if canonical:
                    found.append(canonical)
                    continue

                # A category or unsupported phrase should not be
                # presented as a confirmed technical skill.
                continue

            found.append(item)

    return deduplicate(found)


def deduplicate(items):
    """Remove duplicate strings, ignoring capitalization."""
    result = []
    seen = set()

    for item in items:
        key = item.casefold().strip()
        if key and key not in seen:
            seen.add(key)
            result.append(item.strip())

    return result


def extract_technical_skills(resume_text):
    """
    Extract technical skills explicitly listed in the technical skills section.
    """
    section_text = get_section_text(resume_text, "TECHNICAL SKILLS")

    if not section_text:
        return []

    return extract_skills_from_section(
        section_text,
        allowed_skills=KNOWN_TECHNICAL_SKILLS,
    )


def extract_soft_skills(resume_text):
    """
    Extract soft skills listed in the soft skills section.
    """
    section_text = get_section_text(resume_text, "SOFT SKILLS")

    if not section_text:
        return []

    # Keep free-text entries in this section, but reject long sentences.
    return extract_skills_from_section(section_text)


def extract_projects(resume_text):
    """Extract project entries from the projects section."""
    text = get_section_text(resume_text, "PROJECTS")

    if not text:
        return []

    return [
        line.strip().strip("-*• ")
        for line in text.splitlines()
        if line.strip().strip("-*• ")
    ]


def extract_certifications(resume_text):
    """Extract certification entries from the certifications section."""
    text = get_section_text(resume_text, "CERTIFICATIONS")

    if not text:
        return []

    return [
        line.strip().strip("-*• ")
        for line in text.splitlines()
        if line.strip().strip("-*• ")
    ]


def extract_technical_skills_from_prose(resume_text):
    """
    Find known technical skills mentioned in prose and skill sections.

    Includes OBJECTIVE/SUMMARY/PROFILE text and TECHNICAL SKILLS lists.
    Soft skills are excluded. Duplicates are removed in first-seen order.
    """
    sections = extract_sections(resume_text)
    # Walk sections in document order so first-seen order matches the resume.
    prose = "\n".join(
        text
        for name, text in sections.items()
        if name in PROSE_SKILL_SECTIONS and text
    ).casefold()

    technical_vocab = {
        skill: display_name
        for skill, display_name in KNOWN_TECHNICAL_SKILLS.items()
        if skill not in SOFT_SKILL_KEYS
    }

    occupied = []
    matches = []

    # Prefer longer names so 'C++' is not also counted as 'C'.
    for skill in sorted(technical_vocab, key=len, reverse=True):
        # Word boundaries prevent matching 'C' inside words like 'CGPA'.
        pattern = r"(?<!\w)" + re.escape(skill) + r"(?!\w)"

        for match in re.finditer(pattern, prose):
            start, end = match.span()
            if any(start < occ_end and end > occ_start for occ_start, occ_end in occupied):
                continue
            occupied.append((start, end))
            matches.append((start, technical_vocab[skill]))

    matches.sort(key=lambda item: item[0])
    return deduplicate([name for _, name in matches])

def analyze_resume_text(resume_text):
    cleaned_text = clean_text(resume_text)

    return {
        "name": extract_name(cleaned_text),
        "education": extract_education(cleaned_text),
        "technical_skills": extract_technical_skills(cleaned_text),
        "mentioned_skills": extract_technical_skills_from_prose(cleaned_text),
        "soft_skills": extract_soft_skills(cleaned_text),
        "projects": extract_projects(cleaned_text),
        "certifications": extract_certifications(cleaned_text),
        "resume_text": cleaned_text,
    }


def create_skill_profile(analysis_result):
    """Create a skill profile using the established field names."""
    return {
        "name": analysis_result.get("name", "Unknown"),
        "education": analysis_result.get("education", []),
        "technical_skills": analysis_result.get("technical_skills", []),
        "soft_skills": analysis_result.get("soft_skills", []),
        "projects": analysis_result.get("projects", []),
        "certifications": analysis_result.get("certifications", []),
        "mentioned_skills": analysis_result.get("mentioned_skills", []),
    }
