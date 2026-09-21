import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Target,
  FileText,
  ClipboardCheck,
  Compass,
  ChartNoAxesCombined,
  Route,
  TrendingUp,
  Upload,
  ListChecks,
  Map,
  Menu,
  X,
  ArrowRight,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
];

const trustItems = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    text: 'Intelligent resume and skill parsing that surfaces what matters most.',
  },
  {
    icon: Sparkles,
    title: 'Personalized Recommendations',
    text: 'Career paths matched to your experience, strengths, and interests.',
  },
  {
    icon: Target,
    title: 'Skill-Gap Insights',
    text: 'Clear visibility into what to learn next to reach your goals.',
  },
];

const features = [
  {
    icon: FileText,
    title: 'Resume Analysis',
    text: 'Extract skills, experience, and strengths from your resume with AI-assisted insights.',
  },
  {
    icon: ClipboardCheck,
    title: 'Skill Assessment',
    text: 'Evaluate your capabilities through structured assessments tailored to your profile.',
  },
  {
    icon: Compass,
    title: 'Career Recommendations',
    text: 'Discover roles that align with your background, interests, and growth potential.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Skill-Gap Analysis',
    text: 'Identify missing competencies between where you are and where you want to be.',
  },
  {
    icon: Route,
    title: 'Personalized Learning Roadmap',
    text: 'Follow a step-by-step plan designed around your target career path.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    text: 'Monitor milestones and stay accountable as you build career-ready skills.',
  },
];

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Resume',
    text: 'Share your resume so the system can understand your experience and skills.',
  },
  {
    step: '02',
    icon: ListChecks,
    title: 'Assess Your Skills',
    text: 'Complete a focused assessment to validate strengths and uncover growth areas.',
  },
  {
    step: '03',
    icon: Briefcase,
    title: 'Discover Career Paths',
    text: 'Receive tailored career recommendations based on your unique profile.',
  },
  {
    step: '04',
    icon: Map,
    title: 'Follow Your Roadmap',
    text: 'Use a personalized learning path to close skill gaps and advance with confidence.',
  },
];

const styles = {
  page: {
    width: '100%',
    maxWidth: '72rem',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.75rem',
  },
  resetSection: {
    width: '100%',
    maxWidth: '100%',
    margin: 0,
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.85rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.94)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: '0.75rem',
    zIndex: 50,
    backdropFilter: 'blur(10px)',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontWeight: 700,
    fontSize: '1.05rem',
    color: 'var(--color-text-heading)',
    textDecoration: 'none',
  },
  brandIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '0.7rem',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
    color: '#fff',
  },
  navDesktop: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    color: 'var(--color-text)',
    fontWeight: 500,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  menuButton: {
    minHeight: '2.5rem',
    minWidth: '2.5rem',
    padding: '0.45rem',
    background: 'var(--color-primary-soft)',
    color: 'var(--color-primary)',
    border: '1px solid #c7d2fe',
    boxShadow: 'none',
  },
  mobilePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    padding: '1rem 1.25rem 1.25rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: '2rem',
    alignItems: 'center',
    padding: '1.25rem 0 0.25rem',
  },
  heroCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    width: 'fit-content',
    margin: 0,
    padding: '0.35rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    background: 'var(--color-primary-soft)',
    borderRadius: '9999px',
  },
  heroTitle: {
    margin: 0,
    fontSize: 'clamp(1.85rem, 4.2vw, 3rem)',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: 'var(--color-text-heading)',
    maxWidth: '16ch',
  },
  heroText: {
    margin: 0,
    maxWidth: '36rem',
    color: 'var(--color-text-muted)',
    fontSize: '1.0625rem',
    lineHeight: 1.7,
  },
  heroActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '0.35rem',
  },
  heroVisual: {
    position: 'relative',
    minHeight: '22rem',
    borderRadius: 'var(--radius-lg)',
    background:
      'radial-gradient(circle at 18% 18%, rgba(79, 70, 229, 0.18), transparent 42%), radial-gradient(circle at 82% 28%, rgba(124, 58, 237, 0.2), transparent 40%), linear-gradient(160deg, #eef2ff 0%, #f5f3ff 48%, #ffffff 100%)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    padding: '1.5rem',
  },
  floatCard: {
    position: 'absolute',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    padding: '0.9rem 1rem',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
  },
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '1rem',
  },
  trustCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    padding: '1.25rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.75rem',
    background: 'var(--color-primary-soft)',
    color: 'var(--color-primary)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.65rem',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '1.25rem',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    height: '100%',
    padding: '1.4rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '1rem',
  },
  stepCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1.35rem 1.15rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    height: '100%',
  },
  stepNumber: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--color-accent)',
  },
  cta: {
    textAlign: 'center',
    padding: '2.75rem 1.75rem',
    borderRadius: 'var(--radius-lg)',
    background:
      'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.14)), var(--color-surface)',
    border: '1px solid #c7d2fe',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  footer: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '2rem',
    padding: '2rem 1.5rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  },
  footerLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.85rem 1.25rem',
    marginBottom: '1rem',
  },
  copyright: {
    margin: 0,
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
  },
};

