import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
CAREERS_FILE = BASE_DIR / "data" / "careers.json"


INTERESTS = {
    1: ["Web Development", "Technology", "Design", "Programming", "Building Websites"],
    2: ["Programming", "Backend Systems", "Technology", "Problem Solving", "Databases"],
    3: ["Web Development", "Programming", "Technology", "Building Applications", "Problem Solving"],
    4: ["Data Analysis", "Statistics", "Business", "Problem Solving", "Technology"],
    5: ["Data Science", "Statistics", "Artificial Intelligence", "Research", "Problem Solving"],
    6: ["Machine Learning", "Artificial Intelligence", "Programming", "Research", "Technology"],
    7: ["Artificial Intelligence", "Machine Learning", "Generative AI", "Programming", "Innovation"],
    8: ["Cybersecurity", "Ethical Hacking", "Network Security", "Technology", "Problem Solving"],
    9: ["Cloud Computing", "Technology", "Infrastructure", "Networking", "Automation"],
    10: ["Cloud Computing", "Automation", "Infrastructure", "Software Development", "Technology"],
    11: ["User Experience", "Visual Design", "Technology", "Creativity", "Design"],
    12: ["Mobile Technology", "App Development", "Programming", "Technology", "Design"],
    13: ["Software Development", "Programming", "Technology", "Problem Solving", "Algorithms"],
    14: ["Databases", "Technology", "Data Management", "System Administration", "Problem Solving"],
    15: ["Databases", "Data Management", "Programming", "Data Modeling", "Technology"],
    16: ["Business", "Problem Solving", "Data Analysis", "Technology", "Process Improvement"],
    17: ["Business Intelligence", "Data Analysis", "Business", "Data Visualization", "Technology"],
    18: ["Big Data", "Data Engineering", "Programming", "Cloud Computing", "Technology"],
    19: ["Artificial Intelligence", "Natural Language", "Machine Learning", "Programming", "Linguistics"],
    20: ["Artificial Intelligence", "Computer Vision", "Image Processing", "Robotics", "Programming"],
    21: ["Cybersecurity", "Cloud Security", "Network Security", "Technology", "Risk Management"],
    22: ["Computer Networks", "Networking", "Infrastructure", "Cybersecurity", "Technology"],
    23: ["System Administration", "Linux", "Networking", "Infrastructure", "Technology"],
    24: ["Cloud Architecture", "Technology", "System Design", "Infrastructure", "Problem Solving"],
    25: ["Product Development", "Business", "Technology", "User Experience", "Strategy"],
    26: ["Project Management", "Leadership", "Planning", "Teamwork", "Business"],
    27: ["Operations", "Leadership", "Process Improvement", "Business", "Problem Solving"],
    28: ["Business Strategy", "Problem Solving", "Consulting", "Research", "Business"],
    29: ["Marketing", "Advertising", "Branding", "Digital Media", "Creativity"],
    30: ["Sales", "Business", "Leadership", "Customer Relationships", "Negotiation"],
    31: ["Human Resources", "People Management", "Recruitment", "Employee Development", "Communication"],
    32: ["Recruitment", "Talent Acquisition", "Human Resources", "Networking", "Communication"],
    33: ["Digital Marketing", "Social Media", "Advertising", "Content Creation", "Analytics"],
    34: ["Market Research", "Consumer Behavior", "Statistics", "Data Analysis", "Business"],
    35: ["Accounting", "Finance", "Numbers", "Business", "Financial Management"],
    36: ["Finance", "Financial Analysis", "Investing", "Business", "Numbers"],
    37: ["Investing", "Financial Markets", "Finance", "Research", "Business"],
    38: ["Banking", "Finance", "Customer Service", "Business", "Financial Products"],
    39: ["Finance", "Risk Analysis", "Banking", "Numbers", "Research"],
    40: ["Taxation", "Accounting", "Finance", "Business", "Regulations"],
    41: ["Auditing", "Accounting", "Finance", "Risk Management", "Compliance"],
    42: ["Risk Management", "Finance", "Statistics", "Data Analysis", "Business"],
    43: ["Financial Planning", "Investing", "Personal Finance", "Finance", "Helping People"],
    44: ["Insurance", "Risk Management", "Finance", "Statistics", "Data Analysis"],
    45: ["Graphic Design", "Art", "Creativity", "Visual Communication", "Branding"],
    46: ["User Research", "Psychology", "Design", "Human Behavior", "Technology"],
    47: ["Product Design", "UX Design", "Creativity", "Technology", "Visual Design"],
    48: ["Drawing", "Art", "Illustration", "Creativity", "Visual Storytelling"],
    49: ["Animation", "Art", "Storytelling", "Character Design", "Creativity"],
    50: ["3D Art", "Animation", "Digital Art", "Game Design", "Creativity"],
    51: ["Art Direction", "Creative Leadership", "Branding", "Visual Design", "Art"],
    52: ["Fashion", "Clothing Design", "Creativity", "Textiles", "Art"],
    53: ["Interior Design", "Architecture", "Creativity", "Space Planning", "Visual Design"],
    54: ["Photography", "Art", "Visual Storytelling", "Creativity", "Travel"],
    55: ["Video Editing", "Film", "Storytelling", "Motion Graphics", "Creativity"],
    56: ["Film Production", "Storytelling", "Media", "Leadership", "Event Production"],
    57: ["Content Creation", "Social Media", "Video", "Photography", "Storytelling"],
    58: ["Writing", "Advertising", "Creativity", "Storytelling", "Communication"],
    59: ["Journalism", "News", "Research", "Writing", "Current Affairs"],
    60: ["Writing", "Content Creation", "Research", "Digital Media", "Communication"],
    61: ["Technology", "Writing", "Documentation", "Research", "Communication"],
    62: ["Writing", "Editing", "Language", "Books", "Communication"],
    63: ["Social Media", "Content Creation", "Marketing", "Communication", "Digital Media"],
    64: ["Public Relations", "Media", "Communication", "Networking", "Event Management"],
    65: ["Communication", "Writing", "Public Speaking", "Media", "Content Creation"],
    66: ["Broadcasting", "Film", "Media Production", "Storytelling", "Audio"],
    67: ["Teaching", "Education", "Children", "Learning", "Communication"],
    68: ["Teaching", "Higher Education", "Research", "Academic Studies", "Communication"],
    69: ["Teaching", "Education", "Student Support", "Learning", "Communication"],
    70: ["Education", "E-Learning", "Technology", "Instructional Design", "Teaching"],
    71: ["Counseling", "Education", "Psychology", "Helping People", "Career Development"],
    72: ["Research", "Academia", "Statistics", "Science", "Writing"],
    73: ["Research", "Academia", "Data Analysis", "Science", "Learning"],
    74: ["Education", "Curriculum Design", "Teaching", "Learning", "Research"],
    75: ["Biology", "Science", "Research", "Nature", "Laboratory Work"],
    76: ["Chemistry", "Science", "Laboratory Work", "Research", "Experimentation"],
    77: ["Physics", "Science", "Mathematics", "Research", "Technology"],
    78: ["Environment", "Climate", "Nature", "Science", "Sustainability"],
    79: ["Microbiology", "Biology", "Laboratory Research", "Science", "Healthcare"],
    80: ["Laboratory Work", "Science", "Research", "Quality Control", "Experimentation"],
    81: ["Scientific Research", "Science", "Experimentation", "Academia", "Discovery"],
    82: ["Statistics", "Mathematics", "Data Science", "Research", "Data Analysis"],
    83: ["Healthcare", "Laboratory Science", "Medicine", "Biology", "Diagnostics"],
    84: ["Healthcare", "Medical Imaging", "Technology", "Patient Care", "Anatomy"],
    85: ["Healthcare", "Fitness", "Rehabilitation", "Human Anatomy", "Helping People"],
    86: ["Nutrition", "Health", "Food Science", "Wellness", "Helping People"],
    87: ["Healthcare Management", "Healthcare", "Administration", "Leadership", "Operations"],
    88: ["Clinical Research", "Medicine", "Healthcare", "Research", "Science"],
    89: ["Pharmacy", "Medicine", "Healthcare", "Chemistry", "Helping People"],
    90: ["Public Health", "Healthcare", "Community Health", "Epidemiology", "Research"],
    91: ["Law", "Legal Research", "Writing", "Organization", "Government"],
    92: ["Law", "Legal Research", "Critical Thinking", "Writing", "Justice"],
    93: ["Compliance", "Law", "Regulations", "Risk Management", "Business"],
    94: ["Public Policy", "Government", "Research", "Data Analysis", "Social Issues"],
    95: ["Government", "Public Service", "Administration", "Policy", "Community Development"],
    96: ["Government", "Public Service", "Administration", "Organization", "Community"],
    97: ["Mechanical Engineering", "Machines", "Design", "Manufacturing", "Technology"],
    98: ["Civil Engineering", "Construction", "Infrastructure", "Architecture", "Problem Solving"],
    99: ["Electrical Engineering", "Electronics", "Power Systems", "Technology", "Problem Solving"],
    100: ["Electronics", "Technology", "Embedded Systems", "Robotics", "Circuit Design"],
    101: ["Chemical Engineering", "Chemistry", "Manufacturing", "Process Design", "Science"],
    102: ["Industrial Engineering", "Manufacturing", "Process Improvement", "Operations", "Optimization"],
    103: ["Manufacturing", "Engineering", "Production", "CAD Design", "Process Improvement"],
    104: ["Robotics", "Artificial Intelligence", "Programming", "Automation", "Engineering"],
    105: ["Automobiles", "Mechanical Engineering", "Vehicle Technology", "Design", "Manufacturing"],
    106: ["Agriculture", "Crop Science", "Research", "Technology", "Environment"],
    107: ["Agriculture", "Farming", "Plants", "Soil Science", "Research"],
    108: ["Environment", "Sustainability", "Climate", "Consulting", "Conservation"],
    109: ["Forests", "Nature", "Environmental Conservation", "Wildlife", "Outdoor Work"],
    110: ["Food Science", "Food Technology", "Cooking", "Product Development", "Science"],
    111: ["Hospitality", "Hotels", "Travel", "Customer Service", "Leadership"],
    112: ["Events", "Event Planning", "Entertainment", "Marketing", "People Management"],
    113: ["Travel", "Tourism", "Geography", "Customer Service", "Planning"],
    114: ["Tourism", "Travel", "Hospitality", "Marketing", "Event Management"],
    115: ["Cooking", "Food", "Creativity", "Hospitality", "Culinary Arts"],
    116: ["Restaurants", "Hospitality", "Customer Service", "Leadership", "Food"],
    117: ["Retail", "Sales", "Customer Service", "Fashion", "Business"],
    118: ["E-Commerce", "Digital Marketing", "Online Business", "Technology", "Analytics"],
    119: ["Retail", "Fashion", "Product Trends", "Visual Design", "Business"],
    120: ["Customer Relationships", "Communication", "Problem Solving", "Technology", "Helping People"],
    121: ["Customer Service", "Communication", "Problem Solving", "Technology", "Helping People"],
    122: ["Software Testing", "Quality Assurance", "Technology", "Problem Solving", "Software Development"],
    123: ["Test Automation", "Software Testing", "Programming", "Technology", "Quality Assurance"]
}


with open(CAREERS_FILE, "r", encoding="utf-8") as file:
    careers = json.load(file)


for career in careers:
    career_id = career["id"]

    if career_id not in INTERESTS:
        raise ValueError(f"Missing interests for career ID: {career_id}")

    career["related_interests"] = INTERESTS[career_id]


with open(CAREERS_FILE, "w", encoding="utf-8") as file:
    json.dump(careers, file, indent=2, ensure_ascii=False)


print(f"Updated {len(careers)} careers with related interests.")