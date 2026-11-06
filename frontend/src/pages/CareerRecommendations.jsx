
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  LoaderCircle,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';

import {
  API_BASE,
  asRecommendationList,
  getLoggedInUserId,
  getUserStorageItem,
  setUserStorageItem,
} from '../utils/sessionUser';

const RECOMMENDATIONS_STORAGE_KEY = 'careerRecommendations';
const SELECTED_CAREER_KEY = 'selectedCareer';

function CareerRecommendations() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSavedData = async () => {
      // Load the logged-in user's skill profile.
      try {
        const savedProfile = getUserStorageItem('skillProfile');

        if (!savedProfile) {
          if (isMounted) {
            setError('Please upload your resume before exploring careers.');
          }
        } else {
          const parsedProfile = JSON.parse(savedProfile);

          if (isMounted) {
            setProfile(parsedProfile);
          }
        }
      } catch {
        if (isMounted) {
          setError(
            'Unable to read your saved skill profile. Please upload your resume again.'
          );
        }
      }

      const userId = getLoggedInUserId();

      if (!userId) {
        if (isMounted) {
          setError('Please log in again to access your career recommendations.');
        }
        return;
      }

      // Load this user's recommendations from the backend.
      try {
        const response = await fetch(
          `${API_BASE}/recommendations/${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch saved recommendations.');
        }

        const data = await response.json();
        const saved = asRecommendationList(data);

        if (!isMounted) return;

        setRecommendations(saved);

        setUserStorageItem(
          RECOMMENDATIONS_STORAGE_KEY,
          JSON.stringify(saved)
        );
      } catch {
        // Use this user's local cache if the backend is unavailable.
        try {
          const savedRecommendations = getUserStorageItem(
            RECOMMENDATIONS_STORAGE_KEY
          );

          if (savedRecommendations && isMounted) {
            const parsed = JSON.parse(savedRecommendations);

            if (Array.isArray(parsed)) {
              setRecommendations(parsed);
            }
          }
        } catch {
          // Ignore corrupted recommendation cache.
        }
      }
    };

    loadSavedData();

    return () => {
      isMounted = false;
    };
  }, []);

  const exploreCareer = (career) => {
    if (
      !career ||
      typeof career.career !== 'string' ||
      !career.career.trim()
    ) {
      setError('That career recommendation is missing required details.');
      return;
    }

    const saved = setUserStorageItem(
      SELECTED_CAREER_KEY,
      JSON.stringify(career)
    );

    if (!saved) {
      setError('Please log in again before selecting a career.');
      return;
    }

    navigate('/explore-career', { state: { career } });
  };

  const technicalSkills = Array.isArray(profile?.technical_skills)
    ? profile.technical_skills.filter(
        (skill) => typeof skill === 'string' && skill.trim()
      )
    : [];

  const getRecommendations = async () => {
    setError('');
    setRecommendations([]);

    const userId = getLoggedInUserId();

    if (!userId) {
      setError('Please log in again before requesting recommendations.');
      return;
    }

    if (!profile) {
      setError('Please upload and analyze your resume first.');
      return;
    }

    if (technicalSkills.length === 0) {
      setError(
        'No technical skills were found. Please upload a resume containing your skills.'
      );
      return;
    }

    setLoading(true);

    try {
      // Generate recommendations using resume skills only.
      const requestBody = {
        user_id: userId,
        technical_skills: technicalSkills,
        resume_text: '',
        top_n: 5,
      };

      const response = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Recommendation request failed (${response.status}).`
        );
      }

      if (!Array.isArray(data.recommendations)) {
        throw new Error(
          'The recommendation API returned an unexpected response.'
        );
      }

      setRecommendations(data.recommendations);

      const saved = setUserStorageItem(
        RECOMMENDATIONS_STORAGE_KEY,
        JSON.stringify(data.recommendations)
      );

      if (!saved) {
        throw new Error(
          'Recommendations were generated, but could not be saved. Please log in again.'
        );
      }
    } catch (err) {
      setError(
        err.message ||
          'Unable to connect to the recommendation API. Check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/skill-profile')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={17} />
          Back to Skill Profile
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--color-primary)',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          <BriefcaseBusiness size={20} />
          Personalized Career Guidance
        </div>

        <h1>Career Recommendations</h1>

        <p>
          Discover career paths based on your resume skills and identify
          the skills you can improve for each career.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>
          Your technical skills
        </h2>

        <p style={{ color: 'var(--color-text-muted)' }}>
          These skills were extracted from your uploaded resume.
        </p>

        {technicalSkills.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}
          >
            {technicalSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                style={{
                  padding: '0.55rem 0.8rem',
                  borderRadius: '999px',
                  background: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p>No technical skills available yet.</p>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={getRecommendations}
          disabled={loading || !profile || technicalSkills.length === 0}
          style={{ marginTop: '1.5rem' }}
        >
          {loading ? (
            <>
              <LoaderCircle size={17} />
              Finding careers...
            </>
          ) : (
            <>
              <RefreshCw size={17} />
              {recommendations.length > 0
                ? 'Refresh Recommendations'
                : 'Find My Careers'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '1rem',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#b91c1c',
            borderRadius: '10px',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ margin: 0 }}>{error}</p>

          {error.toLowerCase().includes('upload') && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/resume-upload')}
              style={{ display: 'flex', marginTop: '0.75rem' }}
            >
              Upload Resume
            </button>
          )}
        </div>
      )}

      {recommendations.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2>Recommended careers for you</h2>

            <p style={{ color: 'var(--color-text-muted)' }}>
              Compare each career's match score and the skills you may need
              to develop.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {recommendations.map((career, index) => {
              const matchedSkills = Array.isArray(career.matched_skills)
                ? career.matched_skills
                : [];

              const missingSkills = Array.isArray(career.missing_skills)
                ? career.missing_skills
                : [];

              const skillsToImprove = Array.isArray(career.skills_to_improve)
                ? career.skills_to_improve
                : missingSkills;

              const parsedMatch = Number(career.match_percentage);

              const match = Number.isFinite(parsedMatch)
                ? Math.max(0, Math.min(100, parsedMatch))
                : 0;

              return (
                <article
                  key={`${career.career || 'career'}-${index}`}
                  className="card"
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: 'var(--color-primary)',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          marginBottom: '0.4rem',
                        }}
                      >
                        {career.category || 'Career'}
                      </p>

                      <h2>{career.career || 'Recommended Career'}</h2>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '110px' }}>
                      <div
                        style={{
                          fontSize: '1.8rem',
                          fontWeight: '800',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {match.toFixed(1)}%
                      </div>

                      <p style={{ fontSize: '0.85rem', margin: 0 }}>
                        Match score
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      height: '8px',
                      background: 'var(--color-border)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      margin: '1rem 0 1.25rem',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${match}%`,
                        background: 'var(--color-primary)',
                        borderRadius: '999px',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '1rem',
                        background: '#f0fdf4',
                        borderRadius: '10px',
                      }}
                    >
                      <h3
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <CheckCircle2 size={18} />
                        Matched skills ({matchedSkills.length})
                      </h3>

                      {matchedSkills.length > 0 ? (
                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                          {matchedSkills.map((skill, skillIndex) => (
                            <li
                              key={`${skill}-${skillIndex}`}
                              style={{ marginBottom: '0.35rem' }}
                            >
                              {skill}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: 0 }}>
                          No matching skills identified yet.
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '1rem',
                        background: '#fff7ed',
                        borderRadius: '10px',
                      }}
                    >
                      <h3
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <Target size={18} />
                        Skills to develop ({skillsToImprove.length})
                      </h3>

                      {skillsToImprove.length > 0 ? (
                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                          {skillsToImprove.map((skill, skillIndex) => (
                            <li
                              key={`${skill}-${skillIndex}`}
                              style={{ marginBottom: '0.35rem' }}
                            >
                              {skill}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: 0 }}>
                          No skill gaps identified for this career.
                        </p>
                      )}
                    </div>
                  </div>

                  {missingSkills.length > 0 && (
                    <p
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                        marginTop: '1rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <TrendingUp size={18} style={{ flexShrink: 0 }} />
                      Focus on the missing skills above to strengthen your fit
                      for this career.
                    </p>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => exploreCareer(career)}
                    style={{ marginTop: '1.25rem' }}
                  >
                    <Compass size={17} />
                    Explore Career
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <BriefcaseBusiness
            size={36}
            color="var(--color-primary)"
            style={{ margin: '0 auto 0.75rem' }}
          />

          <h2>Ready to explore your career options?</h2>

          <p style={{ color: 'var(--color-text-muted)' }}>
            Click Find My Careers to discover suitable career paths based
            on your skills.
          </p>
        </div>
      )}
    </div>
  );
}

export default CareerRecommendations;
