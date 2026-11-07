
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';

import {
  API_BASE,
  asRecommendationList,
  getLoggedInUserId,
  getUserStorageItem,
  setUserStorageItem,
} from '../utils/sessionUser';

const TOPIC_STATUSES = ['Pending', 'In Progress', 'Completed', 'Failed'];

const DEFAULT_CAREERS = [
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'Web Developer',
];

const RECOMMENDATION_STORAGE_KEYS = [
  'careerRecommendations',
  'career_recommendations',
  'recommendations',
  'savedRecommendations',
];

const ACTIVE_ROADMAP_KEY = 'activeRoadmap';
const SELECTED_CAREER_KEY = 'selectedCareer';

function readStoredJson(key) {
  try {
    const raw = getUserStorageItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function asSkillList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((skill) => typeof skill === 'string' && skill.trim())
    .map((skill) => skill.trim());
}

function readStoredRecommendations() {
  for (const key of RECOMMENDATION_STORAGE_KEYS) {
    const stored = readStoredJson(key);

    if (Array.isArray(stored)) return stored;

    if (stored && Array.isArray(stored.recommendations)) {
      return stored.recommendations;
    }
  }

  return [];
}

function findCareerRecommendation(recommendations, career) {
  if (!Array.isArray(recommendations) || !career) return null;

  const selected = career.trim().toLowerCase();

  return (
    recommendations.find(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.career === 'string' &&
        item.career.trim().toLowerCase() === selected
    ) || null
  );
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.msg === 'string') return item.msg;
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

function isSafeHttpUrl(value) {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function readInitialRoadmapPayload(locationState) {
  // Navigation state is trusted only for the current logged-in session.
  if (
    locationState &&
    typeof locationState === 'object' &&
    locationState.roadmap &&
    typeof locationState.roadmap === 'object'
  ) {
    return locationState;
  }

  const stored = readStoredJson(ACTIVE_ROADMAP_KEY);

  if (
    stored &&
    typeof stored === 'object' &&
    stored.roadmap &&
    typeof stored.roadmap === 'object'
  ) {
    return stored;
  }

  return null;
}

function LearningRoadmap() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = getLoggedInUserId();

  const initialPayload = userId
    ? readInitialRoadmapPayload(location.state)
    : null;

  const selectedCareerFromStorage = userId
    ? readStoredJson(SELECTED_CAREER_KEY)
    : null;

  const initialCareer =
    (typeof initialPayload?.career === 'string' &&
      initialPayload.career.trim()) ||
    (typeof selectedCareerFromStorage?.career === 'string' &&
      selectedCareerFromStorage.career.trim()) ||
    'Data Analyst';

  const [career, setCareer] = useState(initialCareer);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(60);
  const [skillProfile, setSkillProfile] = useState(null);
  const [savedRecommendations, setSavedRecommendations] = useState([]);

  const [roadmapId, setRoadmapId] = useState(() => {
    const parsed = Number.parseInt(initialPayload?.roadmap_id, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  });

  const [roadmap, setRoadmap] = useState(initialPayload?.roadmap || null);

  const [generationMethod, setGenerationMethod] = useState(
    typeof initialPayload?.generation_method === 'string'
      ? initialPayload.generation_method
      : ''
  );

  const [fromCareerSelection, setFromCareerSelection] = useState(
    Boolean(initialPayload?.from_career_selection || initialPayload?.roadmap)
  );

  const [showManualGenerator, setShowManualGenerator] = useState(
    !initialPayload?.roadmap
  );

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingTopicId, setUpdatingTopicId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('Please log in again to access your learning roadmap.');
      setSkillProfile(null);
      setSavedRecommendations([]);
      return;
    }

    // Load only the logged-in user's saved profile.
    setSkillProfile(readStoredJson('skillProfile'));

    // Load only the logged-in user's cached recommendations.
    setSavedRecommendations(readStoredRecommendations());

    let isMounted = true;

    const loadRecommendations = async () => {
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

        setSavedRecommendations(saved);

        setUserStorageItem(
          'careerRecommendations',
          JSON.stringify(saved)
        );
      } catch {
        // Keep this user's cached recommendations.
      }
    };

    loadRecommendations();

    const initialId = Number.parseInt(initialPayload?.roadmap_id, 10);

    if (Number.isInteger(initialId) && initialId > 0) {
      fetchProgress(initialId).catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load learning progress.');
        }
      });
    }

    return () => {
      isMounted = false;
    };

    // Initial data is loaded once for the current user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!location.state?.roadmap) return;

    const currentUserId = getLoggedInUserId();

    if (!currentUserId) {
      setError('Please log in again to access your learning roadmap.');
      return;
    }

    const payload = location.state;
    const returnedId = Number.parseInt(payload.roadmap_id, 10);

    const nextCareer =
      (typeof payload.career === 'string' && payload.career.trim()) ||
      career;

    setCareer(nextCareer);
    setRoadmap(payload.roadmap);

    setRoadmapId(
      Number.isInteger(returnedId) && returnedId > 0 ? returnedId : null
    );

    setGenerationMethod(
      typeof payload.generation_method === 'string'
        ? payload.generation_method
        : ''
    );

    setFromCareerSelection(Boolean(payload.from_career_selection));
    setShowManualGenerator(false);
    setError('');

    if (Number.isInteger(returnedId) && returnedId > 0) {
      fetchProgress(returnedId).catch((err) => {
        setError(err.message || 'Unable to load learning progress.');
      });
    }

    // Only re-hydrate when navigation state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const careerOptions = useMemo(() => {
    const extraCareers = savedRecommendations
      .map((item) =>
        typeof item?.career === 'string' ? item.career.trim() : ''
      )
      .filter(Boolean);

    return [
      ...new Set([career, ...DEFAULT_CAREERS, ...extraCareers].filter(Boolean)),
    ];
  }, [savedRecommendations, career]);

  const selectedRecommendation = findCareerRecommendation(
    savedRecommendations,
    career
  );

  const missingSkills = asSkillList(
    selectedRecommendation?.missing_skills ?? skillProfile?.missing_skills
  );

  const skillsToImprove = asSkillList(
    selectedRecommendation?.skills_to_improve ??
      skillProfile?.skills_to_improve
  );

  const topics = Array.isArray(roadmap?.topics) ? roadmap.topics : [];
  const displayedCareer = roadmap?.career || career;

  const persistActiveRoadmap = (payload) => {
    const saved = setUserStorageItem(
      ACTIVE_ROADMAP_KEY,
      JSON.stringify(payload)
    );

    if (!saved) {
      setError('Unable to save your roadmap. Please log in again.');
    }

    return saved;
  };

  const fetchProgress = async (id) => {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid roadmap ID.');
    }

    const currentUserId = getLoggedInUserId();

    if (!currentUserId) {
      throw new Error('Please log in again before fetching progress.');
    }

    const response = await fetch(
      `${API_BASE}/roadmap/${id}/progress?user_id=${currentUserId}`
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        getErrorMessage(data, 'Unable to load learning progress.')
      );
    }

    if (!data || typeof data !== 'object') {
      throw new Error('The progress API returned an unexpected response.');
    }

    setProgress(data);
    return data;
  };

  const generateRoadmap = async () => {
    const selectedCareer = career.trim();

    if (!selectedCareer) {
      setError('Please choose a target career.');
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

    const currentUserId = getLoggedInUserId();

    if (!currentUserId) {
      setError('Please log in again before generating a roadmap.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(null);

    try {
      const response = await fetch(`${API_BASE}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career: selectedCareer,
          missing_skills: missingSkills,
          skills_to_improve: skillsToImprove,
          daily_study_minutes: parsedMinutes,
          user_id: currentUserId,
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

      const method =
        typeof data.generation_method === 'string'
          ? data.generation_method
          : '';

      const payload = {
        roadmap_id: returnedId,
        roadmap: returnedRoadmap,
        career: selectedCareer,
        generation_method: method,
        from_career_selection: false,
      };

      setRoadmapId(returnedId);
      setRoadmap(returnedRoadmap);
      setGenerationMethod(method);
      setFromCareerSelection(false);
      setShowManualGenerator(false);

      persistActiveRoadmap(payload);

      await fetchProgress(returnedId);
    } catch (err) {
      setRoadmapId(null);
      setRoadmap(null);
      setGenerationMethod('');
      setProgress(null);

      setError(
        err.message ||
          'Unable to connect to the roadmap API. Check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTopicStatus = async (topicId, status) => {
    if (!Number.isInteger(roadmapId) || !Number.isInteger(topicId)) {
      setError('A valid generated roadmap is required before updating topics.');
      return;
    }

    if (!TOPIC_STATUSES.includes(status)) {
      setError('Please choose a valid topic status.');
      return;
    }

    const currentUserId = getLoggedInUserId();

    if (!currentUserId) {
      setError('Please log in again before updating topic status.');
      return;
    }

    setUpdatingTopicId(topicId);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE}/roadmap/${roadmapId}/topics/${topicId}?user_id=${currentUserId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Unable to update the topic status.')
        );
      }

      const updatedRoadmap = data?.roadmap;

      if (!updatedRoadmap || typeof updatedRoadmap !== 'object') {
        throw new Error(
          'The topic update API returned an unexpected response.'
        );
      }

      setRoadmap(updatedRoadmap);

      persistActiveRoadmap({
        roadmap_id: roadmapId,
        roadmap: updatedRoadmap,
        career: displayedCareer,
        generation_method: generationMethod,
        from_career_selection: fromCareerSelection,
      });

      await fetchProgress(roadmapId);
    } catch (err) {
      setError(
        err.message ||
          'Unable to update that topic. Check that the backend is running.'
      );
    } finally {
      setUpdatingTopicId(null);
    }
  };

  return (
    <div
      className="page-container"
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        {fromCareerSelection ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/explore-career')}
            style={{ marginBottom: '1rem' }}
          >
            <ArrowLeft size={17} />
            Back to Explore Career
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/career-recommendations')}
            style={{ marginBottom: '1rem' }}
          >
            <ArrowLeft size={17} />
            Browse Career Recommendations
          </button>
        )}

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
          <Map size={20} />
          Learning Roadmap
        </div>

        <h1>{displayedCareer || 'Learning Roadmap'}</h1>

        <p>
          {roadmap
            ? 'Track your personalized learning path and update topic progress as you go.'
            : 'Follow a structured learning path toward your target career.'}
        </p>
      </div>

      {roadmap && !showManualGenerator && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            Selected career: <strong>{displayedCareer}</strong>
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowManualGenerator(true)}
          >
            Generate a different roadmap
          </button>
        </div>
      )}

      {showManualGenerator && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>
            Generate learning roadmap
          </h2>

          <p style={{ color: 'var(--color-text-muted)' }}>
            Prefer choosing a career from recommendations for the best skill
            match. This form remains available as a fallback.
          </p>

          <label htmlFor="targetCareer">Choose your target career</label>

          <select
            id="targetCareer"
            value={career}
            onChange={(event) => setCareer(event.target.value)}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              margin: '10px 0 25px',
            }}
          >
            {careerOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <label htmlFor="dailyStudyMinutes">Daily study minutes</label>

          <input
            id="dailyStudyMinutes"
            type="number"
            min="1"
            max="1440"
            value={dailyStudyMinutes}
            onChange={(event) => setDailyStudyMinutes(event.target.value)}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              margin: '10px 0 25px',
            }}
          />

          <p>
            Missing skills used:{' '}
            {missingSkills.length > 0
              ? missingSkills.join(', ')
              : 'none stored'}
          </p>

          <p>
            Skills to improve used:{' '}
            {skillsToImprove.length > 0
              ? skillsToImprove.join(', ')
              : 'none stored'}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={generateRoadmap}
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Generating roadmap...' : 'Generate learning roadmap'}
          </button>
        </div>
      )}

      {loading && (
        <p>
          Loading your personalized learning roadmap. This may take a moment.
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{
            color: '#b91c1c',
            padding: '1rem',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            borderRadius: '10px',
          }}
        >
          {error}
        </p>
      )}

      {roadmap && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2>Your learning plan: {displayedCareer}</h2>

          <p>
            <strong>Total estimated hours:</strong>{' '}
            {roadmap.estimated_total_hours ?? 0}
          </p>

          <p>
            <strong>Estimated days:</strong> {roadmap.estimated_days ?? 0}
            {(() => {
              const dailyMinutes = Number.parseInt(
                roadmap.daily_study_minutes,
                10
              );

              if (!Number.isInteger(dailyMinutes) || dailyMinutes <= 0) {
                return null;
              }

              const studyLabel =
                dailyMinutes % 60 === 0
                  ? `${dailyMinutes / 60} hour${
                      dailyMinutes / 60 === 1 ? '' : 's'
                    }`
                  : `${dailyMinutes} minutes`;

              return (
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {' '}
                  (based on {studyLabel} of study per day)
                </span>
              );
            })()}
          </p>

          {topics.length > 0 ? (
            <ol>
              {topics.map((topic, index) => {
                const topicId = Number.parseInt(topic?.topic_id, 10);

                const status = TOPIC_STATUSES.includes(topic?.status)
                  ? topic.status
                  : 'Pending';

                const resourceUrl = isSafeHttpUrl(topic?.resource_url)
                  ? topic.resource_url
                  : null;

                return (
                  <li
                    key={
                      Number.isInteger(topicId) ? topicId : `topic-${index}`
                    }
                    style={{ marginBottom: '18px' }}
                  >
                    <strong>
                      {topic?.title || topic?.skill || 'Untitled topic'}
                    </strong>

                    <p>Skill: {topic?.skill || 'Not specified'}</p>

                    <p>
                      Estimated hours:{' '}
                      {typeof topic?.estimated_hours === 'number'
                        ? topic.estimated_hours
                        : 'Not specified'}
                    </p>

                    <p>
                      Resource:{' '}
                      {resourceUrl ? (
                        <a
                          href={resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {resourceUrl}
                        </a>
                      ) : (
                        'No valid resource URL returned'
                      )}
                    </p>

                    <label htmlFor={`topic-status-${topicId || index}`}>
                      Status
                    </label>

                    <select
                      id={`topic-status-${topicId || index}`}
                      value={status}
                      disabled={
                        !Number.isInteger(topicId) ||
                        updatingTopicId === topicId
                      }
                      onChange={(event) =>
                        updateTopicStatus(topicId, event.target.value)
                      }
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        margin: '8px 0 0',
                      }}
                    >
                      {TOPIC_STATUSES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {updatingTopicId === topicId && (
                      <p>Updating topic status...</p>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>
              No topics were returned for this career. You can generate a
              roadmap even when no missing skills are stored.
            </p>
          )}

          {progress && (
            <div style={{ marginTop: '25px' }}>
              <h3>Learning progress</h3>

              <p>
                <strong>Overall progress:</strong>{' '}
                {progress.overall_progress_percentage ?? 0}%
              </p>

              <p>
                Completed topics: {progress.completed_topics ?? 0} /{' '}
                {progress.total_topics ?? topics.length}
              </p>

              <p>
                Struggling skills:{' '}
                {Array.isArray(progress.struggling_skills) &&
                progress.struggling_skills.length > 0
                  ? progress.struggling_skills.join(', ')
                  : 'None'}
              </p>

              {Array.isArray(progress.next_actions) &&
                progress.next_actions.length > 0 && (
                  <div>
                    <p>
                      <strong>Next actions</strong>
                    </p>

                    <ul>
                      {progress.next_actions.map((action, index) => (
                        <li key={`${action?.skill || 'action'}-${index}`}>
                          {action?.skill ? `${action.skill}: ` : ''}
                          {action?.recommendation ||
                            action?.action ||
                            'Continue learning'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {!roadmap && !loading && !showManualGenerator && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2>No roadmap yet</h2>

          <p style={{ color: 'var(--color-text-muted)' }}>
            Explore a recommended career and choose it to generate a tailored
            learning roadmap.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/career-recommendations')}
          >
            Explore Careers
          </button>
        </div>
      )}

      <p style={{ color: 'var(--color-text-muted)' }}>
        These durations are estimates and may vary depending on your experience
        and study time.
      </p>
    </div>
  );
}

export default LearningRoadmap;
