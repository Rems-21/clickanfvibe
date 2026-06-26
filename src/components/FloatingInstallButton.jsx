import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './FloatingInstallButton.css';

function FloatingInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(window.__deferredPrompt || null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Also check if it was captured before this component mounted
    if (window.__deferredPrompt) {
      setDeferredPrompt(window.__deferredPrompt);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        window.__deferredPrompt = null;
        setIsVisible(false);
      }
    } else if (isIOS) {
      alert("Pour installer l'application sur votre iPhone/iPad :

1. Appuyez sur l'icône Partager (le carré avec une flèche) en bas de l'écran.
2. Faites défiler et sélectionnez 'Sur l'écran d'accueil'.");
    } else {
      alert("Pour installer l'application :

Cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur, ou ouvrez le menu de votre navigateur et sélectionnez 'Ajouter à l'écran d'accueil' / 'Installer l'application'.");
    }
  };

  // On affiche le bouton si on n'est pas en standalone et que l'utilisateur ne l'a pas fermé
  const showInstallButton = !isStandalone && isVisible;

  if (!showInstallButton) return null;

  return (
    <div className="floating-install-wrapper">
      <button className="floating-install-btn" onClick={handleInstallClick}>
        <Download size={20} />
        <span>Installer l'App</span>
      </button>
      <button className="floating-install-close" onClick={() => setIsVisible(false)}>
        <X size={14} />
      </button>
    </div>
  );
}

export default FloatingInstallButton;
