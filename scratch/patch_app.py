with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import Maintenance from './pages/Maintenance';"
if import_statement not in content:
    content = content.replace("import Help from './pages/Help';", "import Help from './pages/Help';\nimport Maintenance from './pages/Maintenance';")

old_app_content = """function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Notify Facebook Pixel on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);

  return ("""

new_app_content = """function AppContent() {
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
  }

  return ("""

if old_app_content in content:
    content = content.replace(old_app_content, new_app_content)
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("App.jsx patched successfully.")
else:
    print("Could not find old AppContent block.")
