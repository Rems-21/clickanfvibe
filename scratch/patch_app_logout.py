with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_app_content = """function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { user, loading: authLoading } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    // Fetch public config
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setMaintenance(data.maintenance_mode);
        setConfigLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch config", err);
        setConfigLoading(false);
      });
  }, []);

  useEffect(() => {
    // Notify Facebook Pixel on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);

  // Handle Maintenance Mode
  if (!configLoading && !authLoading) {
    if (maintenance && (!user || user.role !== 'admin') && location.pathname !== '/login') {
      return <Maintenance />;
    }
  }"""

new_app_content = """function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { user, loading: authLoading, logout } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    // Fetch public config
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setMaintenance(data.maintenance_mode);
        setConfigLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch config", err);
        setConfigLoading(false);
      });
  }, []);

  useEffect(() => {
    // Notify Facebook Pixel on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Déconnexion forcée des utilisateurs non-admin si la maintenance est active
    if (!configLoading && !authLoading) {
      if (maintenance && user && user.role !== 'admin') {
        logout();
      }
    }
  }, [maintenance, user, configLoading, authLoading, logout]);

  // Handle Maintenance Mode
  if (!configLoading && !authLoading) {
    if (maintenance && (!user || user.role !== 'admin') && location.pathname !== '/login') {
      return <Maintenance />;
    }
  }"""

if old_app_content in content:
    content = content.replace(old_app_content, new_app_content)
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("App.jsx patched successfully for auto-logout.")
else:
    print("Could not find old AppContent block.")
