import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStorageItem } from '../utils/sessionUser';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  GraduationCap,
  Sparkles,
  Target,
  Upload,
  UserRound,
} from 'lucide-react';

function SkillProfile() {
  const navigate = useNavigate();

  const [skillProfile, setSkillProfile] = useState(null);

  useEffect(() => {
    const savedProfile = getUserStorageItem('skillProfile');

    if (savedProfile) {
      try {
        setSkillProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Failed to load skill profile:', error);
      }
    }
  }, []);

  const technicalSkills = skillProfile?.technical_skills || [];
const softSkills = skillProfile?.soft_skills || [];
const education = skillProfile?.education || [];
const projects = skillProfile?.projects || [];
const certifications = skillProfile?.certifications || [];
  const technicalSkillCount = technicalSkills.length;
  const softSkillCount = softSkills.length;

  const candidateName = skillProfile?.name || 'Your Profile';

  return (
    <div className="page-container">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-primary)',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={18} />
            AI-Powered Skill Analysis
          </div>

          <h1>Skill Profile</h1>

          <p>
            Review the skills identified from your resume and prepare for your
            personalized career assessment.
          </p>
        </div>
      </div>

      {/* Profile Welcome */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          background:
            'linear-gradient(135deg, var(--color-primary-soft), #ffffff)',
          border: '1px solid var(--color-border-focus)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UserRound size={26} />
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
              }}
            >
              Resume analyzed for
            </p>

            <h2
              style={{
                margin: '0.2rem 0 0',
              }}
            >
              {candidateName}
            </h2>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="dashboard-grid"
        style={{
          marginBottom: '1.5rem',
        }}
      >
        {/* Technical Skills */}
        <div
          className="card"
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Technical Skills
              </p>

              <div
                style={{
                  fontSize: '2.25rem',
                  fontWeight: '800',
                  color: 'var(--color-primary)',
                  marginTop: '0.3rem',
                }}
              >
                {technicalSkillCount}
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                }}
              >
                Skills identified
              </p>
            </div>

            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Code2 size={23} />
            </div>
          </div>
        </div>

        {/* Soft Skills */}
        <div
          className="card"
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Soft Skills
              </p>

              <div
                style={{
                  fontSize: '2.25rem',
                  fontWeight: '800',
                  color: 'var(--color-primary)',
                  marginTop: '0.3rem',
                }}
              >
                {softSkillCount}
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                }}
              >
                Personal strengths
              </p>
            </div>

            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Brain size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
          }}
        >
          <div
            className="card-header"
            style={{
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={21} />
              </div>

              <div>
                <h2>Education</h2>
                <p>Education information identified from your resume.</p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            {education.map((item, index) => (
              <div
                key={`${item}-${index}`}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid var(--color-border)',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Projects */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2>Projects</h2>
          <p>Projects identified from your uploaded resume.</p>
        </div>

        {projects.length > 0 ? (
          <ul>
            {projects.map((project, index) => (
              <li key={`${project}-${index}`}>{project}</li>
            ))}
          </ul>
        ) : (
          <p>No projects have been identified yet.</p>
        )}
      </div>

      {/* Certifications */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2>Certifications</h2>
          <p>Certifications identified from your uploaded resume.</p>
        </div>

        {certifications.length > 0 ? (
          <ul>
            {certifications.map((certification, index) => (
              <li key={`${certification}-${index}`}>
                {certification}
              </li>
            ))}
          </ul>
        ) : (
          <p>No certifications have been identified yet.</p>
        )}
      </div>


      {/* Technical Skills */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
        }}
      >
        <div
          className="card-header"
          style={{
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Code2 size={21} />
            </div>

            <div>
              <h2>Technical Skills</h2>
              <p>
                Technical skills identified from your uploaded resume.
              </p>
            </div>
          </div>
        </div>

        {technicalSkills.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {technicalSkills.map((skill, index) => (
              <div
                key={`${skill}-${index}`}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    fontWeight: '600',
                    color: 'var(--color-text)',
                  }}
                >
                  {skill}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '12px',
            }}
          >
            <p style={{ marginBottom: '1rem' }}>
              No technical skills have been identified yet.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/resume-upload')}
            >
              <Upload size={17} />
              Upload Resume
            </button>
          </div>
        )}
      </div>

      {/* Soft Skills */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
        }}
      >
        <div
          className="card-header"
          style={{
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Brain size={21} />
            </div>

            <div>
              <h2>Soft Skills</h2>
              <p>
                Personal and professional skills identified from your resume.
              </p>
            </div>
          </div>
        </div>

        {softSkills.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.7rem',
            }}
          >
            {softSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '999px',
                  background: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-border-focus)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                <CheckCircle2 size={15} />
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '12px',
            }}
          >
            <p>No soft skills have been identified yet.</p>
          </div>
        )}
      </div>

      {/* Assessment CTA */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          background:
            'linear-gradient(135deg, var(--color-primary-soft), #ffffff)',
          border: '1px solid var(--color-border-focus)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              flex: 1,
              minWidth: '240px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Target size={23} />
            </div>

            <div>
              <h2>Ready for your skill assessment?</h2>

              <p style={{ marginTop: '0.4rem' }}>
                Take a short assessment to verify your technical knowledge.
                Your results can later support career recommendations and
                skill-gap analysis.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/skill-assessment')}
          >
            Start Assessment
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Career Recommendation CTA */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: '240px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '0.4rem',
              }}
            >
              <Sparkles
                size={19}
                color="var(--color-primary)"
              />

              <h2>Career Recommendations</h2>
            </div>

            <p>
              Explore career paths that match your detected skills and
              assessment results.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/career-recommendations')}
          >
            Explore Careers
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkillProfile;