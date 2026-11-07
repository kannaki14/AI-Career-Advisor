import React, { useEffect, useState } from 'react';
import {
  getUserStorageItem,
  setUserStorageItem,
} from '../utils/sessionUser';

function SkillAssessment() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const storedProfile = getUserStorageItem('skillProfile');

        if (!storedProfile) {
          throw new Error(
            'Skill profile not found. Please upload your resume first.'
          );
        }

        const skillProfile = JSON.parse(storedProfile);

        const technicalSkills = skillProfile.technical_skills || [];

        if (technicalSkills.length === 0) {
          throw new Error(
            'No technical skills were found in your skill profile.'
          );
        }

        const response = await fetch(
          'http://127.0.0.1:8000/assessment/generate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              technical_skills: technicalSkills,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || 'Failed to generate assessment.'
          );
        }

        if (!data.questions || data.questions.length === 0) {
          throw new Error(
            'No assessment questions were generated.'
          );
        }

        // Group questions by skill
        const groupedQuestions = {};

        data.questions.forEach((question) => {
          if (!groupedQuestions[question.skill]) {
            groupedQuestions[question.skill] = [];
          }

          groupedQuestions[question.skill].push(question);
        });

        // Shuffle questions inside each skill
        // but keep each skill together.
        const finalQuestions = Object.values(groupedQuestions).flatMap(
          (skillQuestions) =>
            [...skillQuestions].sort(
              () => Math.random() - 0.5
            )
        );

        setQuestions(finalQuestions);
      } catch (error) {
        setError(
          error.message || 'Unable to load the assessment.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, []);

  const handleAnswer = (answer) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion]: answer,
    }));
  };

  const calculateScores = () => {
    const skillScores = {};

    questions.forEach((question, index) => {
      const selectedAnswer = answers[index];

      if (!skillScores[question.skill]) {
        skillScores[question.skill] = {
          correct: 0,
          total: 0,
        };
      }

      skillScores[question.skill].total += 1;

      if (selectedAnswer === question.answer) {
        skillScores[question.skill].correct += 1;
      }
    });

    return skillScores;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    const scores = calculateScores();

    const scoresWithPercentage = {};

    Object.entries(scores).forEach(([skill, score]) => {
      const percentage = Math.round(
        (score.correct / score.total) * 100
      );

      scoresWithPercentage[skill] = {
        correct: score.correct,
        total: score.total,
        percentage: percentage,
      };
    });

    const saved = setUserStorageItem(
      'assessmentScores',
      JSON.stringify(scoresWithPercentage)
    );

    if (!saved) {
      throw new Error('Please log in again before saving assessment results.');
    }

    setCompleted(true);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setCompleted(false);
  };

  // -----------------------------
  // Loading state
  // -----------------------------

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="assessment-question-card">
          <div className="assessment-page-header">
            <div className="assessment-page-icon">
              ✓
            </div>

            <div>
              <span className="assessment-page-label">
                SKILL ASSESSMENT
              </span>

              <h2>Preparing Your Assessment</h2>

              <p>
                We are generating questions based on your
                technical skills. Please wait a moment.
              </p>
            </div>
          </div>

          <div className="assessment-tip">
            <div className="assessment-tip-icon">
              i
            </div>

            <div>
              <strong>
                Generating personalized questions...
              </strong>

              <p>
                Your assessment is being prepared based on
                the skills detected from your resume.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Error state
  // -----------------------------

  if (error) {
    return (
      <div className="assessment-page">
        <div className="assessment-complete-card">
          <div className="assessment-complete-icon">
            !
          </div>

          <span className="assessment-complete-label">
            ASSESSMENT ERROR
          </span>

          <h2>Unable to Load Assessment</h2>

          <p>{error}</p>

          <div className="assessment-complete-actions">
            <button
              type="button"
              className="primary-blue-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>

            <button
              type="button"
              className="secondary-blue-button"
              onClick={() => {
                window.location.href = '/skill-profile';
              }}
            >
              Back to Skill Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Completion state
  // -----------------------------

  if (completed) {
    const assessmentScores = JSON.parse(
      getUserStorageItem('assessmentScores') || '{}'
    );

    const totalCorrect = Object.values(
      assessmentScores
    ).reduce(
      (total, score) => total + score.correct,
      0
    );

    return (
      <div className="assessment-page">
        <div className="assessment-complete-card">

          <div className="assessment-complete-icon">
            ✓
          </div>

          <span className="assessment-complete-label">
            ASSESSMENT COMPLETED
          </span>

          <h2>Great job!</h2>

          <p>
            You have completed the skill assessment. Here is
            a summary of your current performance.
          </p>

          {/* Skill Results */}
          <div className="assessment-results">
            <h3>Your Skill Assessment Results</h3>

            {Object.entries(assessmentScores).map(
              ([skill, score]) => {
                const percentage =
                  score.percentage ??
                  Math.round(
                    (score.correct / score.total) * 100
                  );

                return (
                  <div
                    className="assessment-result-item"
                    key={skill}
                  >
                    <div className="assessment-result-header">
                      <span>{skill}</span>

                      <strong>
                        {score.correct} / {score.total}
                      </strong>
                    </div>

                    <div className="assessment-result-bar-background">
                      <div
                        className="assessment-result-bar"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="assessment-result-percentage">
                      {percentage}%
                    </span>
                  </div>
                );
              }
            )}
          </div>

          {/* Overall Information */}
          <div className="assessment-result-info">
            <div>
              <strong>{questions.length}</strong>
              <span>Total Questions</span>
            </div>

            <div>
              <strong>{totalCorrect}</strong>
              <span>Total Correct</span>
            </div>
          </div>

          {/* Actions */}
          <div className="assessment-complete-actions">
            <button
              type="button"
              className="primary-blue-button"
              onClick={() => {
                window.location.href = '/dashboard';
              }}
            >
              Back to Dashboard →
            </button>

            <button
              type="button"
              className="secondary-blue-button"
              onClick={handleRestart}
            >
              Retake Assessment
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Safety check
  if (!questions.length) {
    return (
      <div className="assessment-page">
        <div className="assessment-complete-card">
          <h2>No Questions Available</h2>

          <p>
            No assessment questions are currently available.
          </p>

          <button
            type="button"
            className="primary-blue-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Current question
  // -----------------------------

  const question = questions[currentQuestion];

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="assessment-page">

      {/* Header */}
      <div className="assessment-page-header">
        <div className="assessment-page-icon">
          ✓
        </div>

        <div>
          <span className="assessment-page-label">
            SKILL ASSESSMENT
          </span>

          <h2>Assess Your Skills</h2>

          <p>
            Answer questions to help us understand your
            current skill level.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="assessment-progress-card">
        <div className="assessment-progress-top">
          <span>
            Question {currentQuestion + 1} of{' '}
            {questions.length}
          </span>

          <span>
            {Math.round(progress)}% Complete
          </span>
        </div>

        <div className="assessment-progress-background">
          <div
            className="assessment-progress"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="assessment-question-card">

        {/* Skill name only */}
        <div className="assessment-skill-badge">
          {question.skill}
        </div>

        <h3>
          {question.question}
        </h3>

        <p className="assessment-question-description">
          Select the option that best answers the question.
        </p>

        {/* Options */}
        <div className="assessment-options">
          {question.options.map((option, index) => (
            <button
              key={option}
              type="button"
              className={`assessment-option ${
                answers[currentQuestion] === option
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleAnswer(option)}
            >
              <span className="assessment-option-number">
                {index + 1}
              </span>

              <span className="assessment-option-text">
                {option}
              </span>

              <span className="assessment-option-check">
                {answers[currentQuestion] === option
                  ? '✓'
                  : ''}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="assessment-navigation">

          <button
            type="button"
            className="assessment-back-button"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          <button
            type="button"
            className="primary-blue-button"
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
          >
            {currentQuestion === questions.length - 1
              ? 'Finish Assessment ✓'
              : 'Next Question →'}
          </button>

        </div>
      </div>

      {/* Tip */}
      <div className="assessment-tip">
        <div className="assessment-tip-icon">
          i
        </div>

        <div>
          <strong>
            Answer each question based on your knowledge.
          </strong>

          <p>
            Your assessment responses will help create a
            more personalized career profile and identify
            suitable career paths.
          </p>
        </div>
      </div>

    </div>
  );
}

export default SkillAssessment;
