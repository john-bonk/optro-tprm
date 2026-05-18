import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import VendorListPage from './pages/VendorListPage';
import VendorDetailPage from './pages/VendorDetailPage';
import InboxPage from './pages/InboxPage';
import SettingsPage from './pages/SettingsPage';
import PortalPage from './pages/PortalPage';
import PortalGapsPage from './pages/PortalGapsPage';
import TrustCenterPage from './pages/TrustCenterPage';
import ReviewerPreviewPage from './pages/ReviewerPreviewPage';
import StylesheetToggle from './layout/StylesheetToggle';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/portal/upload" element={<PortalPage />} />
        <Route path="/portal/gaps" element={<PortalGapsPage />} />
        <Route path="/trust-center" element={<TrustCenterPage />} />
        <Route path="/reviewer-preview" element={<ReviewerPreviewPage />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/vendors" replace />} />
          <Route path="/vendors" element={<VendorListPage />} />
          <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <StylesheetToggle />
    </>
  );
}
