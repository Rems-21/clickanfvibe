import React, { useState, useEffect } from 'react';
import { Search, Bell, Zap, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();


  return (
    <header className="app-topbar">
      <div className="topbar-search">
        <Search size={18} color="rgba(255,255,255,0.4)" />
        <input type="text" placeholder="Rechercher..." />
        <span className="search-shortcut">Ctrl K</span>
      </div>

      <div className="topbar-actions">

        <button className="icon-btn-transparent" onClick={() => alert("Aucune notification.")}>
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="credits-badge-top" onClick={() => navigate('/credits')}>
          <Zap size={14} color="#FF3366" fill="#FF3366" />
          <span>{user ? user.credits : 0} Gens</span>
        </button>
      </div>
    </header>
  );
}

export default TopBar;
