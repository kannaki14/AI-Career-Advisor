
import { useState } from 'react';
import { Link } from 'react-router-dom';

function CareerRecommendations() {
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getRecommendations(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const savedProfile = localStorage.getItem('skillProfile');

      if (!savedProfile) {
        throw new Error('Please upload your resume and create your skill profile first.');
      }

      const profile = JSON.parse(savedProfile);
      const technicalSkills = profile.technical_skills || [];

      if (technicalSkills.length === 0) {
        throw new Error('No technical skills found. Please check your skill profile.');
      }

      const response = await fetch('http://127.0.0.1:8000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technical_skills: technicalSkills,
          interests: interests
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          resume_text: '',
          top_n: 5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get career recommendations.');
      }

      const results = Array.isArray(data)
        ? data
        : data.recommendations || data.results || [];

      setRecommendations(results);

      if (results.length === 0) {
        setError('No recommendations were returned. Please check the API response.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Career Recommendations</h1>
      <p>Discover career paths based on your technical skills and interests.</p>

      <form onSubmit={getRecommendations} className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <label htmlFor="interests">
          Interests (comma-separated)
        </label>
        <input
          id="interests"
          type="text"
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          placeholder="Data Analysis, Statistics, Machine Learning"
          style={{ display: 'block', width: '100%', padding: '0.75rem', margin: '0.75rem 0 1rem' }}
        />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Finding careers...' : 'Get Recommendations'}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ color: 'crimson', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      {recommendations.map((career, index) => (
        <section
          className="card"
          key={`${career.career || 'career'}-${index}`}
          style={{ padding: '1.5rem', marginTop: '1rem' }}
        >
          <h2>{career.career || 'Career'}</h2>
          <p><strong>Category:</strong> {career.category || 'Not specified'}</p>
          <p><strong>Match:</strong> {career.match_percentage ?? 0}%</p>
          <p>
            <strong>Matched skills:</strong>{' '}
            {(career.matched_skills || []).join(', ') || 'None listed'}
          </p>
          <p>
            <strong>Missing skills:</strong>{' '}
            {(career.missing_skills || []).join(', ') || 'None listed'}
          </p>
          <p>
            <strong>Skills to improve:</strong>{' '}
            {(career.skills_to_improve || []).join(', ') || 'None listed'}
          </p>
        </section>
      ))}

      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/skill-profile">Back to Skill Profile</Link>
      </p>
    </main>
  );
}

export default CareerRecommendations;
