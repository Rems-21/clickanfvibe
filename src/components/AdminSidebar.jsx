import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Music, Users, CreditCard, ShoppingCart, Library, Settings, LogOut, Bell, User as UserIcon, X, Megaphone, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../pages/admin/AdminDashboard.css';

function AdminSidebar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/devvorx/admin-1', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
    { path: '/devvorx/admin-1/stats', icon: <LayoutDashboard size={20} />, label: 'Statistiques' },
    { path: '/devvorx/admin-1/generations', icon: <Music size={20} />, label: 'Générations' },
    { path: '/devvorx/admin-1/users', icon: <Users size={20} />, label: 'Utilisateurs' },
    { path: '/devvorx/admin-1/credits', icon: <CreditCard size={20} />, label: 'Achats de Générations' },
    { path: '/devvorx/admin-1/promotions', icon: <Megaphone size={20} />, label: 'Promotions' },
    { path: '/devvorx/admin-1/library', icon: <Library size={20} />, label: 'Bibliothèque globale' },
    { path: '/devvorx/admin-1/logs', icon: <Terminal size={20} />, label: 'Logs Système' },
    { path: '/devvorx/admin-1/settings', icon: <Settings size={20} />, label: 'Paramètres' },
  ];

  const handleNav = (path) => {
    navigate(path);
    if (closeSidebar) closeSidebar();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/log.png" alt="Click & Vibe Logo" style={{height: 28, width: 'auto'}} />
          <h2>Click & Vibe <span>ADMIN</span></h2>
        </div>
        {isOpen && (
          <button className="mobile-close-btn" onClick={closeSidebar}>
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="admin-nav">
        {menuItems.map((item, index) => (
          <button 
            key={index} 
            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-profile">
          <div className="admin-avatar">
            {user?.profile_picture ? <img src={user.profile_picture} alt="Admin" /> : <UserIcon size={20} />}
          </div>
          <div className="admin-info">
            <h4>{user?.name || 'Administrateur'}</h4>
            <span className="admin-role">Administrateur</span>
            <div className="admin-status">
              <span className="status-dot"></span> En ligne
            </div>
          </div>
        </div>

        <button className="admin-logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
