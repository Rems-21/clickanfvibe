import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useEffect import if not present
if "import { useEffect } from 'react';" not in content:
    content = content.replace("import { Routes, Route, useLocation } from 'react-router-dom';", "import React, { useEffect } from 'react';\nimport { Routes, Route, useLocation } from 'react-router-dom';")

# Add the effect inside AppContent
hooks_pattern = r"""function AppContent\(\) \{
  const location = useLocation\(\);
  const isAdminRoute = location\.pathname\.startsWith\('/admin'\);"""

new_hooks = """function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Notify Facebook Pixel on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);"""

content = re.sub(hooks_pattern, new_hooks, content)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("App.jsx patched successfully.")
