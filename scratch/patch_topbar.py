import re

with open('src/components/TopBar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
content = content.replace(
    "import React from 'react';",
    "import React, { useState, useEffect } from 'react';"
)
content = content.replace(
    "import { Search, Bell, Zap } from 'lucide-react';",
    "import { Search, Bell, Zap, Download } from 'lucide-react';"
)

# Add hooks inside TopBar function
old_hooks = """  const { user } = useAuth();
  const navigate = useNavigate();"""

new_hooks = """  const { user } = useAuth();
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
      alert("Pour installer l'application sur votre iPhone/iPad :\\n\\n1. Appuyez sur l'icône Partager (le carré avec une flèche) en bas de l'écran.\\n2. Faites défiler et sélectionnez 'Sur l'écran d'accueil'.");
    }
  };

  const showInstallButton = !isStandalone && (deferredPrompt || isIOS);"""

content = content.replace(old_hooks, new_hooks)

# Add the button in the JSX
old_jsx = """      <div className="topbar-actions">
        <button className="icon-btn-transparent" onClick={() => alert("Aucune notification.")}>"""

new_jsx = """      <div className="topbar-actions">
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
        <button className="icon-btn-transparent" onClick={() => alert("Aucune notification.")}>"""

content = content.replace(old_jsx, new_jsx)

with open('src/components/TopBar.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("TopBar.jsx patched successfully.")
