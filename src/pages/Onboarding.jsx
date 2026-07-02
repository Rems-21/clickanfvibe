import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, Zap, Settings, Lock, Heart, MessageSquare, Share2, Star, Trophy, ShieldCheck, ChevronDown, Globe, Smartphone, Users, Mic2, Headphones, ArrowRight, MapPin, Play, Download, Camera } from 'lucide-react';
import './Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const testimonials = [
    { text: "J'ai offert une chanson à ma femme pour notre anniversaire de mariage. Elle a pleuré de joie ! Le paiement par Orange Money était instantané. Merci Click & Vibe !", name: "Kofi A.", role: "Cadeau de mariage · Accra", bg: "FF3366" },
    { text: "Pour les 60 ans de ma maman, j'ai commandé une chanson personnalisée avec son prénom et toute notre histoire. Elle l'écoute encore tous les jours !", name: "Aminata S.", role: "Cadeau d'anniversaire · Dakar", bg: "9933FF" },
    { text: "J'ai fait une déclaration d'amour musicale à ma petite amie. Elle a dit oui ! Sérieusement, c'est le meilleur outil pour surprendre quelqu'un.", name: "Jean-Paul M.", role: "Déclaration d'amour · Douala", bg: "0ea5e9" },
    { text: "Nous avons utilisé Click & Vibe pour le deuil de notre père. La chanson d'hommage était tellement touchante. Toute la famille a été émue.", name: "Binta K.", role: "Chanson d'hommage · Bamako", bg: "c084fc" },
    { text: "J'ai composé un hit afrobeat pour la naissance de mon neveu. C'était le cadeau le plus original de la fête !", name: "Cédric L.", role: "Cadeau de naissance · Abidjan", bg: "FFB800" },
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
          <Sparkles size={14} color="#C466FF" /> Cadeaux musicaux personnalisés par IA
        </div>
      </div>

      <div className="landing-hero">
        <div className="landing-content">
          <h1 className="landing-title">Offrez une chanson<br/><span className="text-gradient">unique</span><br/>pour chaque instant.</h1>
          <p className="landing-subtitle">Anniversaire, mariage, déclaration d'amour, félicitations... Créez un cadeau musical inoubliable personnalisé en quelques secondes, payable par Mobile Money.</p>
          
          <div className="landing-buttons">
            <button className="btn-primary-glow" onClick={() => navigate('/home')}><Sparkles size={18}/> Créer un cadeau musical →</button>
            <button className="btn-outline-glow" onClick={() => navigate('/login')}>Se connecter &rarr;</button>
          </div>
        </div>
        
        <div className="landing-image-wrapper">
           <div className="landing-glow-circle"></div>
           <img src="/images/hero_headphones_neon_1782389391857.png" alt="Hero" className="landing-hero-img" />
           
           <div className="hero-music-player">
              <div className="player-top">
                 <div className="player-play-btn">
                    <Play size={20} color="#FFF" fill="#FFF" />
                 </div>
                 <div className="player-waveform">
                    <div className="waveform-bars">
                      {[...Array(35)].map((_, i) => (
                        <div key={i} className="w-bar" style={{ height: `${Math.floor(Math.random() * (100 - 20 + 1) + 20)}%` }}></div>
                      ))}
                    </div>
                 </div>
                 <div className="player-time">03:24</div>
              </div>
              <div className="player-info">
                 <h4>Chanson d'amour personnalisée</h4>
                 <p>Pour celle qui fait battre mon cœur.</p>
              </div>
              <div className="player-divider"></div>
              <div className="player-bottom-features">
                 <div className="p-feat">
                    <Camera size={14} color="#C466FF"/>
                    <span>Personnalisé<br/>pour vous</span>
                 </div>
                 <div className="p-feat">
                    <div className="ai-icon-wrapper"><Sparkles size={14} color="#9933FF"/></div>
                    <span>Généré<br/>par IA</span>
                 </div>
                 <div className="p-feat">
                    <Download size={14} color="#33CCFF"/>
                    <span>Téléchargement<br/>instantané</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="landing-features" style={{marginBottom: '60px'}}>
         <div className="feature">
            <div className="f-icon"><Zap size={32} color="#FF3366" strokeWidth={1.5} /></div>
            <div className="f-text"><h4>En 60 secondes</h4><p>Votre cadeau musical prêt à offrir</p></div>
         </div>
         <div className="feature">
            <div className="f-icon"><Sparkles size={32} color="#9933FF" strokeWidth={1.5} /></div>
            <div className="f-text"><h4>100% Personnalisé</h4><p>Prénom, histoire, émotion unique</p></div>
         </div>
         <div className="feature">
            <div className="f-icon"><Heart size={32} color="#C466FF" strokeWidth={1.5} /></div>
            <div className="f-text"><h4>IA Émotionnelle</h4><p>Comprend le contexte et les sentiments</p></div>
         </div>
         <div className="feature">
            <div className="f-icon"><Lock size={32} color="#33CCFF" strokeWidth={1.5} /></div>
            <div className="f-text"><h4>Cadeau Digital</h4><p>Partagez par WhatsApp, SMS ou lien</p></div>
         </div>
       </div>

      <section className="how-it-works-section landing-section">
        <div className="section-label-pill"><Zap size={14}/> Comment ça marche</div>
        <h3 className="premium-section-title text-center">Votre cadeau prêt <span className="text-gradient">en 3 étapes</span></h3>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-img" style={{backgroundImage:"url('/images/step1_describe_african_1782996782889.png')"}}></div>
            <div className="how-step-content">
              <div className="step-num">01</div>
              <h4>Décrivez l'occasion</h4>
              <p>Dites-nous l'événement, le prénom du destinataire et l'émotion que vous souhaitez exprimer. Amour, joie, tendresse...</p>
              <div className="step-tags"><span>Anniversaire</span><span>Mariage</span><span>Naissance</span><span>Obsèques</span></div>
            </div>
          </div>
          <div className="how-step reverse">
            <div className="how-step-img" style={{backgroundImage:"url('/images/step2_ai_music_1782996723788.png')"}}></div>
            <div className="how-step-content">
              <div className="step-num">02</div>
              <h4>L'IA compose votre chanson</h4>
              <p>Notre moteur génère une chanson unique avec les paroles personnalisées, la mélodie et la voix adaptées à votre occasion.</p>
              <div className="step-tags"><span>Paroles sur mesure</span><span>Voix réaliste</span><span>Style choisi</span></div>
            </div>
          </div>
          <div className="how-step">
            <div className="how-step-img" style={{backgroundImage:"url('/images/step3_share_african_1782996792341.png')"}}></div>
            <div className="how-step-content">
              <div className="step-num">03</div>
              <h4>Télécharger et partager</h4>
              <p>Partagez immédiatement par WhatsApp, SMS ou lien. Votre proche reçoit un cadeau sonore qu'il n'oubliera jamais.</p>
              <div className="step-tags"><span>WhatsApp</span><span>SMS</span><span>Lien partageable</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* OCCASIONS SECTION */}
      <section className="occasions-section landing-section">
        <div className="section-label-pill"><Heart size={14}/> Pour chaque moment</div>
        <h3 className="premium-section-title text-center">Une chanson pour <span className="text-gradient">chaque occasion</span></h3>
        <p className="landing-section-subtitle text-center">Quel que soit l'événement, Click &amp; Vibe crée un cadeau sonore qui touche les cœurs.</p>
        <div className="occasions-grid">
          <div className="occasion-card" style={{backgroundImage:"url('/images/occasion_birthday_1782996408671.png')",backgroundSize:'cover',backgroundPosition:'center'}}>
            <div className="occasion-overlay"></div>
            <div className="occasion-content">
              <div className="occasion-icon"><Star size={28} color="#FFB800" fill="#FFB800"/></div>
              <h4>Anniversaire</h4>
              <p>Avec le prénom et l'âge pour marquer ce jour à jamais.</p>
              <span className="occasion-tag">Fête inoubliable</span>
            </div>
          </div>
          <div className="occasion-card" style={{backgroundImage:"url('/images/occasion_wedding_1782996425486.png')",backgroundSize:'cover',backgroundPosition:'center'}}>
            <div className="occasion-overlay"></div>
            <div className="occasion-content">
              <div className="occasion-icon"><Heart size={28} color="#FF3366" fill="#FF3366"/></div>
              <h4>Mariage</h4>
              <p>La chanson de votre histoire d'amour, composée sur mesure pour le jour J.</p>
              <span className="occasion-tag">Premier danse</span>
            </div>
          </div>
          <div className="occasion-card" style={{backgroundImage:"url('/images/occasion_love_1782996433746.png')",backgroundSize:'cover',backgroundPosition:'center'}}>
            <div className="occasion-overlay"></div>
            <div className="occasion-content">
              <div className="occasion-icon"><Music size={28} color="#C466FF"/></div>
              <h4>Déclaration d'amour</h4>
              <p>Exprimez ce que les mots seuls ne peuvent pas dire. Une chanson qui dit tout.</p>
              <span className="occasion-tag">Coup de cœur</span>
            </div>
          </div>
          <div className="occasion-card" style={{backgroundImage:"url('/images/occasion_congrats_1782996451185.png')",backgroundSize:'cover',backgroundPosition:'center'}}>
            <div className="occasion-overlay"></div>
            <div className="occasion-content">
              <div className="occasion-icon"><Trophy size={28} color="#FFB800"/></div>
              <h4>Félicitations</h4>
              <p>Diplôme, promotion, naissance, baptême... Célébrez les grandes réussites.</p>
              <span className="occasion-tag">Succès &amp; Victoire</span>
            </div>
          </div>
          <div className="occasion-card" style={{backgroundImage:"url('/images/occasion_memorial_1782996462673.png')",backgroundSize:'cover',backgroundPosition:'center'}}>
            <div className="occasion-overlay"></div>
            <div className="occasion-content">
              <div className="occasion-icon"><ShieldCheck size={28} color="#94a3b8"/></div>
              <h4>Hommage &amp; Obsèques</h4>
              <p>Un hommage digne et touchant pour honorer la mémoire d'un être cher.</p>
              <span className="occasion-tag">Mémoire éternelle</span>
            </div>
          </div>
          <div className="occasion-card occasion-card-cta" onClick={() => navigate('/home')} style={{cursor:'pointer'}}>
            <div className="occasion-cta-content">
              <Sparkles size={40} color="#FF3366"/>
              <h4>Votre occasion ?</h4>
              <p>Décrivez n'importe quel moment et notre IA compose la chanson parfaite.</p>
              <span className="occasion-cta-btn">Commencer →</span>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-testimonials-section landing-section">
        <div className="section-label-pill"><Star size={14}/> Témoignages</div>
        <h3 className="premium-section-title text-center">Ils ont offert un cadeau <span className="text-gradient">inoubliable</span></h3>
        <div className="testimonials-carousel">
          <div className="testimonials-track" id="testi-track">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-slide">
                <div className="p-testimonial-card featured">
                  <div className="stars">{[...Array(5)].map((_, s) => <Star key={s} size={18} fill="#FFB800" color="#FFB800"/>)}</div>
                  <p>"{t.text}"</p>
                  <div className="author-info">
                    <img src={`https://ui-avatars.com/api/?name=${t.name.replace(' ','+')}&background=${t.bg}&color=fff&bold=true`} alt={t.name} className="author-avatar" />
                    <div><div className="author-name">{t.name}</div><div className="author-role">{t.role}</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-item"><span className="stat-num">1 000+</span><span className="stat-desc">Cadeaux créés</span></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><span className="stat-num">12</span><span className="stat-desc">Pays couverts</span></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><span className="stat-num">23</span><span className="stat-desc">Opérateurs Mobile Money</span></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><span className="stat-num">4.9 / 5</span><span className="stat-desc">Note moyenne</span></div>
      </div>

      <section className="premium-payment-section landing-section">
        <div className="premium-header text-center">
          <h2 className="premium-section-title">Disponible partout <span className="text-gradient">en Afrique</span></h2>
          <p className="landing-section-subtitle text-center">Offrez un cadeau musical unique depuis n'importe quel pays africain. Paiement 100% Mobile Money — sans carte bancaire, sans compte bancaire.</p>
          <div className="premium-stats-badges">
            <div className="stat-badge">
              <div className="stat-icon-wrapper pink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
              <div className="stat-text"><strong>12</strong> Pays couverts</div>
            </div>
            <div className="stat-badge">
              <div className="stat-icon-wrapper pink"><Smartphone size={16} color="currentColor"/></div>
              <div className="stat-text"><strong>23</strong> Opérateurs Mobile</div>
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
                <span className="footer-value">5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="operators-banner">
        <div className="operators-track">
          {['Orange Money','MTN MoMo','Moov Money','Wave','Airtel Money','Orange Money','MTN MoMo','Moov Money','Wave','Airtel Money'].map((op, i) => (
            <span key={i} className="op-pill"><Smartphone size={12}/> {op}</span>
          ))}
        </div>
      </div>

      <section className="premium-faq-section landing-section">
        <div className="section-label-pill"><MessageSquare size={14}/> FAQ</div>
        <h3 className="premium-section-title text-center">Tout ce que vous voulez savoir</h3>
        <div className="premium-faq-container">
          {[
            {q:"Pour quels événements puis-je commander ?", a:"Anniversaires, mariages, fiançailles, déclarations d'amour, naissances, félicitations, hommages funèbres, remises de diplômes, fêtes d'entreprise... Tous les moments importants de la vie !"},
            {q:"Comment payer sans carte bancaire ?", a:"Notre intégration permet les paiements directs via Orange Money, MTN MoMo, Moov Money, Wave et Airtel Money selon votre pays. Aucun compte bancaire requis."},
            {q:"Quelle est la durée d'une chanson ?", a:"La chanson générée dure entre 2 et 4 minutes. Elle comprend une introduction, des couplets avec les paroles personnalisées, un refrain mémorable et une conclusion."},
            {q:"Comment partager mon cadeau musical ?", a:"Vous recevez un lien partageable et un fichier audio. Envoyez-le directement par WhatsApp, SMS, email ou réseaux sociaux. Le destinataire peut écouter depuis son téléphone sans application."},
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
        <div className="cta-split-card">
          <div className="cta-split-image" style={{backgroundImage:"url('/images/cta_gift_1782996398218.png')"}}>
            <div className="cta-image-overlay"></div>
          </div>
          <div className="cta-split-content">
            <div className="cta-badge"><Heart size={16} fill="#FF3366" color="#FF3366" style={{marginRight: '6px'}}/> Prêt à surprendre ?</div>
            <h2>Offrez une émotion inoubliable</h2>
            <p>Le meilleur cadeau n'est pas matériel, c'est une chanson unique qui raconte votre histoire.<br/>Créez-la en quelques clics.</p>
            <div className="cta-buttons">
              <button className="btn-premium-action" onClick={() => navigate('/home')}><Sparkles size={18}/> Créer un cadeau musical</button>
            </div>
            <div className="cta-trust">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"></path></svg> Sans carte bancaire</span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"></path></svg> Mobile Money accepté</span>
            </div>
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
        <div className="footer-text"><Heart size={16} color="#FF3366" fill="#FF3366"/> Plus de 1 000 cadeaux musicaux offerts à travers l'Afrique</div>
      </div>
    </div>
  );
}

export default Onboarding;
