
import { useState } from 'react';

function SkillGap() {
  const [skills, setSkills] = useState(
    () => JSON.parse(localStorage.getItem('skillProfile') || '{}').technical_skills || []
  );
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyzeSkillGap() {
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const response = await fetch('http://127.0.0.1:8000/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technical_skills: skills,
          interests: [],
          resume_text: '',
          top_n: 5
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError('Could not analyze skill gaps. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: 20 }}>
      <h2>Skill Gap Analysis</h2>
      <p>
        Compare your current skills with the skills required for recommended careers.
      </p>

      <h3>Your Current Technical Skills</h3>
      {skills.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              style={{
                padding: '7px 12px',
                borderRadius: 16,
                background: '#dcfce7',
                color: '#166534'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p>No technical skills found. Upload your resume and create a skill profile first.</p>
      )}

      <button
        onClick={analyzeSkillGap}
        disabled={loading || skills.length === 0}
        style={{ marginTop: 20, padding: '10px 18px', cursor: 'pointer' }}
      >
        {loading ? 'Analyzing...' : 'Analyze Skill Gaps'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {recommendations.map((career) => (
        <section
          key={career.career}
          style={{
            marginTop: 24,
            padding: 18,
            border: '1px solid #ddd',
            borderRadius: 10
          }}
        >
          <h3>{career.career}</h3>
          <p>Career match: {career.match_percentage}%</p>

          <h4>Skills You Already Have</h4>
          {career.matched_skills?.length ? (
            <ul>
              {career.matched_skills.map((skill) => (
                <li key={skill}>✓ {skill}</li>
              ))}
            </ul>
          ) : (
            <p>No matching skills found yet.</p>
          )}

          <h4>Skills to Learn or Improve</h4>
          {career.skills_to_improve?.length ? (
            <ul>
              {career.skills_to_improve.map((skill) => (
                <li key={skill}>○ {skill}</li>
              ))}
            </ul>
          ) : (
            <p>You have all the listed required skills for this career.</p>
          )}
        </section>
      ))}
    </main>
  );
}

export default SkillGap;
