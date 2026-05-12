import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';
import Topbar from './Topbar';
import GutterSidebar from './GutterSidebar';
import NavPanel from './NavPanel';

export default function Layout() {
  return (
    <div className={styles.app}>
      <Topbar />
      <GutterSidebar />
      <NavPanel />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
