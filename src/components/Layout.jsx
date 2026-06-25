import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'white'}}>Chargement...</div>;
  }

  // Allow payment-success and payment-failed pages even if the user session is lost during redirect
  if (!user && location.pathname !== '/payment-success' && location.pathname !== '/payment-failed') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <TopBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default Layout;
