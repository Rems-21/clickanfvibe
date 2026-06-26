import React from 'react';
import { Settings, Wrench, Sparkles } from 'lucide-react';
import './Maintenance.css';

function Maintenance() {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-icon-wrapper">
          <Settings className="maintenance-icon spin" size={48} color="#FF3366" />
          <Wrench className="maintenance-icon wrench" size={32} color="#00F0FF" />
        </div>
        
        <h1 className="maintenance-title">Mode Maintenance</h1>
        <p className="maintenance-subtitle">
          Click & Vibe s'offre une petite beauté ! <Sparkles size={18} style={{display:'inline', verticalAlign:'middle'}} color="#FFD700" />
        </p>
        
        <div className="maintenance-card">
          <p>
            Nous sommes actuellement en train d'améliorer l'application pour vous offrir une expérience encore plus exceptionnelle. 
            Les serveurs sont temporairement en pause.
          </p>
          <p className="highlight-text">
            Revenez dans quelques instants, la musique va bientôt reprendre ! 🎵
          </p>
        </div>
        
      </div>
      
      <div className="maintenance-bg-glow glow-pink"></div>
      <div className="maintenance-bg-glow glow-blue"></div>
    </div>
  );
}

export default Maintenance;
