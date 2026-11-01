
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import SkillProfile from './pages/SkillProfile';
import SkillAssessment from './pages/SkillAssessment';
import CareerRecommendations from './pages/CareerRecommendations';
import SkillGap from './pages/SkillGap';

function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>AI Career Advisor</h1>
        <p>Your personalized career guidance platform</p>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-upload" element={<ResumeUpload />} />
          <Route path="/skill-profile" element={<SkillProfile />} />
          <Route path="/skill-assessment" element={<SkillAssessment />} />

          {/* Member 3: Career Recommendations */}
          <Route
            path="/career-recommendations"
            element={<CareerRecommendations />}
          />

          {/* Member 3: Skill Gap Analysis */}
          <Route
            path="/skill-gap"
            element={<SkillGap />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
