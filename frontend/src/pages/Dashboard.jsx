import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRound,
  Upload,
  ClipboardCheck,
  Compass,
  Route,
  FileText,
  User,
  ListChecks,
  Briefcase,
  ChartNoAxesCombined,
  Map,
  ArrowRight,
  CircleDot,
} from 'lucide-react';

/* Temporary demo data — replace with backend/API values later */
const demoProfileSummary = {
  profileCompletion: 65,
  skillsIdentified: 8,
  assessmentStatus: 'Not completed',
  careerRecommendations: 0,
};

const demoSkills = [
  { name: 'Python', level: 80 },
  { name: 'SQL', level: 65 },
  { name: 'Communication', level: 75 },
  { name: 'Problem Solving', level: 70 },
];

const journeySteps = [
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'skill-profile', label: 'Skill Profile', icon: User },
  { id: 'assessment', label: 'Assessment', icon: ListChecks },
  { id: 'career', label: 'Career Recommendation', icon: Briefcase },
  { id: 'skill-gap', label: 'Skill Gap', icon: ChartNoAxesCombined },
  { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
];

const currentJourneyStepId = 'resume';

const quickActions = [
  {
    id: 'upload-resume',
    label: 'Upload Resume',
    icon: Upload,
  },
  {
    id: 'skill-assessment',
    label: 'Take Skill Assessment',
    icon: ClipboardCheck,
  },
  {
    id: 'explore-careers',
    label: 'Explore Careers',
    icon: Compass,
  },
  {
    id: 'learning-roadmap',
    label: 'View Learning Roadmap',
    icon: Route,
  },
];

const styles = {
  page: {
    width: '100%',
    maxWidth: '72rem',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  },

  headerCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    minWidth: 0,
  },

  profileButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.75rem',
    height: '2.75rem',
    minWidth: '2.75rem',
    padding: 0,
    borderRadius: '9999px',
    border: '1px solid #c7d2fe',
    background: 'var(--color-primary-soft)',
    backgroundImage: 'none',
    color: 'var(--color-primary)',
    boxShadow: 'none',
    cursor: 'default',
    flexShrink: 0,
  },

  gridMain: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '1.25rem',
    alignItems: 'start',
  },

  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    minWidth: 0,
  },

  sectionTitle: {
    margin: '0 0 1rem',
    fontSize: '1.05rem',
    fontWeight: 650,
    color: 'var(--color-text-heading)',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.85rem',
  },

  summaryItem: {
    padding: '0.9rem 1rem',
    background: 'var(--color-surface-muted)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },

  summaryLabel: {
    margin: '0 0 0.35rem',
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },

  summaryValue: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-text-heading)',
    letterSpacing: '-0.02em',
  },

  progressTrack: {
    marginTop: '0.65rem',
    height: '0.45rem',
    borderRadius: '9999px',
    background: '#e2e8f0',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: '9999px',
    background:
      'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.85rem',
  },

  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.75rem',
    width: '100%',
    minHeight: '6.5rem',
    padding: '1.1rem',
    textAlign: 'left',
    background: 'var(--color-surface)',
    backgroundImage: 'none',
    color: 'var(--color-text-heading)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
  },

  actionIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.4rem',
    height: '2.4rem',
    borderRadius: '0.7rem',
    background: 'var(--color-primary-soft)',
    color: 'var(--color-primary)',
  },

  actionLabel: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 650,
    lineHeight: 1.3,
  },

  journeyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },

  journeyRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.85rem',
  },

  journeyRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '1.75rem',
    flexShrink: 0,
  },

  journeyDot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '9999px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-muted)',
    color: 'var(--color-text-muted)',
    flexShrink: 0,
  },

  journeyDotActive: {
    background:
      'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
    borderColor: 'transparent',
    color: '#fff',
    boxShadow: '0 0 0 4px var(--color-primary-soft)',
  },

  journeyLine: {
    width: '2px',
    flex: 1,
    minHeight: '1.1rem',
    background: 'var(--color-border)',
    margin: '0.2rem 0',
  },

  journeyContent: {
    flex: 1,
    minWidth: 0,
    padding: '0.15rem 0 1.15rem',
  },

  journeyLabel: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },

  journeyLabelActive: {
    color: 'var(--color-text-heading)',
  },

  journeyBadge: {
    display: 'inline-flex',
    marginTop: '0.35rem',
    padding: '0.15rem 0.55rem',
    fontSize: '0.7rem',
    fontWeight: 650,
    color: 'var(--color-primary)',
    background: 'var(--color-primary-soft)',
    borderRadius: '9999px',
  },

  skillRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '1rem',
  },

  skillMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },

  skillName: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--color-text-heading)',
  },

  skillPercent: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 650,
    color: 'var(--color-text-muted)',
  },

  nextStep: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    padding: '1.4rem 1.5rem',
    background:
      'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.12)), var(--color-surface)',
    border: '1px solid #c7d2fe',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  },

  nextStepActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '0.25rem',
  },
};

