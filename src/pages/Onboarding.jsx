import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, Zap, Settings, Lock, Heart, MessageSquare, Share2, Star, Trophy, ShieldCheck, ChevronDown, Globe, Smartphone, Users, Mic2, Headphones, ArrowRight, MapPin } from 'lucide-react';
import './Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const testimonials = [
    { text: "Incroyable ! J'ai créé un beat afrobeat pour mon intro YouTube en 2 clics. Le paiement par Orange Money a été instantané. Je recommande à 100% !", name: "Marc D.", role: "Créateur de contenu · Dakar", bg: "FF3366" },
    { text: "C'est la première fois que je trouve un outil IA qui comprend vraiment la vibe Amapiano. Je recommande !", name: "Sarah T.", role: "Artiste indépendante · Abidjan", bg: "9933FF" },
    { text: "Super pratique ! Mes sons sont uniques et la qualité studio est bluffante. Le support est aussi très réactif.", name: "Eric M.", role: "Producteur · Douala", bg: "0ea5e9" },
    { text: "J'utilise Click & Vibe pour tous mes projets. La génération est ultra rapide et le résultat professionnel.", name: "Binta K.", role: "Influenceuse · Bamako", bg: "c084fc" },
  ];

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

      <section className="premium-payment-section landing-section">
        <div className="premium-header text-center">
          <h2 className="premium-section-title">Créez et payez <span className="text-gradient">sans carte bancaire</span></h2>
          <p className="landing-section-subtitle text-center">Click & Vibe intègre les paiements Mobile Money. Une seule plateforme pour créer vos hits et payer facilement dans 15 pays africains.</p>
          <div className="premium-stats-badges">
            <div className="stat-badge">
              <div className="stat-icon-wrapper pink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
              <div className="stat-text"><strong>15</strong> Pays couverts</div>
            </div>
            <div className="stat-badge">
              <div className="stat-icon-wrapper pink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
              <div className="stat-text"><strong>14+</strong> Opérateurs</div>
            </div>
          </div>
        </div>
        <div className="premium-map-card">
          <div className="map-card-header">
            <div className="region-selector">
              <span className="region-radio active"><span className="radio-dot pink"></span> Ouest</span>
              <span className="region-radio"><span className="radio-dot green"></span> Centre</span>
            </div>
          </div>
          <div className="map-regions-container">
            <div className="region-block">
              <div className="region-header-title">
                <span className="title-text">AFRIQUE DE L'OUEST</span>
                <span className="title-count pink">10</span>
              </div>
              <div className="pills-grid">
                {['Bénin','Burkina Faso','Côte d\'Ivoire','Gambie','Guinée','Mali','Sénégal','Togo','Niger','Mauritanie'].map((c,i) => (
                  <div key={i} className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> {c}</div>
                ))}
              </div>
            </div>
            <div className="region-block center-region">
              <div className="region-header-title">
                <span className="title-text">AFRIQUE CENTRALE</span>
                <span className="title-count dark">4</span>
              </div>
              <div className="pills-grid">
                {['Cameroun','Congo Brazza','Gabon','R.D.C'].map((c,i) => (
                  <div key={i} className="country-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> {c}</div>
                ))}
              </div>
              <div className="region-footer">
                <span className="footer-label">Total opérateurs</span>
                <span className="footer-value">13+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="operators-banner">
        <div className="operators-track">
          {['Orange Money','MTN MoMo','Wave','Moov Money','Airtel Money','Free Money','Togocel','Expresso','YAS','Uba'].concat(
           ['Orange Money','MTN MoMo','Wave','Moov Money','Airtel Money','Free Money','Togocel','Expresso','YAS','Uba']
          ).map((op, i) => (
            <span key={i} className="op-pill">{op}</span>
          ))}
        </div>
      </div>

      <section className="how-it-works-section landing-section">
        <div className="section-label-pill"><Zap size={14}/> Comment ça marche</div>
        <h3 className="premium-section-title text-center">De l'idée au <span className="text-gradient">hit en 3 étapes</span></h3>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-img" style={{backgroundImage:"url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=700')"}}></div>
            <div className="how-step-content">
              <div className="step-num">01</div>
              <h4>Décrivez votre idée</h4>
              <p>Un simple texte suffit. Dites-nous le style, l'ambiance, les paroles ou l'émotion que vous souhaitez transmettre.</p>
              <div className="step-tags"><span>Afrobeat</span><span>Coupé-Décalé</span><span>Amapiano</span><span>Ndombolo</span></div>
            </div>
          </div>
          <div className="how-step reverse">
            <div className="how-step-img" style={{backgroundImage:"url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=700')"}}></div>
            <div className="how-step-content">
              <div className="step-num">02</div>
              <h4>Notre IA compose</h4>
              <p>Notre moteur analyse votre demande et crée une composition studio complète : beat, voix, harmonie et mixage professionnel.</p>
              <div className="step-tags"><span>⚡ En quelques secondes</span><span>🎚 Qualité Studio</span></div>
            </div>
          </div>
          <div className="how-step">
            <div className="how-step-img" style={{backgroundImage:"url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=700')"}}></div>
            <div className="how-step-content">
              <div className="step-num">03</div>
              <h4>Exportez et monétisez</h4>
              <p>Téléchargez votre titre en haute qualité. Vos droits, votre musique. Publiez sur les plateformes mondiales.</p>
              <div className="step-tags"><span>Spotify</span><span>Apple Music</span><span>YouTube</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-item"><span className="stat-num">5 000+</span><span className="stat-desc">Chansons créées</span></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><span className="stat-num">12</span><span className="stat-desc">Pays couverts</span></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><span className="stat-num">23</span><span className="stat-desc">Opérateurs Mobile Money</span></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><span className="stat-num">4.9 ⭐</span><span className="stat-desc">Note moyenne</span></div>
      </div>

      <section className="premium-testimonials-section landing-section">
        <div className="section-label-pill"><Star size={14}/> Témoignages</div>
        <h3 className="premium-section-title text-center">Ce qu'ils en pensent</h3>
        <div className="testimonials-grid">
          <div className="p-testimonial-card featured">
            <div className="stars"><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/></div>
            <p>"Incroyable ! J'ai créé un beat afrobeat pour mon intro YouTube en 2 clics. Le paiement par Orange Money a été instantané. Je recommande à 100% !"</p>
            <div className="author-info">
              <img src="https://ui-avatars.com/api/?name=Marc+D&background=FF3366&color=fff&bold=true" alt="Marc" className="author-avatar" />
              <div><div className="author-name">Marc D.</div><div className="author-role">Créateur de contenu · Dakar</div></div>
            </div>
          </div>
          <div className="p-testimonial-card">
            <div className="stars"><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/></div>
            <p>"C'est la première fois que je trouve un outil IA qui comprend vraiment la vibe Amapiano. Je recommande !"</p>
            <div className="author-info">
              <img src="https://ui-avatars.com/api/?name=Sarah+T&background=9933FF&color=fff&bold=true" alt="Sarah" className="author-avatar" />
              <div><div className="author-name">Sarah T.</div><div className="author-role">Artiste indépendante · Abidjan</div></div>
            </div>
          </div>
          <div className="p-testimonial-card">
            <div className="stars"><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/><Star size={16} fill="#FFB800" color="#FFB800"/></div>
            <p>"Super pratique ! Mes sons sont uniques et la qualité studio est bluffante. Le support est aussi très réactif."</p>
            <div className="author-info">
              <img src="https://ui-avatars.com/api/?name=Eric+M&background=0ea5e9&color=fff&bold=true" alt="Eric" className="author-avatar" />
              <div><div className="author-name">Eric M.</div><div className="author-role">Producteur · Douala</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-faq-section landing-section">
        <div className="section-label-pill"><MessageSquare size={14}/> FAQ</div>
        <h3 className="premium-section-title text-center">Questions fréquentes</h3>
        <div className="premium-faq-container">
          {[
            {q:"Droits d'auteur et Monétisation ?", a:"Vous possédez 100% des droits commerciaux sur les chansons que vous générez. Diffusez-les sur Spotify, Apple Music, ou YouTube en toute tranquillité."},
            {q:"Comment acheter des crédits sans carte ?", a:"Notre intégration permet les paiements directs via Orange Money, MTN, Moov, Wave et Airtel selon votre pays."},
            {q:"Quels styles musicaux sont disponibles ?", a:"Afrobeat, Coupé-Décalé, Amapiano, Ndombolo, Bongo Flava, Highlife, Afropop et bien d'autres styles africains et internationaux."},
            {q:"Puis-je modifier ma chanson après génération ?", a:"Oui ! Vous pouvez régénérer des sections, changer le tempo, le style vocal ou les paroles autant de fois que nécessaire."},
          ].map((item, i) => (
            <div key={i} className={`p-faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => toggleFaq(i)}>
              <div className="p-faq-question">
                <h4>{item.q}</h4>
                <ChevronDown size={20} className="p-faq-icon" />
              </div>
              <div className="p-faq-answer"><p>{item.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-cta-section landing-section" style={{ paddingBottom: '80px' }}>
        <div className="premium-cta-card with-bg" style={{backgroundImage:"linear-gradient(rgba(5,5,10,0.82), rgba(15,23,42,0.97)), url('https://images.unsplash.com/photo-1493225457124-a1a2a5f5cb46?q=80&w=1400')", backgroundSize:"cover", backgroundPosition:"center"}}>
          <div className="cta-badge"><Trophy size={16}/> Rejoignez 10 000+ artistes</div>
          <h2>Prêt à lancer votre carrière ?</h2>
          <p>Le futur de la musique africaine est entre vos mains.<br/>Commencez gratuitement dès aujourd'hui.</p>
          <div className="cta-buttons">
            <button className="btn-premium-action" onClick={() => navigate('/home')}><Sparkles size={18}/> Créer ma première chanson</button>
            <button className="btn-premium-secondary" onClick={() => navigate('/login')}>Se connecter →</button>
          </div>
          <div className="cta-trust">
            <span>✓ Sans carte bancaire</span>
            <span>✓ Mobile Money accepté</span>
            <span>✓ 100% vos droits</span>
          </div>
        </div>
      </section>

      <div className="landing-footer">
        <div className="avatars">
          <img className="avatar" src="https://ui-avatars.com/api/?name=J&background=FF3366&color=fff" alt="User" />
          <img className="avatar" src="https://ui-avatars.com/api/?name=M&background=9933FF&color=fff" alt="User" />
          <img className="avatar" src="https://ui-avatars.com/api/?name=S&background=0ea5e9&color=fff" alt="User" />
          <img className="avatar" src="https://ui-avatars.com/api/?name=A&background=FF3366&color=fff" alt="User" />
        </div>
        <div className="footer-text"><Heart size={16} color="#FF3366" fill="#FF3366"/> Plus de 5 000 chansons créées par notre communauté</div>
      </div>
    </div>
  );
}

export default Onboarding;
