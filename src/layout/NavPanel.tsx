import { NavLink, useLocation } from 'react-router-dom';
import styles from './NavPanel.module.css';
import { INBOX_TOTAL } from '../data/inbox';

export default function NavPanel() {
  const { pathname } = useLocation();
  const isVendorsActive = pathname === '/' || pathname.startsWith('/vendors');
  const isInboxActive = pathname.startsWith('/inbox');
  const isSettingsActive = pathname.startsWith('/settings');
  return (
    <nav className={styles.navPanel}>
      <div className={styles.section}>TPRM</div>
      <NavLink
        to="/vendors"
        className={`${styles.item} ${isVendorsActive ? styles.active : ''}`}
      >
        <span className={styles.itemText}>Third Parties</span>
      </NavLink>
      <NavLink
        to="/inbox"
        className={`${styles.item} ${isInboxActive ? styles.active : ''}`}
      >
        <span className={styles.itemText}>Inbox</span>
        <span className={styles.itemBadge}>{INBOX_TOTAL}</span>
      </NavLink>

      <div className={styles.section} style={{ paddingTop: 14 }}>Admin</div>
      <NavLink
        to="/settings"
        className={`${styles.item} ${isSettingsActive ? styles.active : ''}`}
      >
        <span className={styles.itemText}>Settings</span>
      </NavLink>

      <div className={styles.spacer} />
    </nav>
  );
}
