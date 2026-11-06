
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  LoaderCircle,
  Map,
  Target,
} from 'lucide-react';

import {
  API_BASE,
  getLoggedInUserId,
  getUserStorageItem,
  setUserStorageItem,
} from '../utils/sessionUser';

const SELECTED_CAREER_KEY = 'selectedCareer';
const ACTIVE_ROADMAP_KEY = 'activeRoadmap';

function asSkillList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((skill) => typeof skill === 'string' && skill.trim())
    .map((skill) => skill.trim());
}

function readSelectedCareer() {
  try {
    const raw = getUserStorageItem(SELECTED_CAREER_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item.msg === 'string') {
          return item.msg;
        }

        return '';
      })
      .filter(Boolean)
      .join(' ');
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  return fallback;
}

function ExploreCareer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [career, setCareer] = useState(null);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = getLoggedInUserId();

    if (!userId) {
      setCareer(null);
      setError('Please log in again to explore your selected career.');
      return;
    }

    const fromState =
      location.state?.career && typeof location.state.career === 'object'
        ? location.state.career
        : null;

    const stored = readSelectedCareer();
    const selected = fromState || stored;

    if (
      !selected ||
      typeof selected.career !== 'string' ||
      !selected.career.trim()
    ) {
      setCareer(null);
      setError(
        'No career was selected. Please return to Career Recommendations and choose a career to explore.'
      );
      return;
    }

    setCareer(selected);
    setError('');

    setUserStorageItem(
      SELECTED_CAREER_KEY,
      JSON.stringify(selected)
    );
  }, [location.state]);

  const matchedSkills = asSkillList(career?.matched_skills);
  const missingSkills = asSkillList(career?.missing_skills);

  const skillsToDevelop = asSkillList(
    career?.skills_to_improve?.length
      ? career.skills_to_improve
      : missingSkills
  );

  const parsedMatch = Number(career?.match_percentage);

  const match = Number.isFinite(parsedMatch)
    ? Math.max(0, Math.min(100, parsedMatch))
    : 0;

  const description =
    typeof career?.description === 'string' && career.description.trim()
      ? career.description.trim()
      : '';

  const generateRoadmap = async () => {
    setError('');

    const userId = getLoggedInUserId();

    if (!userId) {
      setError('Please log in again before generating a roadmap.');
      return;
    }

    if (!career?.career?.trim()) {
      setError(
        'A valid career selection is required before generating a roadmap.'
      );
      return;
    }

    const parsedMinutes = Number.parseInt(dailyStudyMinutes, 10);

    if (
      !Number.isInteger(parsedMinutes) ||
      parsedMinutes < 1 ||
      parsedMinutes > 1440
    ) {
      setError('Daily study minutes must be a number between 1 and 1440.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career: career.career.trim(),
          missing_skills: missingSkills,
          skills_to_improve: skillsToDevelop,
          daily_study_minutes: parsedMinutes,
          user_id: userId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Unable to generate a learning roadmap.')
        );
      }

      const returnedId = Number.parseInt(data?.roadmap_id, 10);
      const returnedRoadmap = data?.roadmap;

      if (!Number.isInteger(returnedId) || returnedId <= 0) {
        throw new Error('The roadmap API did not return a valid roadmap ID.');
      }

      if (!returnedRoadmap || typeof returnedRoadmap !== 'object') {
        throw new Error('The roadmap API returned an unexpected response.');
      }

      const payload = {
        roadmap_id: returnedId,
        roadmap: returnedRoadmap,
        career: career.career.trim(),
        generation_method:
          typeof data.generation_method === 'string'
            ? data.generation_method
            : '',
        selected_career: career,
        from_career_selection: true,
      };

      // Save roadmap and selected career for this logged-in user only.
      const roadmapSaved = setUserStorageItem(
        ACTIVE_ROADMAP_KEY,
        JSON.stringify(payload)
      );

      const careerSaved = setUserStorageItem(
        SELECTED_CAREER_KEY,
        JSON.stringify(career)
      );

      if (!roadmapSaved || !careerSaved) {
        throw new Error(
          'Roadmap generated, but local saving failed. Please log in again.'
        );
      }

      navigate('/learning-roadmap', { state: payload });
    } catch (err) {
      setError(
        err.message ||
          'Unable to connect to the roadmap API. Check that the backend is running.'
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
          onClick={() => navigate('/career-recommendations')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={17} />
          Back to Recommendations
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
          Explore Career
        </div>

        <h1>{career?.career || 'Career details'}</h1>

        <p>
          Review this career match, then generate a learning roadmap tailored
          to the skills you still need to develop.
        </p>
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

          {!career && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/career-recommendations')}
              style={{ display: 'flex', marginTop: '0.75rem' }}
            >
              Browse Career Recommendations
            </button>
          )}
        </div>
      )}

      {career && (
        <article className="card" style={{ marginBottom: '1.5rem' }}>
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

              <h2 style={{ marginBottom: description ? '0.75rem' : 0 }}>
                {career.career}
              </h2>

              {description && (
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  {description}
                </p>
              )}
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

              <p style={{ fontSize: '0.85rem', margin: 0 }}>Match score</p>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                  {matchedSkills.map((skill, index) => (
                    <li
                      key={`${skill}-${index}`}
                      style={{ marginBottom: '0.35rem' }}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0 }}>No matching skills identified yet.</p>
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
                Skills to develop ({skillsToDevelop.length})
              </h3>

              {skillsToDevelop.length > 0 ? (
                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  {skillsToDevelop.map((skill, index) => (
                    <li
                      key={`${skill}-${index}`}
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
        </article>
      )}

      {career && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Generate your roadmap</h2>

          <p style={{ color: 'var(--color-text-muted)' }}>
            Create a learning plan focused on this career and the skills listed
            above.
          </p>

          <label
            htmlFor="explore-daily-minutes"
            style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}
          >
            Daily study minutes
          </label>

          <input
            id="explore-daily-minutes"
            type="number"
            min="1"
            max="1440"
            value={dailyStudyMinutes}
            onChange={(event) => setDailyStudyMinutes(event.target.value)}
            style={{
              width: '100%',
              maxWidth: '240px',
              marginBottom: '1rem',
            }}
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={generateRoadmap}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={17} />
                Generating roadmap...
              </>
            ) : (
              <>
                <Map size={17} />
                Choose This Career & Generate Roadmap
              </>
            )}
          </button>

          {loading && (
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
              Building a personalized learning roadmap for {career.career}.
              This may take a moment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ExploreCareer;
