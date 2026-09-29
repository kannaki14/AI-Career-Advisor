import pymupdf
from docx import Document
from pathlib import Path


def extract_text_from_pdf(file_path):
    """Extract text from a PDF resume."""

    document = pymupdf.open(file_path)
    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    text = text.strip()

    if not text:
        raise ValueError("The PDF does not contain readable text.")

    return text


def extract_text_from_docx(file_path):
    """Extract text from a DOCX resume."""

    document = Document(file_path)

    text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text.strip())

    extracted_text = "\n".join(text).strip()

    if not extracted_text:
        raise ValueError("The DOCX file does not contain readable text.")

    return extracted_text


def extract_resume_text(file_path):
    """
    Extract text from a PDF or DOCX resume.
    """

    file_path = Path(file_path)

    # Check whether the file exists
    if not file_path.exists():
        raise FileNotFoundError(
            f"Resume file not found: {file_path}"
        )

    # Check whether the file is empty
    if file_path.stat().st_size == 0:
        raise ValueError(
            "The uploaded resume file is empty."
        )

    # Get file extension
    extension = file_path.suffix.lower()

    # PDF
    if extension == ".pdf":
        return extract_text_from_pdf(file_path)

    # DOCX
    elif extension == ".docx":
        return extract_text_from_docx(file_path)

    # Unsupported file
    else:
        raise ValueError(
            "Unsupported file format. "
            "Only PDF and DOCX files are supported."
        )