function Navbar({ isCompact, menuOpen, setMenuOpen }) {
  return (
    <>
      <header style={styles.navbar}>
        <a href="#top" style={styles.brand} onClick={() => setMenuOpen(false)}>
          <span style={styles.brandIcon} aria-hidden="true">
            <GraduationCap size={18} />
          </span>
          AI Career Advisor
        </a>

        {!isCompact && (
          <nav style={styles.navDesktop} aria-label="Primary">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} style={styles.navLink}>
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {!isCompact ? (
          <div style={styles.navActions}>
            <Link to="/login" className="btn btn--outline btn--sm">
              Login
            </Link>
            <Link to="/register" className="btn btn--primary btn--sm">
              Get Started
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className="btn"
            style={styles.menuButton}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </header>

      {isCompact && menuOpen && (
        <div style={styles.mobilePanel}>
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div style={{ ...styles.navActions, flexDirection: 'column', alignItems: 'stretch' }}>
            <Link
              to="/login"
              className="btn btn--outline btn--block"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn--primary btn--block"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function HeroVisual() {
  return (
    <div style={styles.heroVisual} aria-hidden="true">
      <div
        style={{
          ...styles.orb,
          width: '9rem',
          height: '9rem',
          top: '-1.5rem',
          right: '-1.5rem',
          background: 'rgba(79, 70, 229, 0.22)',
        }}
      />
      <div
        style={{
          ...styles.orb,
          width: '7rem',
          height: '7rem',
          bottom: '1rem',
          left: '-1.25rem',
          background: 'rgba(124, 58, 237, 0.18)',
        }}
      />

      <div style={{ ...styles.floatCard, top: '1.5rem', left: '1.25rem', width: '11.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.45rem' }}>
          <span style={styles.iconWrap}>
            <FileText size={16} />
          </span>
          <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-heading)' }}>
            Resume Score
          </strong>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Match strength: 92%
        </p>
        <div
          style={{
            marginTop: '0.7rem',
            height: '0.45rem',
            borderRadius: '9999px',
            background: 'var(--color-surface-muted)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '92%',
              height: '100%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            }}
          />
        </div>
      </div>

      <div style={{ ...styles.floatCard, top: '7.5rem', right: '1.25rem', width: '12rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.45rem' }}>
          <span style={{ ...styles.iconWrap, background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
            <Compass size={16} />
          </span>
          <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-heading)' }}>
            Top Career Fit
          </strong>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Data Analyst · UX Designer · Cloud Engineer
        </p>
      </div>

      <div style={{ ...styles.floatCard, bottom: '1.5rem', left: '2rem', width: '13rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.45rem' }}>
          <span style={styles.iconWrap}>
            <Target size={16} />
          </span>
          <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-heading)' }}>
            Skill Gap Focus
          </strong>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['SQL', 'Python', 'System Design'].map((skill) => (
            <span key={skill} className="badge">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function getLayoutMode(width) {
  if (width < 700) return 'mobile';
  if (width < 1000) return 'tablet';
  return 'desktop';
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [layout, setLayout] = useState(() =>
    typeof window !== 'undefined' ? getLayoutMode(window.innerWidth) : 'desktop'
  );

  const isCompact = layout !== 'desktop';

  useEffect(() => {
    const onResize = () => {
      const next = getLayoutMode(window.innerWidth);
      setLayout(next);
      if (next === 'desktop') setMenuOpen(false);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const heroLayout = {
    ...styles.hero,
    ...(layout !== 'desktop'
      ? { gridTemplateColumns: '1fr', gap: '1.5rem', paddingTop: '0.5rem' }
      : {}),
  };

  const trustLayout = {
    ...styles.trustGrid,
    ...(layout === 'mobile'
      ? { gridTemplateColumns: '1fr' }
      : layout === 'tablet'
        ? { gridTemplateColumns: '1fr' }
        : {}),
  };

  const featureLayout = {
    ...styles.featureGrid,
    ...(layout === 'mobile'
      ? { gridTemplateColumns: '1fr' }
      : layout === 'tablet'
        ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }
        : {}),
  };

  const stepsLayout = {
    ...styles.stepsGrid,
    ...(layout === 'mobile'
      ? { gridTemplateColumns: '1fr' }
      : layout === 'tablet'
        ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }
        : {}),
  };

  const footerLayout = {
    ...styles.footer,
    ...(layout !== 'desktop' ? { gridTemplateColumns: '1fr', gap: '1.5rem' } : {}),
  };

  return (
    <div id="top" style={styles.page}>
      <Navbar isCompact={isCompact} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Hero */}
      <section style={{ ...styles.resetSection, ...heroLayout }} aria-labelledby="hero-heading">
        <div style={styles.heroCopy}>
          <p style={styles.eyebrow}>
            <Sparkles size={14} />
            AI-Powered Personalized Career System
          </p>
          <h1 id="hero-heading" style={styles.heroTitle}>
            Discover the Career Path That&apos;s Right for You
          </h1>
          <p style={styles.heroText}>
            Our platform analyzes your resume, skills, assessment results, and interests to
            recommend career paths, reveal skill gaps, and build a personalized learning roadmap.
          </p>
          <div style={styles.heroActions}>
            <Link to="/register" className="btn btn--primary">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn--secondary">
              Explore Features
            </a>
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* Trust / Value */}
      <section style={styles.resetSection} aria-label="Why AI Career Advisor">
        <div style={trustLayout}>
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article key={title} style={styles.trustCard}>
              <span style={styles.iconWrap}>
                <Icon size={18} />
              </span>
              <h3 className="heading heading--sm" style={{ marginBottom: 0 }}>
                {title}
              </h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.925rem' }}>
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.resetSection} aria-labelledby="features-heading">
        <div style={styles.sectionHeader}>
          <p className="badge">Features</p>
          <h2 id="features-heading" className="heading heading--lg" style={{ margin: 0 }}>
            Everything You Need to Plan Your Career
          </h2>
          <p className="subheading text-center" style={{ marginBottom: 0 }}>
            From resume insights to learning roadmaps — a complete system for personalized career
            growth.
          </p>
        </div>
        <div style={featureLayout}>
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card" style={styles.featureCard}>
              <span style={styles.iconWrap}>
                <Icon size={18} />
              </span>
              <h3 className="card__title">{title}</h3>
              <p className="card__body">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={styles.resetSection} aria-labelledby="how-heading">
        <div style={styles.sectionHeader}>
          <p className="badge badge--accent">How It Works</p>
          <h2 id="how-heading" className="heading heading--lg" style={{ margin: 0 }}>
            Four Steps to a Clearer Career Path
          </h2>
          <p className="subheading text-center" style={{ marginBottom: 0 }}>
            A simple flow that turns your profile into actionable guidance.
          </p>
        </div>
        <div style={stepsLayout}>
          {steps.map(({ step, icon: Icon, title, text }) => (
            <article key={step} style={styles.stepCard}>
              <span style={styles.stepNumber}>STEP {step}</span>
              <span style={styles.iconWrap}>
                <Icon size={18} />
              </span>
              <h3 className="heading heading--sm" style={{ marginBottom: 0 }}>
                {title}
              </h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ ...styles.resetSection, ...styles.cta }} aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="heading heading--lg" style={{ margin: 0 }}>
          Ready to Build Your Career Path?
        </h2>
        <p className="subheading text-center" style={{ marginBottom: 0 }}>
          Create your free account and get personalized recommendations, skill-gap insights, and a
          learning roadmap designed for you.
        </p>
        <Link to="/register" className="btn btn--primary btn--lg">
          Get Started
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={footerLayout}>
        <div>
          <div style={{ ...styles.brand, marginBottom: '0.85rem' }}>
            <span style={styles.brandIcon} aria-hidden="true">
              <GraduationCap size={18} />
            </span>
            AI Career Advisor
          </div>
          <p className="text-muted" style={{ margin: 0, maxWidth: '28rem', fontSize: '0.925rem' }}>
            AI-powered personalized career recommendation, resume analysis, and skill-gap guidance
            to help you grow with clarity and confidence.
          </p>
        </div>
        <div>
          <nav style={styles.footerLinks} aria-label="Footer">
            <a href="#top" className="link link--muted">
              Home
            </a>
            <a href="#features" className="link link--muted">
              Features
            </a>
            <a href="#how-it-works" className="link link--muted">
              How It Works
            </a>
            <Link to="/login" className="link link--muted">
              Login
            </Link>
            <Link to="/register" className="link link--muted">
              Register
            </Link>
          </nav>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} AI Career Advisor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
