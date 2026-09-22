import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  Search,
  Compass,
  Route,
  FileText,
  Target,
} from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
];

const valueItems = [
  { icon: Search, title: 'Analyze Your Skills' },
  { icon: Compass, title: 'Discover Career Paths' },
  { icon: Route, title: 'Build Your Learning Roadmap' },
];

const styles = {
  page: {
    width: '100%',
    maxWidth: '72rem',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
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
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    minWidth: '42px',
    minHeight: '42px',
    maxWidth: '42px',
    maxHeight: '42px',
    padding: 0,
    margin: 0,
    flexShrink: 0,
    background: 'transparent',
    backgroundImage: 'none',
    color: 'var(--color-text-heading)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'none',
    cursor: 'pointer',
    lineHeight: 1,
  },
  mobilePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    padding: '0.5rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  },
  mobileNavLink: {
    color: 'var(--color-text)',
    fontWeight: 500,
    fontSize: '0.95rem',
    textDecoration: 'none',
    padding: '0.75rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    boxSizing: 'border-box',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: '2rem',
    alignItems: 'center',
    padding: '1.5rem 0 0.5rem',
  },
  heroCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  heroTitle: {
    margin: 0,
    fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
    lineHeight: 1.12,
    letterSpacing: '-0.03em',
    color: 'var(--color-text-heading)',
  },
  heroText: {
    margin: 0,
    maxWidth: '32rem',
    color: 'var(--color-text-muted)',
    fontSize: '1.0625rem',
    lineHeight: 1.7,
  },
  heroActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '0.25rem',
  },
  heroVisual: {
    position: 'relative',
    minHeight: '20rem',
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
  valueGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '1rem',
  },
  valueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.15rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  },
  valueTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 650,
    color: 'var(--color-text-heading)',
    lineHeight: 1.3,
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '1.25rem 1.5rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  },
  copyright: {
    margin: 0,
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
  },
};

function getLayoutMode(width) {
  if (width < 700) return 'mobile';
  if (width < 1000) return 'tablet';
  return 'desktop';
}

function Navbar({ isCompact, menuOpen, setMenuOpen }) {
  const navbarStyle = isCompact
    ? {
        ...styles.navbar,
        padding: '0.55rem 0.85rem',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }
    : styles.navbar;

  const brandStyle = isCompact
    ? {
        ...styles.brand,
        minWidth: 0,
        fontSize: '0.98rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }
    : styles.brand;

  return (
    <>
      <header style={navbarStyle}>
        <a href="#top" style={brandStyle} onClick={() => setMenuOpen(false)}>
          <span style={{ ...styles.brandIcon, flexShrink: 0 }} aria-hidden="true">
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

        {isCompact && (
          <button
            type="button"
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
        <nav style={styles.mobilePanel} aria-label="Mobile">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={styles.mobileNavLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
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
          width: '8rem',
          height: '8rem',
          top: '-1.25rem',
          right: '-1.25rem',
          background: 'rgba(79, 70, 229, 0.22)',
        }}
      />
      <div
        style={{
          ...styles.orb,
          width: '6rem',
          height: '6rem',
          bottom: '1rem',
          left: '-1rem',
          background: 'rgba(124, 58, 237, 0.18)',
        }}
      />

      <div style={{ ...styles.floatCard, top: '1.75rem', left: '1.25rem', width: '11rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
          <span style={styles.iconWrap}>
            <FileText size={16} />
          </span>
          <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-heading)' }}>
            Skills Match
          </strong>
        </div>
        <div
          style={{
            height: '0.45rem',
            borderRadius: '9999px',
            background: 'var(--color-surface-muted)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '88%',
              height: '100%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            }}
          />
        </div>
      </div>

      <div style={{ ...styles.floatCard, top: '7.25rem', right: '1.25rem', width: '11.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span
            style={{
              ...styles.iconWrap,
              background: 'var(--color-accent-soft)',
              color: 'var(--color-accent)',
            }}
          >
            <Compass size={16} />
          </span>
          <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-heading)' }}>
            Career Paths
          </strong>
        </div>
      </div>

      <div style={{ ...styles.floatCard, bottom: '1.75rem', left: '2rem', width: '12rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={styles.iconWrap}>
            <Target size={16} />
          </span>
          <strong style={{ fontSize: '0.875rem', color: 'var(--color-text-heading)' }}>
            Learning Roadmap
          </strong>
        </div>
      </div>
    </div>
  );
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
      ? { gridTemplateColumns: '1fr', gap: '1.5rem', paddingTop: '0.75rem' }
      : {}),
  };

  const valueLayout = {
    ...styles.valueGrid,
    ...(layout === 'mobile' ? { gridTemplateColumns: '1fr' } : {}),
  };

  const footerLayout = {
    ...styles.footer,
    ...(layout === 'mobile'
      ? { flexDirection: 'column', alignItems: 'flex-start' }
      : {}),
  };

  return (
    <div id="top" style={styles.page}>
      <Navbar isCompact={isCompact} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <section style={{ ...styles.resetSection, ...heroLayout }} aria-labelledby="hero-heading">
        <div style={styles.heroCopy}>
          <h1 id="hero-heading" style={styles.heroTitle}>
            Find Your Career Path
          </h1>
          <p style={styles.heroText}>
            Discover career opportunities that match your skills, interests, education, and
            experience.
          </p>
          <div style={styles.heroActions}>
            <Link to="/register" className="btn btn--primary">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn--outline">
              Login
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section id="about" style={styles.resetSection} aria-label="What you can do">
        <div style={valueLayout}>
          {valueItems.map(({ icon: Icon, title }) => (
            <article key={title} style={styles.valueItem}>
              <span style={styles.iconWrap}>
                <Icon size={18} />
              </span>
              <h2 style={styles.valueTitle}>{title}</h2>
            </article>
          ))}
        </div>
      </section>

      <footer style={footerLayout}>
        <div style={styles.brand}>
          <span style={styles.brandIcon} aria-hidden="true">
            <GraduationCap size={18} />
          </span>
          AI Career Advisor
        </div>
        <p style={styles.copyright}>
          © {new Date().getFullYear()} AI Career Advisor. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;
