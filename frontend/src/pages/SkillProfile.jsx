import React from 'react';

function SkillProfile() {
  const technicalSkills = [
    { name: 'Python', level: 85 },
    { name: 'JavaScript', level: 75 },
    { name: 'React', level: 70 },
    { name: 'SQL', level: 65 },
    { name: 'Git & GitHub', level: 80 },
  ];

  const softSkills = [
    'Communication',
    'Problem Solving',
    'Teamwork',
    'Time Management',
  ];

  return (
    <div className="skill-profile-page">

      {/* Page Header */}
      <div className="skill-profile-header">
        <div className="skill-profile-header-icon">♙</div>

        <div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2rem)' }}>
            My Skill Profile
          </h2>

          <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>
            View your current skills and complete a short assessment
            to help us understand your strengths.
          </p>
        </div>
      </div>

      {/* Skill Summary */}
      <div className="skill-summary-grid">

        <div className="skill-summary-card">
          <div className="skill-summary-icon">⌘</div>

          <div>
            <strong style={{ fontSize: '1.5rem' }}>5</strong>
            <span style={{ fontSize: '0.95rem' }}>
              Technical Skills
            </span>
          </div>
        </div>

        <div className="skill-summary-card">
          <div className="skill-summary-icon">✦</div>

          <div>
            <strong style={{ fontSize: '1.5rem' }}>4</strong>
            <span style={{ fontSize: '0.95rem' }}>
              Soft Skills
            </span>
          </div>
        </div>

        <div className="skill-summary-card">
          <div className="skill-summary-icon">✓</div>

          <div>
            <strong style={{ fontSize: '1.5rem' }}>1</strong>
            <span style={{ fontSize: '0.95rem' }}>
              Skill Assessment
            </span>
          </div>
        </div>

      </div>

      {/* Main Skills */}
      <div className="skill-content-grid">

        {/* Technical Skills */}
        <div className="skill-card">

          <div className="skill-card-title">
            <div className="skill-card-icon">⌘</div>

            <div>
              <h3 style={{ fontSize: '1.2rem' }}>
                Technical Skills
              </h3>

              <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                Your current technical skills and proficiency levels.
              </p>
            </div>
          </div>

          <div className="technical-skills-list">

            {technicalSkills.map((skill) => (
              <div
                className="technical-skill"
                key={skill.name}
              >

                <div className="skill-name-row">
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {skill.name}
                  </span>

                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    {skill.level}%
                  </span>
                </div>

                <div className="skill-progress-background">
                  <div
                    className="skill-progress"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>

              </div>
            ))}

          </div>

          <button
            className="secondary-blue-button"
            style={{ fontSize: '0.95rem' }}
          >
            View All Skills →
          </button>

        </div>

        {/* Soft Skills */}
        <div className="skill-card">

          <div className="skill-card-title">
            <div className="skill-card-icon">✦</div>

            <div>
              <h3 style={{ fontSize: '1.2rem' }}>
                Soft Skills
              </h3>

              <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                Your interpersonal and professional skills.
              </p>
            </div>
          </div>

          <div className="soft-skills-list">

            {softSkills.map((skill) => (
              <span
                className="soft-skill-tag"
                key={skill}
                style={{ fontSize: '0.9rem' }}
              >
                ✓ {skill}
              </span>
            ))}

          </div>

        </div>

      </div>

      {/* Skill Assessment */}
      <div className="assessment-card">

        <div className="assessment-icon">✓</div>

        <div className="assessment-content">

          <div className="assessment-title-row">

            <h3 style={{ fontSize: '1.2rem' }}>
              Skill Assessment
            </h3>

            <span
              className="assessment-badge"
              style={{ fontSize: '0.85rem' }}
            >
              Short Assessment
            </span>

          </div>

          <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>
            Take a short assessment based on the skills identified
            from your resume. Your answers will help us understand
            your current skill level more accurately.
          </p>

          <div className="assessment-info">

            <div>
              <strong style={{ fontSize: '1.2rem' }}>
                5–10
              </strong>

              <span style={{ fontSize: '0.9rem' }}>
                Questions
              </span>
            </div>

            <div>
              <strong style={{ fontSize: '1.2rem' }}>
                Skills
              </strong>

              <span style={{ fontSize: '0.9rem' }}>
                Based on your profile
              </span>
            </div>

            <div>
              <strong style={{ fontSize: '1.2rem' }}>
                Quick
              </strong>

              <span style={{ fontSize: '0.9rem' }}>
                Easy to complete
              </span>
            </div>

          </div>

          <button
            className="primary-blue-button"
            style={{ fontSize: '1rem' }}
          >
            Start Skill Assessment →
          </button>

        </div>

      </div>

      {/* Next Step */}
      <div className="next-step-card">

        <div className="next-step-icon">→</div>

        <div className="next-step-content">

          <span
            className="next-step-label"
            style={{ fontSize: '0.8rem' }}
          >
            NEXT STEP
          </span>

          <h3 style={{ fontSize: '1.2rem' }}>
            Explore Career Recommendations
          </h3>

          <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>
            After reviewing your skills and completing the assessment,
            explore career paths that match your profile.
          </p>

        </div>

        <button
          className="next-step-button"
          style={{ fontSize: '0.95rem' }}
        >
          Career Paths →
        </button>

      </div>

    </div>
  );
}

export default SkillProfile;