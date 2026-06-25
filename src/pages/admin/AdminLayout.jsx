import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Mobile Topbar */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-brand">Click & Vibe <span>ADMIN</span></div>
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={24} />
        </button>
      </div>
      
      {/* Overlay to close sidebar on mobile */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <AdminSidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
