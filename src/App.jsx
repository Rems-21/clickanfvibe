import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { NotificationProvider } from './context/NotificationContext';
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
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminPaymentAttempts from './pages/admin/AdminPaymentAttempts';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminLogs from './pages/admin/AdminLogs';
import AdminStats from './pages/admin/AdminStats';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminPricing from './pages/admin/AdminPricing';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/devvorx/admin-1');
  const { user, loading: authLoading, logout } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    // Fetch public config
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setMaintenance(data.maintenance_mode);
      } catch (err) {
        console.error('Config fetch error', err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();

    // Track unique visits and sources (WhatsApp, Facebook, etc.)
    const trackVisit = async () => {
      if (sessionStorage.getItem('visited')) return;
      sessionStorage.setItem('visited', '1');

      const params = new URLSearchParams(window.location.search);
      let source = params.get('source') || params.get('ref') || params.get('utm_source');
      
      if (!source) {
        const ref = document.referrer.toLowerCase();
        if (ref.includes('facebook.com') || ref.includes('fb.me')) source = 'facebook';
        else if (ref.includes('whatsapp.com') || ref.includes('wa.me')) source = 'whatsapp';
        else if (ref.includes('instagram.com')) source = 'instagram';
        else if (ref.includes('tiktok.com')) source = 'tiktok';
        else if (ref.includes('google.com')) source = 'google';
        else if (ref) source = 'referral';
        else source = 'direct';
      }

      localStorage.setItem('traffic_source', source.toLowerCase());

      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'visit',
            source: source.toLowerCase()
          })
        });
      } catch (e) {}
    };
    trackVisit();

    // Listen for PWA installation
    const handleAppInstalled = () => {
      fetch('/api/track/download', { method: 'POST' }).catch(console.error);
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [logout]);

  useEffect(() => {
    // Notify Facebook Pixel on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    // Track visit with UTM source
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source') || params.get('ref') || document.referrer.includes('facebook') ? 'facebook' : document.referrer.includes('google') ? 'google' : document.referrer.includes('tiktok') ? 'tiktok' : document.referrer ? 'referral' : 'direct';
    const utm_campaign = params.get('utm_campaign') || null;
    const utm_medium = params.get('utm_medium') || null;
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'visit', source, utm_campaign, utm_medium, user_id: null })
    }).catch(() => {});
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
            <Route path="/devvorx/admin-1/payment-attempts" element={<AdminPaymentAttempts />} />
            <Route path="/devvorx/admin-1/library" element={<AdminLibrary />} />
            <Route path="/devvorx/admin-1/settings" element={<AdminSettings />} />
            <Route path="/devvorx/admin-1/promotions" element={<AdminPromotions />} />
            <Route path="/devvorx/admin-1/logs" element={<AdminLogs />} />
            <Route path="/devvorx/admin-1/stats" element={<AdminStats />} />
            <Route path="/devvorx/admin-1/notifications" element={<AdminNotifications />} />
            <Route path="/devvorx/admin-1/pricing" element={<AdminPricing />} />
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
      <NotificationProvider>
        <AudioProvider>
          <FloatingInstallButton />
          <AppContent />
        </AudioProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
