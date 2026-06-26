import React, { useState, useEffect } from 'react';
import { Search, Bell, Zap, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      alert("Pour installer l'application sur votre iPhone/iPad :\n\n1. Appuyez sur l'icône Partager (le carré avec une flèche) en bas de l'écran.\n2. Faites défiler et sélectionnez 'Sur l'écran d'accueil'.");
    }
  };

  const showInstallButton = !isStandalone && (deferredPrompt || isIOS);

  return (
    <header className="app-topbar">
      <div className="topbar-search">
        <Search size={18} color="rgba(255,255,255,0.4)" />
        <input type="text" placeholder="Rechercher..." />
        <span className="search-shortcut">Ctrl K</span>
      </div>

      <div className="topbar-actions">
        {showInstallButton && (
          <button 
            onClick={handleInstallClick}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              background: 'linear-gradient(135deg, #a855f7, #ec4899)', 
              color: 'white', border: 'none', padding: '6px 12px', 
              borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' 
            }}
          >
            <Download size={14} />
            <span className="hide-on-mobile-small">Installer</span>
          </button>
        )}
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
