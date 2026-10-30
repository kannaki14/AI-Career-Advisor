
import { useState } from 'react';

function SkillGap() {
  const [career, setCareer] = useState('Data Analyst');
  const [currentSkills, setCurrentSkills] = useState('Python, Excel');
  const [requiredSkills, setRequiredSkills] = useState(
    'Python, SQL, Excel, Power BI'
  );

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
        <option>Data Analyst</option>
        <option>Data Scientist</option>
        <option>Machine Learning Engineer</option>
        <option>Web Developer</option>
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
