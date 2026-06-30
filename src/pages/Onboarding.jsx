import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Music, Sparkles, Play, Pause, CheckCircle2, Star, Download, Gift, 
  Heart, Gem, Megaphone, Mic, PartyPopper, ClipboardList, 
  Plus, MessageCircle, Clock, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import './Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTrack, isPlaying, togglePlay, playTrack } = useAudio();
  const [showcaseMusics, setShowcaseMusics] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    { q: "Dois-je savoir chanter ou composer ?", a: "Pas du tout ! Notre IA se charge de tout : de l'écriture des paroles à la composition de la mélodie et même du chant." },
    { q: "Combien de temps faut-il pour recevoir ma chanson ?", a: "La création ne prend que quelques secondes. Vous pourrez l'écouter, la télécharger ou la partager instantanément." },
    { q: "Puis-je utiliser ma chanson à des fins commerciales ?", a: "Oui, selon le pack que vous choisissez, vous pouvez obtenir les droits commerciaux complets sur vos créations." },
    { q: "Quels styles musicaux sont disponibles ?", a: "Nous proposons tous les styles majeurs : Pop, Rap, RnB, Classique, Afrobeat, EDM, Jazz, et bien d'autres !" },
    { q: "Puis-je modifier ma chanson après génération ?", a: "Absolument. Vous pouvez générer des variantes pour obtenir exactement ce que vous souhaitez." },
    { q: "Comment fonctionne le système de générations ?", a: "Chaque génération correspond à une création musicale unique. Nos packs vous offrent un certain nombre de crédits de génération." }
  ];

  useEffect(() => {
    // Fetch showcase musics (admin picks via "is_trending")
    const fetchShowcase = async () => {
      try {
        const res = await fetch('/api/music/trending');
        if (res.ok) {
          const data = await res.json();
          setShowcaseMusics(data.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching showcase musics", err);
      }
    };
    fetchShowcase();
  }, []);

  const handlePlay = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, showcaseMusics);
    }
  };

  const navigateAction = () => {
    if (user) navigate('/home');
    else navigate('/login');
  };

  return (
    <div className="landing-container">
      {/* HERO WRAPPER */}
      <div className="hero-section-wrapper">
        {/* TOPBAR */}
        <div className="landing-topbar" style={{justifyContent: 'space-between'}}>
          <div className="landing-logo">
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <span style={{width: '3px', height: '12px', background: 'var(--neon-pink)', borderRadius: '3px'}}></span>
              <span style={{width: '3px', height: '20px', background: 'var(--neon-purple)', borderRadius: '3px'}}></span>
              <span style={{width: '3px', height: '14px', background: 'var(--neon-pink)', borderRadius: '3px'}}></span>
            </div>
            <span>Click <span className="amp">&</span> Vibe</span>
          </div>
          
          <div className="hero-badge" style={{margin: 0}}>
            <Sparkles size={14} /> L'IA au service de ta créativité
          </div>
        </div>

        {/* HERO */}
        <div className="landing-hero">
          <div className="landing-content">
            <h1 className="landing-title">
              Crée des<br/>
              chansons<br/>
              <span className="text-gradient">incroyables<br/>grâce à l'IA.</span>
            </h1>
            <p className="landing-subtitle">
              Décris simplement ton idée, choisis ton style musical<br/>
              et laisse <span style={{color: 'var(--neon-pink)', fontWeight: 600}}>Click & Vibe</span> composer une chanson unique<br/>
              en quelques secondes.
            </p>
            
            <div className="landing-buttons" style={{marginTop: '40px', gap: '20px'}}>
              <button className="btn-primary-large" onClick={navigateAction} style={{display: 'flex', alignItems: 'center', gap: '10px', width: '220px', justifyContent: 'center'}}>
                <Sparkles size={18}/> Commencer <span style={{marginLeft: 'auto'}}>→</span>
              </button>
              <button className="btn-outline-large" onClick={() => navigate('/login')} style={{display: 'flex', alignItems: 'center', width: '220px', justifyContent: 'center'}}>
                Se connecter <span style={{marginLeft: 'auto'}}>→</span>
              </button>
            </div>
          </div>
          
          <div className="landing-image-wrapper">
             {/* If hero_bg.png includes the guy, this img might be redundant, but we keep it if it's separate */}
             <img src="/hero_headphones.png" alt="Hero" className="landing-hero-img" />
          </div>
        </div>

        {/* HERO BOTTOM FEATURES */}
        <div className="hero-bottom-features">
          <div className="hbf-grid">
            <div className="hbf-item">
              <div className="hbf-icon"><div style={{color:'#FF3366'}}>⚡</div></div>
              <div className="hbf-text">
                <h4>Rapide</h4>
                <p>Ta chanson en quelques secondes</p>
              </div>
            </div>
            <div className="hbf-item">
              <div className="hbf-icon"><div style={{color:'#9933FF'}}>🪄</div></div>
              <div className="hbf-text">
                <h4>Personnalisé</h4>
                <p>Tous les styles, toutes les ambiances</p>
              </div>
            </div>
            <div className="hbf-item">
              <div className="hbf-icon"><div style={{color:'#FF3388'}}>🎛️</div></div>
              <div className="hbf-text">
                <h4>IA Avancée</h4>
                <p>Une technologie de pointe au service de ta créativité</p>
              </div>
            </div>
            <div className="hbf-item">
              <div className="hbf-icon"><div style={{color:'#9933FF'}}>🔒</div></div>
              <div className="hbf-text">
                <h4>Sécurisé</h4>
                <p>Tes créations t'appartiennent à 100%</p>
              </div>
            </div>
          </div>
          
          <div className="hero-community">
            <div className="hc-avatars">
               <img src="https://ui-avatars.com/api/?name=J&background=333&color=fff" alt="User" />
               <img src="https://ui-avatars.com/api/?name=M&background=555&color=fff" alt="User" />
               <img src="https://ui-avatars.com/api/?name=A&background=222&color=fff" alt="User" />
               <img src="https://ui-avatars.com/api/?name=S&background=111&color=fff" alt="User" />
               <img src="https://ui-avatars.com/api/?name=D&background=444&color=fff" alt="User" />
            </div>
            <div className="hc-text">
               <Heart size={14} color="#FF3366" fill="#FF3366" /> Plus de <strong style={{color:'#FF3366'}}>10 000</strong> chansons créées par notre communauté
            </div>
          </div>
        </div>
      </div> {/* END HERO WRAPPER */}

      {/* CAS D'UTILISATION */}
      <div id="features" className="section section-panel">
        <h2 className="section-title">À quoi ça sert ?</h2>
        <div className="use-case-grid">
          <div className="use-case-card">
            <div className="use-case-icon-wrapper"><Gift color="#FF3366" size={32}/></div>
            <div className="use-case-title">Anniversaire</div>
            <div className="use-case-desc">Surprenez vos proches<br/>avec une chanson unique</div>
          </div>
          <div className="use-case-card">
            <div className="use-case-icon-wrapper"><Heart color="#FF3388" size={32}/></div>
            <div className="use-case-title">Déclaration d'amour</div>
            <div className="use-case-desc">Exprimez vos sentiments<br/>en musique</div>
          </div>
          <div className="use-case-card">
            <div className="use-case-icon-wrapper"><Gem color="#FF3366" size={32}/></div>
            <div className="use-case-title">Mariage</div>
            <div className="use-case-desc">Créez la chanson parfaite<br/>pour votre cérémonie</div>
          </div>
          <div className="use-case-card">
            <div className="use-case-icon-wrapper"><Megaphone color="#9933FF" size={32}/></div>
            <div className="use-case-title">Jingle d'entreprise</div>
            <div className="use-case-desc">Boostez votre marque<br/>avec un jingle pro</div>
          </div>
          <div className="use-case-card">
            <div className="use-case-icon-wrapper"><Mic color="#9933FF" size={32}/></div>
            <div className="use-case-title">Artistes & Maquettes</div>
            <div className="use-case-desc">Créez vos maquettes<br/>facilement</div>
          </div>
          <div className="use-case-card">
            <div className="use-case-icon-wrapper"><PartyPopper color="#FF3388" size={32}/></div>
            <div className="use-case-title">Toutes occasions</div>
            <div className="use-case-desc">Graduation, naissance,<br/>fête, hommage...</div>
          </div>
        </div>
      </div>

      {/* COMMENT CA MARCHE */}
      <div id="how" className="section section-panel">
        <h2 className="section-title">Comment ça marche ?</h2>
        <div className="how-it-works-timeline">
          <div className="timeline-step">
            <div className="timeline-icon-box">
              <ClipboardList size={28} color="#FF3388" />
              <div className="timeline-number">1</div>
            </div>
            <div className="timeline-text">
              <h4>Répondez à quelques questions</h4>
              <p>Parlez-nous de votre idée, de l'occasion et du style souhaité.</p>
            </div>
          </div>
          <div className="timeline-connector"></div>
          
          <div className="timeline-step">
            <div className="timeline-icon-box">
              <Music size={28} color="#9933FF" />
              <div className="timeline-number">2</div>
            </div>
            <div className="timeline-text">
              <h4>Notre IA crée votre chanson</h4>
              <p>Paroles, musique, voix... tout est généré automatiquement.</p>
            </div>
          </div>
          <div className="timeline-connector"></div>
          
          <div className="timeline-step">
            <div className="timeline-icon-box">
              <Download size={28} color="#9933FF" />
              <div className="timeline-number">3</div>
            </div>
            <div className="timeline-text">
              <h4>Écoutez, téléchargez, partagez</h4>
              <p>Recevez votre chanson prête à être écoutée et partagée.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ECOUTEZ QUELQUES CREATIONS */}
      <div id="examples" className="section section-panel">
        <h2 className="section-title">Écoutez quelques créations</h2>
        {showcaseMusics.length > 0 ? (
          <div className="creations-grid">
            {showcaseMusics.map((m, i) => {
              const isPlayingThis = currentTrack?.id === m.id && isPlaying;
              return (
                <div key={m.id} className="creation-card">
                  {m.cover_url ? (
                    <img src={m.cover_url} alt={m.title} className="creation-image" />
                  ) : (
                    <div className="creation-image" style={{background: '#1A1525', display:'flex', alignItems:'center', justifyContent:'center'}}>
                       <Music opacity={0.5} size={40}/>
                    </div>
                  )}
                  <div className="creation-overlay">
                    <button className="creation-play-btn" onClick={() => handlePlay(m)}>
                      {isPlayingThis ? <Pause fill="white" size={14}/> : <Play fill="white" size={14} style={{marginLeft: 2}}/>}
                    </button>
                    <div className="creation-info">
                      <h4>{m.title || "Titre inconnu"}</h4>
                      <p>{m.style}</p>
                      <div className="creation-waveform">
                        <div style={{display:'flex', gap:'2px', height:'12px', alignItems:'center', flex: 1}}>
                          {Array.from({length: 20}).map((_, idx) => (
                             <div key={idx} style={{width:'2px', background:'rgba(255,255,255,0.4)', height: Math.random() * 100 + '%', borderRadius:'2px'}}></div>
                          ))}
                        </div>
                        <span>02:45</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
           <p style={{textAlign: 'center', color: 'var(--text-dim)'}}>Ajoutez des chansons "Tendance" depuis le panel admin pour les voir apparaître ici.</p>
        )}
        <div className="view-more">
          <Link to="/home">Voir plus d'exemples &rarr;</Link>
        </div>
      </div>

      {/* 3 COLUMNS SECTION */}
      <div className="section section-panel three-cols">
        <div className="col-why">
          <h3>Pourquoi choisir<br/>Click & Vibe ?</h3>
          <ul className="why-list">
            <li><CheckCircle2 size={20}/> Chansons 100% personnalisées</li>
            <li><CheckCircle2 size={20}/> Plusieurs styles musicaux</li>
            <li><CheckCircle2 size={20}/> Qualité professionnelle</li>
            <li><CheckCircle2 size={20}/> Téléchargement instantané</li>
            <li><CheckCircle2 size={20}/> Interface simple et intuitive</li>
            <li><CheckCircle2 size={20}/> Service rapide et sécurisé</li>
          </ul>
        </div>
        
        <div className="col-stats">
          <div className="stat-item">
            <div className="stat-icon"><ClipboardList size={24}/></div>
            <div className="stat-val">500+</div>
            <div className="stat-label">Chansons créées</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Star size={24}/></div>
            <div className="stat-val">1K+</div>
            <div className="stat-label">Utilisateurs satisfaits</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Music size={24}/></div>
            <div className="stat-val">10+</div>
            <div className="stat-label">Styles musicaux</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Clock size={24}/></div>
            <div className="stat-val">24/7</div>
            <div className="stat-label">Support disponible</div>
          </div>
        </div>
        
        <div className="col-reviews">
          <h3>Ils parlent de nous</h3>
          <div className="review-list">
            <div className="review-card">
              <div className="review-quote">"J'ai offert une chanson à ma mère pour son anniversaire. Elle a pleuré de joie."</div>
              <div className="review-author">
                <img src="https://ui-avatars.com/api/?name=L&background=111&color=fff" alt="User" />
                <div className="review-author-info">
                  <h5>Laura M.</h5>
                  <div className="stars"><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/></div>
                </div>
              </div>
            </div>
            <div className="review-card">
              <div className="review-quote">"Notre jingle a donné un vrai professionnalisme à notre marque."</div>
              <div className="review-author">
                <img src="https://ui-avatars.com/api/?name=B&background=333&color=fff" alt="User" />
                <div className="review-author-info">
                  <h5>Brian T.</h5>
                  <div className="stars"><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/></div>
                </div>
              </div>
            </div>
            <div className="review-card">
              <div className="review-quote">"Je suis artiste et ça m'aide beaucoup pour mes maquettes."</div>
              <div className="review-author">
                <img src="https://ui-avatars.com/api/?name=D&background=222&color=fff" alt="User" />
                <div className="review-author-info">
                  <h5>Dylan K.</h5>
                  <div className="stars"><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/><Star fill="currentColor" size={10}/></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING BANNER */}
      <div id="pricing" className="section">
        <div className="pricing-banner">
          <div className="pricing-banner-left">
            <div className="pricing-icon-box">
              <Music color="var(--neon-pink)" size={40}/>
            </div>
            <div className="pricing-text">
              <h3>Commencez maintenant</h3>
              <p>Créez votre première chanson avec Click & Vibe.<br/>Choisissez le pack qui correspond à vos besoins.</p>
              <div className="pricing-tags">
                <div className="pricing-tag"><CheckCircle2 size={16}/> Qualité professionnelle</div>
                <div className="pricing-tag"><ShieldCheck size={16}/> Paiement sécurisé</div>
              </div>
            </div>
          </div>
          <div className="pricing-card">
            <h4>Packs populaires</h4>
            <p>À partir de</p>
            <div className="pricing-price">750 <span style={{fontSize: 16}}>FCFA</span></div>
            <p style={{marginBottom: 20}}>pour 1 génération</p>
            <button onClick={() => navigate(user ? '/credits' : '/login')}>Voir les packs &rarr;</button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="section">
        <h2 className="section-title">Questions fréquentes</h2>
        <div className="faq-grid">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openFaq === index ? 'open' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <h4>{faq.q} <Plus size={18} /></h4>
              <div className="faq-answer">
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-col" style={{maxWidth: 300}}>
            <div className="landing-logo" style={{marginBottom: 20}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                <span style={{width: '3px', height: '12px', background: 'var(--neon-pink)', borderRadius: '3px'}}></span>
                <span style={{width: '3px', height: '20px', background: 'var(--neon-purple)', borderRadius: '3px'}}></span>
                <span style={{width: '3px', height: '14px', background: 'var(--neon-pink)', borderRadius: '3px'}}></span>
              </div>
              <span>Click <span className="amp">&</span> Vibe</span>
            </div>
            <p style={{color: 'var(--text-dim)', fontSize: 14, marginBottom: 20, lineHeight: 1.6}}>
              Transformez vos idées en chansons inoubliables grâce à l'IA.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Produit</h4>
            <ul>
              <li><a href="#features">Fonctionnalités</a></li>
              <li><a href="#examples">Exemples</a></li>
              <li><a href="#pricing">Tarifs</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Ressources</h4>
            <ul>
              <li><a href="#how">Comment ça marche</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>À propos</h4>
            <ul>
              <li><Link to="/about">Qui sommes-nous ?</Link></li>
              <li><a href="mailto:contact@clickandvibe.com">Contact</a></li>
              <li><Link to="/legal">Conditions d'utilisation</Link></li>
              <li><Link to="/legal">Politique de confidentialité</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Besoin d'aide ?</h4>
            <p style={{color: 'var(--text-dim)', fontSize: 13, marginBottom: 12}}>Écrivez-nous sur WhatsApp</p>
            <a href="#" className="whatsapp-btn">
              <MessageCircle size={18} color="#25D366" /> Discuter sur WhatsApp
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Click & Vibe. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

export default Onboarding;
