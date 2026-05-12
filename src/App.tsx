import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import VendorListPage from './pages/VendorListPage';
import VendorDetailPage from './pages/VendorDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/vendors" replace />} />
        <Route path="/vendors" element={<VendorListPage />} />
        <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
