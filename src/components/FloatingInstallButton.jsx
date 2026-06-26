import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './FloatingInstallButton.css';

function FloatingInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Vérifier si l'app est déjà installée (PWA standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // Détection iOS
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
        setIsVisible(false);
      }
    } else if (isIOS) {
      alert("Pour installer l'application sur votre iPhone/iPad :\n\n1. Appuyez sur l'icône Partager (le carré avec une flèche) en bas de l'écran.\n2. Faites défiler et sélectionnez 'Sur l'écran d'accueil'.");
    }
  };

  const showInstallButton = !isStandalone && (deferredPrompt || isIOS) && isVisible;

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
