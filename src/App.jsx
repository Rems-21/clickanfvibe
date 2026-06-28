import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Create from './pages/Create';
import Credits from './pages/Credits';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Generating from './pages/Generating';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import History from './pages/History';
import Help from './pages/Help';
import Maintenance from './pages/Maintenance';
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import FloatingInstallButton from './components/FloatingInstallButton';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGenerations from './pages/admin/AdminGenerations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCredits from './pages/admin/AdminCredits';
import AdminLibrary from './pages/admin/AdminLibrary';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminLogs from './pages/admin/AdminLogs';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/devvorx/admin-1');
  const { user, loading: authLoading, logout } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    // Fetch public config
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setMaintenance(data.maintenance_mode);
        setConfigLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch config", err);
        setConfigLoading(false);
      });
  }, []);

  useEffect(() => {
    // Notify Facebook Pixel on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Déconnexion forcée des utilisateurs non-admin si la maintenance est active
    if (!configLoading && !authLoading) {
      if (maintenance && user && !user.is_admin) {
        logout();
      }
    }
  }, [maintenance, user, configLoading, authLoading, logout]);

  // Handle Maintenance Mode
  if (!configLoading && !authLoading) {
    if (maintenance && (!user || !user.is_admin) && location.pathname !== '/login') {
      return <Maintenance />;
    }
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* User Routes */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/generating" element={<Generating />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/history" element={<History />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/devvorx/admin-1" element={<AdminDashboard />} />
            <Route path="/devvorx/admin-1/generations" element={<AdminGenerations />} />
            <Route path="/devvorx/admin-1/users" element={<AdminUsers />} />
            <Route path="/devvorx/admin-1/credits" element={<AdminCredits />} />
            <Route path="/devvorx/admin-1/library" element={<AdminLibrary />} />
            <Route path="/devvorx/admin-1/settings" element={<AdminSettings />} />
            <Route path="/devvorx/admin-1/promotions" element={<AdminPromotions />} />
            <Route path="/devvorx/admin-1/logs" element={<AdminLogs />} />
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/500" element={<Error500 />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
      {!isAdminRoute && <GlobalAudioPlayer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <FloatingInstallButton />
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
