import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music, Sparkles, Zap, Settings, Lock, Heart, Play, Pause, CheckCircle2, Star, Gift, Briefcase, Mic, BookOpen, GraduationCap, Baby, Gem, HandHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import './Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTrack, isPlaying, togglePlay, playTrack } = useAudio();
  const [showcaseMusics, setShowcaseMusics] = useState([]);

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
      {/* TOPBAR */}
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
        {!user && (
          <div className="landing-badge">
            <Sparkles size={14} color="#C466FF" /> L'IA au service de ta créativité
          </div>
        )}
      </div>

      {/* HERO */}
      <div className="landing-hero">
        <div className="landing-content">
          <h1 className="landing-title">Crée des chansons <br/><span className="text-gradient">incroyables</span><br/>grâce à l'IA.</h1>
          <p className="landing-subtitle">Décris simplement ton idée, choisis ton style musical et laisse Click & Vibe composer une chanson unique en quelques secondes.</p>
          
          <div className="landing-buttons">
            <button className="btn-primary-glow" onClick={navigateAction}>
              <Sparkles size={18}/> {user ? "Générer une chanson" : "Commencer"} &rarr;
            </button>
            {!user && (
              <button className="btn-outline-glow" onClick={() => navigate('/login')}>Se connecter &rarr;</button>
            )}
          </div>
        </div>
        
        <div className="landing-image-wrapper">
           <div className="landing-glow-circle"></div>
           <img src="/hero_headphones.png" alt="Hero" className="landing-hero-img" />
        </div>
      </div>

      {/* ANCIENNE SECTION FEATURES */}
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

      {/* CAS D'UTILISATION */}
      <div className="section">
        <h2 className="section-title">Cas d'utilisation<br/><span style={{fontSize: 20, color: 'var(--text-secondary)', fontWeight: 500}}>À quoi servira votre prochaine chanson ?</span></h2>
        <div className="grid-4">
          <div className="use-case-card"><div className="use-case-icon"><Heart color="#FF3366" size={28}/></div><div className="use-case-title">Déclaration d'amour</div></div>
          <div className="use-case-card"><div className="use-case-icon"><Gift color="#C466FF" size={28}/></div><div className="use-case-title">Anniversaire</div></div>
          <div className="use-case-card"><div className="use-case-icon"><Gem color="#33CCFF" size={28}/></div><div className="use-case-title">Mariage</div></div>
          <div className="use-case-card"><div className="use-case-icon"><Briefcase color="#FFB033" size={28}/></div><div className="use-case-title">Jingle pour entreprise</div></div>
          <div className="use-case-card"><div className="use-case-icon"><Mic color="#FF3366" size={28}/></div><div className="use-case-title">Maquette pour artiste</div></div>
          <div className="use-case-card"><div className="use-case-icon"><HandHeart color="#C466FF" size={28}/></div><div className="use-case-title">Gospel</div></div>
          <div className="use-case-card"><div className="use-case-icon"><GraduationCap color="#33CCFF" size={28}/></div><div className="use-case-title">Diplôme</div></div>
          <div className="use-case-card"><div className="use-case-icon"><Baby color="#FFB033" size={28}/></div><div className="use-case-title">Naissance</div></div>
        </div>
      </div>

      {/* COMMENT CA MARCHE */}
      <div className="section" style={{background: 'rgba(255,255,255,0.02)'}}>
        <h2 className="section-title">Comment ça marche ?</h2>
        <div className="grid-3">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Répondez à quelques questions.</h3>
            <p style={{color: 'var(--text-secondary)', marginTop: 10}}>Expliquez-nous l'ambiance et le sujet.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Notre IA écrit les paroles et compose la musique.</h3>
            <p style={{color: 'var(--text-secondary)', marginTop: 10}}>En quelques secondes seulement.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Recevez votre chanson prête à écouter.</h3>
            <p style={{color: 'var(--text-secondary)', marginTop: 10}}>Téléchargez et partagez la magie.</p>
          </div>
        </div>
      </div>

      {/* ECOUTEZ QUELQUES CREATIONS */}
      {showcaseMusics.length > 0 && (
        <div className="section">
          <h2 className="section-title">Écoutez quelques créations</h2>
          <div className="grid-4">
            {showcaseMusics.map((m, i) => {
              const isPlayingThis = currentTrack?.id === m.id && isPlaying;
              return (
                <div key={m.id} className="audio-card-vertical">
                  <div className="audio-cover-wrapper">
                    {m.cover_url ? (
                      <img src={m.cover_url} alt={m.title} className="audio-cover-large" />
                    ) : (
                      <div className="audio-cover-large placeholder-cover"><Music size={32} opacity={0.5}/></div>
                    )}
                    <button className="audio-play-btn-overlay" onClick={() => handlePlay(m)}>
                      {isPlayingThis ? <Pause fill="white" size={24}/> : <Play fill="white" size={24} style={{marginLeft: 3}}/>}
                    </button>
                  </div>
                  <div className="audio-info-vertical">
                    <h4>{m.title || "Titre inconnu"}</h4>
                    <p>{m.style}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* POURQUOI CLICK & VIBE */}
      <div className="section grid-2">
        <div>
          <h2 className="section-title" style={{textAlign: 'left', marginBottom: 24}}>Pourquoi Click & Vibe ?</h2>
          <ul className="check-list">
            <li><CheckCircle2 /> Chansons entièrement personnalisées</li>
            <li><CheckCircle2 /> Plusieurs styles musicaux</li>
            <li><CheckCircle2 /> Téléchargement instantané</li>
            <li><CheckCircle2 /> Qualité professionnelle</li>
            <li><CheckCircle2 /> Interface simple</li>
          </ul>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div className="landing-glow-circle" style={{width: 300, height: 300, background: 'radial-gradient(circle, rgba(255, 51, 102, 0.3) 0%, transparent 70%)'}}></div>
        </div>
      </div>

      {/* TEMOIGNAGES */}
      <div className="section" style={{overflow: 'hidden'}}>
        <h2 className="section-title">Témoignages</h2>
        <div className="carousel-wrapper">
          <div className="carousel-track">
            {/* Duplicated for infinite scroll effect */}
            {[1, 2].map((_, loopIndex) => (
              <React.Fragment key={loopIndex}>
                <div className="review-card">
                  <div className="stars"><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/></div>
                  <p>"J'ai offert une chanson à ma mère pour son anniversaire. Elle était très émue."</p>
                </div>
                <div className="review-card">
                  <div className="stars"><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/></div>
                  <p>"Notre jingle a été créé en quelques minutes."</p>
                </div>
                <div className="review-card">
                  <div className="stars"><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/></div>
                  <p>"Je pensais qu'il fallait être musicien. Finalement, c'est très simple."</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* POUR LES ENTREPRISES */}
      <div className="section grid-2" style={{background: 'rgba(255,255,255,0.02)'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
           <div className="landing-glow-circle" style={{width: 300, height: 300, background: 'radial-gradient(circle, rgba(51, 204, 255, 0.3) 0%, transparent 70%)'}}></div>
        </div>
        <div>
          <h2 className="section-title" style={{textAlign: 'left', marginBottom: 16}}>Pour les entreprises</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: 18, marginBottom: 30}}>Une identité sonore unique pour votre marque.</p>
          <ul className="check-list">
            <li><CheckCircle2 color="#33CCFF"/> Jingles publicitaires</li>
            <li><CheckCircle2 color="#33CCFF"/> Musiques promotionnelles</li>
            <li><CheckCircle2 color="#33CCFF"/> Contenus pour TikTok</li>
            <li><CheckCircle2 color="#33CCFF"/> Campagnes marketing</li>
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="section">
        <h2 className="section-title">Questions fréquentes</h2>
        <div className="faq-grid">
          <div className="faq-card">
            <h4>Dois-je savoir chanter ?</h4>
            <p>Non.</p>
          </div>
          <div className="faq-card">
            <h4>Dois-je écrire les paroles ?</h4>
            <p>Non. Répondez simplement à quelques questions.</p>
          </div>
          <div className="faq-card">
            <h4>Combien de temps faut-il ?</h4>
            <p>Quelques minutes.</p>
          </div>
          <div className="faq-card">
            <h4>Puis-je télécharger ma chanson ?</h4>
            <p>Oui. Vous pouvez l'écouter, la télécharger et la partager.</p>
          </div>
        </div>
      </div>

      {/* DERNIER CTA */}
      <div className="cta-section">
        <h2>Votre histoire mérite sa propre chanson.</h2>
        <p>Commencez maintenant et laissez Click & Vibe transformer vos idées en musique.</p>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <button className="btn-primary-glow" onClick={navigateAction} style={{fontSize: 20, padding: '20px 40px'}}>
             <Sparkles size={24}/> Créer ma chanson
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-col" style={{maxWidth: 300}}>
            <div className="landing-logo" style={{marginBottom: 20}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                <span style={{width: '3px', height: '12px', background: 'var(--gradient-primary)', borderRadius: '3px'}}></span>
                <span style={{width: '3px', height: '20px', background: 'var(--gradient-primary)', borderRadius: '3px'}}></span>
                <span style={{width: '3px', height: '14px', background: 'var(--gradient-primary)', borderRadius: '3px'}}></span>
                <Music size={24} color="#FF3366" style={{marginLeft: '2px'}} />
              </div>
              <span>Click <span className="amp">&</span> Vibe</span>
            </div>
            <p style={{color: 'var(--text-secondary)', fontSize: 14}}>L'IA qui donne vie à tes émotions en musique.</p>
          </div>
          <div className="footer-col">
            <h4>Légal</h4>
            <ul>
              <li><Link to="/legal">Politique de confidentialité</Link></li>
              <li><Link to="/legal">Conditions d'utilisation</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Aide & Contact</h4>
            <ul>
              <li><a href="mailto:contact@clickandvibe.com">Contact</a></li>
              <li><a href="#">Support WhatsApp</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Réseaux sociaux</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">TikTok</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
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
