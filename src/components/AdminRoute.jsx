import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0A0A0A', color: 'white' }}>Chargement...</div>;
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
