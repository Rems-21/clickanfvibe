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

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works-section landing-section">
        <h3 className="landing-section-title text-center">Comment ça marche ?</h3>
        <p className="landing-section-subtitle text-center">Crée ton hit en 3 étapes simples</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon"><MessageSquare size={32} color="#FF3366" /></div>
            <h4>Décris ton idée</h4>
            <p>Écris un petit texte, choisis le style (Afro, Rap...) et l'ambiance de ta musique.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon"><Zap size={32} color="#3b82f6" /></div>
            <h4>L'IA compose</h4>
            <p>En quelques secondes, l'intelligence artificielle génère l'instrumental et les paroles.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon"><Share2 size={32} color="#ec4899" /></div>
            <h4>Partage ton Hit</h4>
            <p>Télécharge ton morceau en haute qualité et fais-le écouter à tes amis !</p>
          </div>
        </div>
      </section>

      {/* FEATURES / BENEFITS */}
      <section className="features-section landing-section">
         <h3 className="landing-section-title text-center">Pourquoi utiliser Click & Vibe ?</h3>
         <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"><Star size={24} color="#FFB800" /></div>
              <div>
                <h4>Qualité Studio</h4>
                <p>Des voix ultra-réalistes et des rythmiques parfaitement mixées.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Zap size={24} color="#3b82f6" /></div>
              <div>
                <h4>Ultra Rapide</h4>
                <p>Ta chanson complète générée en moins de 2 minutes chrono.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Trophy size={24} color="#ec4899" /></div>
              <div>
                <h4>Musique Unique</h4>
                <p>100% originale. Chaque génération crée une musique inédite.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><ShieldCheck size={24} color="#10b981" /></div>
              <div>
                <h4>Paiements Locaux</h4>
                <p>Achète des crédits facilement avec Mobile Money dans ton pays.</p>
              </div>
            </div>
         </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section landing-section">
        <h3 className="landing-section-title text-center">Ce qu'ils en pensent</h3>
        <div className="horizontal-scroll" style={{ paddingBottom: '10px' }}>
          <div className="testimonial-card">
            <div className="stars"><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/></div>
            <p className="testimonial-text">"Incroyable ! J'ai créé un beat afrobeat pour mon intro YouTube en 2 clics. La qualité est bluffante."</p>
            <div className="testimonial-author">- Marc D.</div>
          </div>
          <div className="testimonial-card">
            <div className="stars"><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/></div>
            <p className="testimonial-text">"C'est la première fois que je trouve un outil IA qui comprend vraiment la vibe Amapiano. Je recommande !"</p>
            <div className="testimonial-author">- Sarah T.</div>
          </div>
          <div className="testimonial-card">
            <div className="stars"><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/></div>
            <p className="testimonial-text">"Super pratique. J'ai généré une chanson d'anniversaire personnalisée pour ma mère, elle a adoré."</p>
            <div className="testimonial-author">- Eric M.</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section landing-section">
        <h3 className="landing-section-title text-center">Questions fréquentes</h3>
        <div className="faq-container">
          <div className={`faq-item ${openFaq === 0 ? 'open' : ''}`} onClick={() => toggleFaq(0)}>
            <div className="faq-question">
              <h4>Puis-je monétiser la musique créée sur YouTube ou Spotify ?</h4>
              <ChevronDown size={20} className="faq-icon" />
            </div>
            <div className="faq-answer">
              <p>Oui ! Les chansons générées avec Click & Vibe vous appartiennent. Vous pouvez les utiliser librement pour vos vidéos YouTube, podcasts, ou même les distribuer sur les plateformes de streaming.</p>
            </div>
          </div>
          <div className={`faq-item ${openFaq === 1 ? 'open' : ''}`} onClick={() => toggleFaq(1)}>
            <div className="faq-question">
              <h4>Quels sont les moyens de paiement acceptés ?</h4>
              <ChevronDown size={20} className="faq-icon" />
            </div>
            <div className="faq-answer">
              <p>Nous acceptons les paiements via Mobile Money (Orange, MTN, Wave, Moov...) dans plusieurs pays d'Afrique, ainsi que les paiements par carte bancaire ou PayPal.</p>
            </div>
          </div>
          <div className={`faq-item ${openFaq === 2 ? 'open' : ''}`} onClick={() => toggleFaq(2)}>
            <div className="faq-question">
              <h4>Combien coûte la génération d'une chanson ?</h4>
              <ChevronDown size={20} className="faq-icon" />
            </div>
            <div className="faq-answer">
              <p>Chaque génération consomme 1 crédit (environ 150 FCFA selon votre pack). Des packs de crédits sont disponibles pour rendre le coût par chanson encore moins cher.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final-section landing-section" style={{ paddingBottom: '80px' }}>
        <div className="cta-final-card glass-panel" style={{textAlign: 'center', padding: '50px 20px', borderRadius: '24px', background: 'linear-gradient(145deg, rgba(255, 51, 102, 0.1) 0%, rgba(153, 51, 255, 0.1) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <h2 style={{fontSize: '2rem', marginBottom: '15px', color: 'white'}}>Prêt à créer le prochain hit ?</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px', fontSize: '1.1rem'}}>Rejoins des milliers de créateurs et donne vie à tes idées musicales dès aujourd'hui.</p>
          <button className="btn-primary-glow" onClick={() => navigate('/home')} style={{padding: '16px 36px', fontSize: '1.2rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px'}}>
            <Music size={24} /> Commencer maintenant
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
