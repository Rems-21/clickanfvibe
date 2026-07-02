import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, Zap, Settings, Lock, Heart, MessageSquare, Share2, Star, Trophy, ShieldCheck, ChevronDown } from 'lucide-react';
import './Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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

      <div className="landing-features" style={{marginBottom: '60px'}}>
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

            {/* PREMIUM PAYMENT SECTION */}
      <section className="premium-payment-section landing-section">
        <div className="premium-header text-center">
          <h2 className="premium-section-title">Votre passerelle vers <span className="text-accent-orange">15 marchés</span> africains</h2>
          <p className="landing-section-subtitle text-center">Une seule intégration pour créer et accepter les paiements Mobile Money dans toute l'Afrique francophone.</p>
          
          <div className="premium-stats-badges">
            <div className="stat-badge">
              <div className="stat-icon-wrapper orange"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
              <div className="stat-text"><strong>15</strong> Pays couverts</div>
            </div>
            <div className="stat-badge">
              <div className="stat-icon-wrapper orange"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
              <div className="stat-text"><strong>14+</strong> Opérateurs</div>
            </div>
          </div>
        </div>

        <div className="premium-map-card">
          <div className="map-card-header">
            <div className="region-selector">
              <span className="region-radio active"><span className="radio-dot orange"></span> Ouest</span>
              <span className="region-radio"><span className="radio-dot green"></span> Centre</span>
            </div>
          </div>
          
          <div className="map-regions-container">
            {/* OUEST */}
            <div className="region-block">
              <div className="region-header-title">
                <span className="title-text">AFRIQUE DE L'OUEST</span> 
                <span className="title-count orange">10</span>
              </div>
              <div className="pills-grid">
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Bénin <span className="pill-count">4</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Burkina Faso <span className="pill-count">3</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Côte d'Ivoire <span className="pill-count">4</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Gambie <span className="pill-count">1</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Guinée <span className="pill-count">2</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Mali <span className="pill-count">2</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Sénégal <span className="pill-count">4</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Togo <span className="pill-count">2</span></div>
              </div>
            </div>
            
            {/* CENTRE */}
            <div className="region-block center-region">
              <div className="region-header-title">
                <span className="title-text">AFRIQUE CENTRALE</span> 
                <span className="title-count dark">5</span>
              </div>
              <div className="pills-grid">
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Cameroun <span className="pill-count dark">2</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Congo Brazza <span className="pill-count dark">2</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Gabon <span className="pill-count dark">2</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> R.D.C <span className="pill-count dark">5</span></div>
                <div className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Tchad <span className="pill-count dark">2</span></div>
              </div>
              <div className="region-footer">
                <span className="footer-label">Total opérateurs</span>
                <span className="footer-value">13+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - REDESIGNED */}
      <section className="premium-features-section landing-section">
        <h3 className="premium-section-title text-center">La création musicale <span className="text-accent-pink">réinventée</span></h3>
        <div className="premium-cards-grid">
          <div className="premium-card">
            <div className="p-card-icon"><MessageSquare size={28} /></div>
            <h4>1. Votre idée</h4>
            <p>Un simple texte suffit pour donner la direction. Vous maîtrisez le style et le thème.</p>
          </div>
          <div className="premium-card">
            <div className="p-card-icon"><Zap size={28} /></div>
            <h4>2. Notre IA</h4>
            <p>Le moteur d'IA génère une composition studio complète (beat, voix, mixage).</p>
          </div>
          <div className="premium-card">
            <div className="p-card-icon"><Share2 size={28} /></div>
            <h4>3. Votre Hit</h4>
            <p>Exportez et monétisez votre création sans aucune restriction de droits.</p>
          </div>
        </div>
      </section>

      {/* FAQ - REDESIGNED */}
      <section className="premium-faq-section landing-section">
        <h3 className="premium-section-title text-center">Questions fréquentes</h3>
        <div className="premium-faq-container">
          <div className={`p-faq-item ${openFaq === 0 ? 'open' : ''}`} onClick={() => toggleFaq(0)}>
            <div className="p-faq-question">
              <h4>Droits d'auteur et Monétisation ?</h4>
              <ChevronDown size={20} className="p-faq-icon" />
            </div>
            <div className="p-faq-answer">
              <p>Vous possédez 100% des droits commerciaux sur les chansons que vous générez. Diffusez-les sur Spotify, Apple Music, ou YouTube en toute tranquillité.</p>
            </div>
          </div>
          <div className={`p-faq-item ${openFaq === 1 ? 'open' : ''}`} onClick={() => toggleFaq(1)}>
            <div className="p-faq-question">
              <h4>Comment acheter des crédits ?</h4>
              <ChevronDown size={20} className="p-faq-icon" />
            </div>
            <div className="p-faq-answer">
              <p>Notre intégration locale permet les paiements directs via Orange Money, MTN, Moov, Wave et Airtel selon votre pays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL - REDESIGNED */}
      <section className="premium-cta-section landing-section" style={{ paddingBottom: '80px' }}>
        <div className="premium-cta-card">
          <h2>Prêt à lancer votre carrière ?</h2>
          <p>Le futur de la musique est entre vos mains. Commencez dès maintenant.</p>
          <button className="btn-premium-action" onClick={() => navigate('/home')}>
            Créer ma première chanson <Zap size={18} />
          </button>
        </div>
      </section>

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
