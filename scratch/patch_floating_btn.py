import re

with open('src/components/FloatingInstallButton.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make it capture window.__deferredPrompt and remove the strict condition to hide
hooks_pattern = r"""  const \[deferredPrompt, setDeferredPrompt\] = useState\(null\);
  const \[isIOS, setIsIOS\] = useState\(false\);
  const \[isStandalone, setIsStandalone\] = useState\(false\);
  const \[isVisible, setIsVisible\] = useState\(true\);

  useEffect\(\(\) => \{
    // Vérifier si l'app est déjà installée \(PWA standalone\)
    if \(window\.matchMedia\('\(display-mode: standalone\)'\)\.matches \|\| window\.navigator\.standalone === true\) \{
      setIsStandalone\(true\);
    \}

    // Détection iOS
    const userAgent = window\.navigator\.userAgent\.toLowerCase\(\);
    setIsIOS\(/iphone\|ipad\|ipod/\.test\(userAgent\)\);

    const handleBeforeInstallPrompt = \(e\) => \{
      e\.preventDefault\(\);
      setDeferredPrompt\(e\);
    \};

    window\.addEventListener\('beforeinstallprompt', handleBeforeInstallPrompt\);
    return \(\) => window\.removeEventListener\('beforeinstallprompt', handleBeforeInstallPrompt\);
  \}, \[\]\);

  const handleInstallClick = async \(\) => \{
    if \(deferredPrompt\) \{
      deferredPrompt\.prompt\(\);
      const \{ outcome \} = await deferredPrompt\.userChoice;
      if \(outcome === 'accepted'\) \{
        setDeferredPrompt\(null\);
        setIsVisible\(false\);
      \}
    \} else if \(isIOS\) \{
      alert\("Pour installer l'application sur votre iPhone/iPad :\\n\\n1\. Appuyez sur l'icône Partager \(le carré avec une flèche\) en bas de l'écran\.\\n2\. Faites défiler et sélectionnez 'Sur l'écran d'accueil'\."\);
    \}
  \};

  const showInstallButton = !isStandalone && \(deferredPrompt \|\| isIOS\) && isVisible;"""

new_hooks = """  const [deferredPrompt, setDeferredPrompt] = useState(window.__deferredPrompt || null);
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
      alert("Pour installer l'application sur votre iPhone/iPad :\\n\\n1. Appuyez sur l'icône Partager (le carré avec une flèche) en bas de l'écran.\\n2. Faites défiler et sélectionnez 'Sur l'écran d'accueil'.");
    } else {
      alert("Pour installer l'application :\\n\\nCliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur, ou ouvrez le menu de votre navigateur et sélectionnez 'Ajouter à l'écran d'accueil' / 'Installer l'application'.");
    }
  };

  // On affiche le bouton si on n'est pas en standalone et que l'utilisateur ne l'a pas fermé
  const showInstallButton = !isStandalone && isVisible;"""

content = re.sub(hooks_pattern, new_hooks, content)

with open('src/components/FloatingInstallButton.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("FloatingInstallButton patched successfully.")
