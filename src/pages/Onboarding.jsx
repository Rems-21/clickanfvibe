import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, Zap, Settings, Lock, Heart } from 'lucide-react';
import './Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-topbar">
        <div className="landing-logo">
          <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span style={{width: '3px', height: '12px', background: 'var(--gradient-primary)', borderRadius: '3px'}}></span>
            <span style={{width: '3px', height: '20px', background: 'var(--gradient-primary)', borderRadius: '3px'}}></span>
            <span style={{width: '3px', height: '14px', background: 'var(--gradient-primary)', borderRadius: '3px'}}></span>
            <Music size={24} color="#FF3366" style={{marginLeft: '2px'}} />
          </div>
          <span>Click <span className="amp">&</span> Vibe</span>
        </div>
        <div className="landing-badge">
          <Sparkles size={14} color="#C466FF" /> L'IA au service de ta créativité
        </div>
      </div>

      <div className="landing-hero">
        <div className="landing-content">
          <h1 className="landing-title">Crée des chansons <br/><span className="text-gradient">incroyables</span><br/>grâce à l'IA.</h1>
          <p className="landing-subtitle">Décris simplement ton idée, choisis ton style musical et laisse Click & Vibe composer une chanson unique en quelques secondes.</p>
          
          <div className="landing-buttons">
            <button className="btn-primary-glow" onClick={() => navigate('/home')}><Sparkles size={18}/> Commencer &rarr;</button>
            <button className="btn-outline-glow" onClick={() => navigate('/login')}>Se connecter &rarr;</button>
          </div>
        </div>
        
        <div className="landing-image-wrapper">
           <div className="landing-glow-circle"></div>
           <img src="/hero_headphones.png" alt="Hero" className="landing-hero-img" />
        </div>
      </div>

      <div className="landing-features">
         <div className="feature">
            <div className="f-icon bg-pink"><Zap size={20} color="#FF3366"/></div>
            <div className="f-text"><h4>Rapide</h4><p>Ta chanson en quelques secondes</p></div>
         </div>
         <div className="feature">
            <div className="f-icon bg-purple"><Sparkles size={20} color="#9933FF"/></div>
            <div className="f-text"><h4>Personnalisé</h4><p>Tous les styles, toutes les ambiances</p></div>
         </div>
         <div className="feature">
            <div className="f-icon bg-violet"><Settings size={20} color="#C466FF"/></div>
            <div className="f-text"><h4>IA Avancée</h4><p>Une technologie de pointe au service de ta créativité</p></div>
         </div>
         <div className="feature">
            <div className="f-icon bg-blue"><Lock size={20} color="#33CCFF"/></div>
            <div className="f-text"><h4>Sécurisé</h4><p>Tes créations t'appartiennent à 100%</p></div>
         </div>
      </div>

      <div className="landing-footer">
        <div className="avatars">
          {/* using generic ui-avatars for the placeholder community images */}
          <img className="avatar" src="https://ui-avatars.com/api/?name=J&background=111&color=fff" alt="User" />
          <img className="avatar" src="https://ui-avatars.com/api/?name=M&background=333&color=fff" alt="User" />
          <img className="avatar" src="https://ui-avatars.com/api/?name=S&background=111&color=fff" alt="User" />
          <img className="avatar" src="https://ui-avatars.com/api/?name=A&background=333&color=fff" alt="User" />
        </div>
        <div className="footer-text"><Heart size={16} color="#FF3366" fill="#FF3366"/> Plus de 10 000 chansons créées par notre communauté</div>
      </div>
    </div>
  );
}

export default Onboarding;
