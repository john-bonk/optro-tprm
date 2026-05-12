import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './Topbar.module.css';

function Breadcrumb() {
  const { pathname } = useLocation();
  const params = useParams();

  if (pathname.startsWith('/settings')) {
    return (
      <nav className={styles.breadcrumb}>
        <a className={styles.link}>Solutions</a>
        <span className={styles.sep}>›</span>
        <a className={styles.link}>TPRM</a>
        <span className={styles.sep}>›</span>
        <span className={styles.current}>Settings</span>
      </nav>
    );
  }

  if (pathname.startsWith('/vendors/') && params.vendorId) {
    return (
      <nav className={styles.breadcrumb}>
        <a className={styles.link}>Solutions</a>
        <span className={styles.sep}>›</span>
        <a className={styles.link}>TPRM</a>
        <span className={styles.sep}>›</span>
        <Link className={styles.link} to="/vendors">Vendors</Link>
        <span className={styles.sep}>›</span>
        <span className={styles.current}>Acme Cloud Co.</span>
      </nav>
    );
  }

  return (
    <nav className={styles.breadcrumb}>
      <a className={styles.link}>Solutions</a>
      <span className={styles.sep}>›</span>
      <a className={styles.link}>TPRM</a>
      <span className={styles.sep}>›</span>
      <span className={styles.current}>Vendors</span>
    </nav>
  );
}

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.logo}>O</div>
      <div className={styles.product}>Optro</div>
      <div className={styles.divider} />
      <Breadcrumb />
      <div className={styles.spacer} />
      <button className={styles.iconBtn} title="Search">
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button className={styles.iconBtn} title="Notifications">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5a4 4 0 014 4v3l1 2H3l1-2v-3a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <button className={styles.iconBtn} title="Help">
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.5 6.5a1.5 1.5 0 113 0c0 1-1.5 1-1.5 2.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className={styles.avatar}>JC</div>
    </header>
  );
}
