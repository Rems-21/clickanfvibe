import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Music, Library, Compass, Zap, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/log.png" alt="Click & Vibe Logo" style={{height: 28, width: 'auto'}} />
        <div className="logo-text">
          <span>Click & Vibe</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/home" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Home size={20} /> Accueil
        </NavLink>
        <NavLink to="/create" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Music size={20} /> Créer
        </NavLink>
        <NavLink to="/history" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Library size={20} /> Bibliothèque
        </NavLink>
        <NavLink to="/explore" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Compass size={20} /> Explorer
        </NavLink>
        <NavLink to="/credits" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Zap size={20} /> Recharger
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-credits-card">
          <div className="credits-header">
            <Zap size={16} color="#FF3366" />
            <span className="credits-amount">{user ? user.credits : 0} Gens</span>
          </div>
          <p className="credits-desc">générations restantes</p>
          <button className="btn-primary-gradient small-full" onClick={() => navigate('/credits')}>Recharger</button>
        </div>

        {user && (
          <div className="sidebar-profile" onClick={() => navigate('/profile')}>
            <img src={user.profile_picture || "/hero_bg.png"} alt="User" className="profile-img" />
            <div className="profile-info">
              <span className="profile-name">{user.name}</span>
              <span className="profile-link">Voir profil &rsaquo;</span>
            </div>
            <button className="icon-btn-transparent"><MoreVertical size={16} /></button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
