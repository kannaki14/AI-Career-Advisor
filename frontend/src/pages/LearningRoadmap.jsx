
import { useState } from 'react';

function LearningRoadmap() {
  const [career, setCareer] = useState('Data Analyst');

  const roadmaps = {
    'Data Analyst': [
      { skill: 'Excel Fundamentals', duration: '1 week' },
      { skill: 'SQL', duration: '2 weeks' },
      { skill: 'Python for Data Analysis', duration: '2 weeks' },
      { skill: 'Power BI or Tableau', duration: '2 weeks' },
      { skill: 'Build a Data Analysis Project', duration: '2 weeks' },
    ],
    'Data Scientist': [
      { skill: 'Python Fundamentals', duration: '2 weeks' },
      { skill: 'Statistics and Probability', duration: '2 weeks' },
      { skill: 'Pandas and Data Visualization', duration: '2 weeks' },
      { skill: 'Machine Learning Fundamentals', duration: '3 weeks' },
      { skill: 'Build a Machine Learning Project', duration: '2 weeks' },
    ],
    'Machine Learning Engineer': [
      { skill: 'Python Programming', duration: '2 weeks' },
      { skill: 'Linear Algebra and Statistics', duration: '3 weeks' },
      { skill: 'Machine Learning', duration: '3 weeks' },
      { skill: 'Model Deployment and APIs', duration: '2 weeks' },
      { skill: 'Build and Deploy a Project', duration: '2 weeks' },
    ],
    'Web Developer': [
      { skill: 'HTML and CSS', duration: '2 weeks' },
      { skill: 'JavaScript', duration: '3 weeks' },
      { skill: 'React Fundamentals', duration: '3 weeks' },
      { skill: 'Backend and APIs', duration: '2 weeks' },
      { skill: 'Build a Full-Stack Project', duration: '2 weeks' },
    ],
  };

  const steps = roadmaps[career];

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <h2>Learning Roadmap</h2>
      <p>Follow a structured learning path toward your target career.</p>

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
        {Object.keys(roadmaps).map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      <h3>Your learning plan: {career}</h3>

      <ol>
        {steps.map((step, index) => (
          <li key={step.skill} style={{ marginBottom: '18px' }}>
            <strong>{step.skill}</strong>
            <p>Suggested duration: {step.duration}</p>
          </li>
        ))}
      </ol>

      <p>
        <strong>Total estimated duration:</strong>{' '}
        {steps.reduce((total, step) => total + Number.parseInt(step.duration, 10), 0)} weeks
      </p>
      <p>These durations are estimates and may vary depending on your experience and study time.</p>
    </div>
  );
}

export default LearningRoadmap;
