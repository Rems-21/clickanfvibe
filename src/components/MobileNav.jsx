import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Music, Compass, User, Zap } from 'lucide-react';
import './MobileNav.css';

function MobileNav() {
  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/home" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Accueil</span>
      </NavLink>
      <NavLink to="/create" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <Music size={24} />
        <span>Créer</span>
      </NavLink>
      <NavLink to="/credits" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <Zap size={24} />
        <span>Recharger</span>
      </NavLink>
      <NavLink to="/explore" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <Compass size={24} />
        <span>Explorer</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}

export default MobileNav;
