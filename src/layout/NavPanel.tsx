import { NavLink, useLocation } from 'react-router-dom';
import styles from './NavPanel.module.css';

export default function NavPanel() {
  const { pathname } = useLocation();
  const isVendorsActive = pathname === '/' || pathname.startsWith('/vendors');
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