function getLayoutMode(width) {
  if (width < 700) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function ProfileSummaryCard({ summary, layout }) {
  const items = [
    {
      label: 'Profile completion',
      value: `${summary.profileCompletion}%`,
      showBar: true,
      percent: summary.profileCompletion,
    },
    {
      label: 'Skills identified',
      value: summary.skillsIdentified,
    },
    {
      label: 'Assessment status',
      value: summary.assessmentStatus,
    },
    {
      label: 'Career recommendations',
      value: summary.careerRecommendations,
    },
  ];

  const gridStyle = {
    ...styles.summaryGrid,
    ...(layout === 'mobile'
      ? { gridTemplateColumns: '1fr' }
      : {}),
  };

  return (
    <section className="card" aria-labelledby="profile-summary-heading">
      <h2 id="profile-summary-heading" style={styles.sectionTitle}>
        Profile Summary
      </h2>

      <div style={gridStyle}>
        {items.map((item) => (
          <div key={item.label} style={styles.summaryItem}>
            <p style={styles.summaryLabel}>{item.label}</p>
            <p style={styles.summaryValue}>{item.value}</p>

            {item.showBar && (
              <div
                style={styles.progressTrack}
                role="progressbar"
                aria-valuenow={item.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Profile completion"
              >
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${item.percent}%`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickActions({ layout }) {
  const navigate = useNavigate();

  const gridStyle = {
    ...styles.actionsGrid,
    ...(layout === 'mobile'
      ? { gridTemplateColumns: '1fr' }
      : {}),
  };

  const handleAction = (id) => {
    if (id === 'upload-resume') {
      navigate('/resume-upload');
    }
  };

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" style={styles.sectionTitle}>
        Quick Actions
      </h2>

      <div style={gridStyle}>
        {quickActions.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            style={styles.actionCard}
            onClick={() => handleAction(id)}
          >
            <span style={styles.actionIcon} aria-hidden="true">
              <Icon size={18} />
            </span>

            <p style={styles.actionLabel}>{label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function CareerJourney() {
  return (
    <section className="card" aria-labelledby="journey-heading">
      <h2 id="journey-heading" style={styles.sectionTitle}>
        Career Journey
      </h2>

      <ol style={styles.journeyList}>
        {journeySteps.map(
          ({ id, label, icon: Icon }, index) => {
            const isActive = id === currentJourneyStepId;
            const isLast = index === journeySteps.length - 1;

            return (
              <li key={id} style={styles.journeyRow}>
                <div style={styles.journeyRail}>
                  <span
                    style={{
                      ...styles.journeyDot,
                      ...(isActive
                        ? styles.journeyDotActive
                        : {}),
                    }}
                    aria-hidden="true"
                  >
                    {isActive ? (
                      <CircleDot size={14} />
                    ) : (
                      <Icon size={13} />
                    )}
                  </span>

                  {!isLast && (
                    <span style={styles.journeyLine} />
                  )}
                </div>

                <div style={styles.journeyContent}>
                  <p
                    style={{
                      ...styles.journeyLabel,
                      ...(isActive
                        ? styles.journeyLabelActive
                        : {}),
                    }}
                  >
                    {label}
                  </p>

                  {isActive && (
                    <span style={styles.journeyBadge}>
                      Current step
                    </span>
                  )}
                </div>
              </li>
            );
          }
        )}
      </ol>
    </section>
  );
}

function SkillOverview({ skills }) {
  return (
    <section className="card" aria-labelledby="skills-heading">
      <h2 id="skills-heading" style={styles.sectionTitle}>
        Skill Overview
      </h2>

      <div>
        {skills.map((skill) => (
          <div key={skill.name} style={styles.skillRow}>
            <div style={styles.skillMeta}>
              <p style={styles.skillName}>{skill.name}</p>
              <p style={styles.skillPercent}>
                {skill.level}%
              </p>
            </div>

            <div
              style={styles.progressTrack}
              role="progressbar"
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${skill.name} proficiency`}
            >
              <div
                style={{
                  ...styles.progressFill,
                  width: `${skill.level}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NextStepCard() {
  const navigate = useNavigate();

  return (
    <section
      style={styles.nextStep}
      aria-labelledby="next-step-heading"
    >
      <h2
        id="next-step-heading"
        className="heading heading--sm"
        style={{ margin: 0 }}
      >
        Start by uploading your resume
      </h2>

      <p
        className="text-muted"
        style={{ margin: 0, maxWidth: '40rem' }}
      >
        Upload your resume so we can analyze your skills and
        build your personalized career path.
      </p>

      <div style={styles.nextStepActions}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate('/resume-upload')}
        >
          Upload Resume
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function Dashboard() {
  const [layout, setLayout] = useState(() =>
    typeof window !== 'undefined'
      ? getLayoutMode(window.innerWidth)
      : 'desktop'
  );

  useEffect(() => {
    const onResize = () =>
      setLayout(getLayoutMode(window.innerWidth));

    onResize();

    window.addEventListener('resize', onResize);

    return () =>
      window.removeEventListener('resize', onResize);
  }, []);

  const mainGridStyle = {
    ...styles.gridMain,
    ...(layout !== 'desktop'
      ? { gridTemplateColumns: '1fr' }
      : {}),
  };

  const headerStyle = {
    ...styles.header,
    ...(layout === 'mobile'
      ? {
          padding: '1.1rem 1.15rem',
          alignItems: 'flex-start',
        }
      : {}),
  };

  return (
    <div style={styles.page}>
      <header style={headerStyle}>
        <div style={styles.headerCopy}>
          <h1
            className="heading heading--md"
            style={{ margin: 0 }}
          >
            Welcome back!
          </h1>

          <p
            className="text-muted"
            style={{
              margin: 0,
              fontSize: '0.95rem',
            }}
          >
            Continue building your career path with AI Career
            Advisor.
          </p>
        </div>

        <div
          style={styles.profileButton}
          aria-label="User profile"
          role="img"
        >
          <UserRound size={20} />
        </div>
      </header>

      <div style={mainGridStyle}>
        <div style={styles.stack}>
          <ProfileSummaryCard
            summary={demoProfileSummary}
            layout={layout}
          />

          <QuickActions layout={layout} />

          <SkillOverview skills={demoSkills} />

          <NextStepCard />
        </div>

        <div style={styles.stack}>
          <CareerJourney />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;