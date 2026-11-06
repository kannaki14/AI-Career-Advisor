
import { useEffect, useState } from 'react';
import {
  API_BASE,
  asRecommendationList,
  getLoggedInUserId,
  getUserStorageItem,
} from '../utils/sessionUser';
function SkillGap() {
  const [career, setCareer] = useState('Data Analyst');
  const [careerOptions, setCareerOptions] = useState([
    'Data Analyst',
    'Data Scientist',
    'Machine Learning Engineer',
    'Web Developer',
  ]);
  const [currentSkills, setCurrentSkills] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    try {
      const savedProfile = getUserStorageItem('skillProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const skills = Array.isArray(profile?.technical_skills)
          ? profile.technical_skills.filter(
              (skill) => typeof skill === 'string' && skill.trim()
            )
          : [];
        if (skills.length > 0) {
          setCurrentSkills(skills.join(', '));
        }
      }
    } catch {
      // Leave the current-skills field empty when the profile cannot be read.
    }

    const userId = getLoggedInUserId();
    if (!userId) return;

    fetch(`${API_BASE}/recommendations/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch saved recommendations');
        }
        return response.json();
      })
      .then((data) => {
        const saved = asRecommendationList(data);
        setRecommendations(saved);

        const careers = saved
          .map((item) =>
            typeof item?.career === 'string' ? item.career.trim() : ''
          )
          .filter(Boolean);

        if (careers.length > 0) {
          setCareerOptions([...new Set(careers)]);
          setCareer((current) =>
            careers.includes(current) ? current : careers[0]
          );
        }
      })
      .catch(() => {
        // Keep the existing career list when saved recommendations are unavailable.
      });
  }, []);

  useEffect(() => {
    const selected = recommendations.find(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.career === 'string' &&
        item.career.trim().toLowerCase() === career.trim().toLowerCase()
    );

    if (!selected) return;

    const required = [
      ...(Array.isArray(selected.matched_skills) ? selected.matched_skills : []),
      ...(Array.isArray(selected.missing_skills) ? selected.missing_skills : []),
    ]
      .filter((skill) => typeof skill === 'string' && skill.trim())
      .map((skill) => skill.trim());

    if (required.length > 0) {
      setRequiredSkills([...new Set(required)].join(', '));
    }
  }, [career, recommendations]);

  const current = currentSkills
    .split(',')
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);

  const required = requiredSkills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const missingSkills = required.filter(
    (skill) => !current.includes(skill.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <h2>Skill Gap Analysis</h2>
      <p>Compare your current skills with the skills required for your target career.</p>

      <label htmlFor="career">Target Career</label>
      <select
        id="career"
        value={career}
        onChange={(event) => setCareer(event.target.value)}
        style={{ display: 'block', margin: '8px 0 20px', padding: '10px', width: '100%' }}
      >
        {careerOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <label htmlFor="currentSkills">Your Current Skills (comma-separated)</label>
      <textarea
        id="currentSkills"
        value={currentSkills}
        onChange={(event) => setCurrentSkills(event.target.value)}
        rows={3}
        style={{ display: 'block', margin: '8px 0 20px', padding: '10px', width: '100%' }}
      />

      <label htmlFor="requiredSkills">Required Skills (comma-separated)</label>
      <textarea
        id="requiredSkills"
        value={requiredSkills}
        onChange={(event) => setRequiredSkills(event.target.value)}
        rows={3}
        style={{ display: 'block', margin: '8px 0 20px', padding: '10px', width: '100%' }}
      />

      <h3>Analysis for {career}</h3>
      <p>Matching skills: {required.length - missingSkills.length}</p>
      <p>Skills to learn: {missingSkills.length}</p>

      {missingSkills.length > 0 ? (
        <ul>
          {missingSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p>You have all the skills listed as required.</p>
      )}
    </div>
  );
}

export default SkillGap;
