import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // We configured autoUpdate, so it should auto refresh, but just in case
    console.log("PWA update available!");
  },
  onOfflineReady() {
    console.log("PWA is ready to work offline.");
  },
});

// Remplace cette clé par ton propre ID Client Google !
const GOOGLE_CLIENT_ID = "100127777217-pakkrg0g9545vufm398u53bdrffh92fd.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
