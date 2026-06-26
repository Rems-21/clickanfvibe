import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/generations" element={<AdminGenerations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/credits" element={<AdminCredits />} />
            <Route path="/admin/library" element={<AdminLibrary />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/promotions" element={<AdminPromotions />} />
          </Route>
        </Route>
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
