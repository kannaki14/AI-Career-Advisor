
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import SkillProfile from './pages/SkillProfile';
import SkillAssessment from './pages/SkillAssessment';
import CareerRecommendations from './pages/CareerRecommendations';
import ExploreCareer from './pages/ExploreCareer';
import SkillGap from './pages/SkillGap';
import LearningRoadmap from './pages/LearningRoadmap';
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
  <Route path="/career-recommendations" element={<CareerRecommendations />} />
  <Route path="/explore-career" element={<ExploreCareer />} />
  <Route path="/skill-gap" element={<SkillGap />} />
  <Route path="/learning-roadmap" element={<LearningRoadmap />} />
</Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
