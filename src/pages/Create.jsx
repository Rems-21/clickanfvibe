import React, { useState } from 'react';
import { Zap, HelpCircle, Music, Settings, Check, Sparkles, Heart, Drum, Piano, Mic2, Church, Star, Sunrise, CloudRain, Coffee, Flame, Cake, Gem, Baby, Building2, PartyPopper, GraduationCap, Dove, Target, HandHeart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Create.css';
import '../pages/Home.css';

function Create() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [style, setStyle] = useState(location.state?.style || 'Afrobeat');
  const [mood, setMood] = useState(location.state?.mood || 'Romantique');
  const [prompt, setPrompt] = useState(location.state?.prompt || '');
  const [voice, setVoice] = useState('Féminine');
  const [tempo, setTempo] = useState('Normal');
  const [language, setLanguage] = useState('fr');
  const [eventType, setEventType] = useState(location.state?.eventType || null);

  const promptIdeas = [
    "Une chanson afrobeat rythmée sur la réussite et la persévérance",
    "Un titre pop léger pour un road trip entre amis sous le soleil",
    "Un beat rap sombre et puissant avec des basses lourdes",
    "Une mélodie R'n'B douce et romantique pour une soirée chill",
    "Une intro épique avec des violons suivie d'un drop électro",
    "Une ballade acoustique douce sur la séparation et l'espoir"
  ];

  const suggestPrompt = () => {
    const randomIdea = promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
    setPrompt(randomIdea);
  };

  const eventTypes = [
    { id: 'Anniversaire', icon: <Cake size={24} />, color: 'orange', hint: 'Une chanson joyeuse pour célébrer un anniversaire' },
    { id: 'Mariage', icon: <Gem size={24} />, color: 'pink', hint: 'Une chanson romantique et élégante pour un mariage' },
    { id: 'Déclaration d\'amour', icon: <Heart size={24} />, color: 'red', hint: 'Une chanson pour exprimer ses sentiments amoureux' },
    { id: 'Gospel / Prière', icon: <Church size={24} />, color: 'purple', hint: 'Une chanson spirituelle et inspirante' },
    { id: 'Naissance', icon: <Baby size={24} />, color: 'blue', hint: 'Une chanson douce pour accueillir le nouveau-né' },
    { id: 'Jingle Entreprise', icon: <Building2 size={24} />, color: 'blue', hint: 'Un jingle professionnel pour promouvoir une marque' },
    { id: 'Félicitations', icon: <PartyPopper size={24} />, color: 'orange', hint: 'Une chanson festive pour célébrer une réussite' },
    { id: 'Remise de diplôme', icon: <GraduationCap size={24} />, color: 'purple', hint: 'Une chanson inspiring pour une remise de diplôme' },
    { id: 'Deuil / Hommage', icon: <Dove size={24} />, color: 'pink', hint: 'Une chanson douce et respectueuse en hommage' },
    { id: 'Chanson originale', icon: <Mic2 size={24} />, color: 'red', hint: 'Une chanson totalement libre et personnelle' },
  ];

  const handleEventTypeSelect = (ev) => {
    if (eventType === ev.id) {
      setEventType(null);
      return;
    }
    setEventType(ev.id);
    if (!prompt) {
      setPrompt(ev.hint);
    }
  };

  const genres = [
    { id: 'Afrobeat', icon: <Drum size={24} />, color: 'orange' },
    { id: 'Amapiano', icon: <Piano size={24} />, color: 'blue' },
    { id: 'Mbolé', icon: <Flame size={24} />, color: 'red' },
    { id: 'Rap', icon: <Mic2 size={24} />, color: 'purple' },
    { id: 'Gospel', icon: <Church size={24} />, color: 'pink' },
    { id: 'R\'n\'B', icon: <Heart size={24} />, color: 'red' },
    { id: 'Pop', icon: <Star size={24} />, color: 'orange' }
  ];

  const moods = [
    { id: 'Romantique', icon: <Sunrise size={24} />, color: 'orange' },
    { id: 'Motivante', icon: <Zap size={24} />, color: 'blue' },
    { id: 'Mélancolique', icon: <CloudRain size={24} />, color: 'purple' },
    { id: 'Chill', icon: <Coffee size={24} />, color: 'pink' },
    { id: 'Énergétique', icon: <Flame size={24} />, color: 'red' }
  ];

  return (
    <div className="create-container">
      <div className="page-header-simple">
        <div className="title-section">
          <h1>Créer</h1>
          <p className="subtitle">Ton idée. <span className="text-primary">Ta musique.</span> <span className="text-secondary">Ta vibe.</span></p>
        </div>
        <div className="header-actions">
          <button className="icon-btn">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      <div className="create-content">
        <section className="prompt-large-card">
          <div className="prompt-content-top">
            <div className="prompt-text-area">
              <div className="prompt-header-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Sparkles size={18} color="#FF3366" />
                  <h3 style={{margin: 0}}>Décris ta chanson</h3>
                </div>
                <button 
                  onClick={suggestPrompt}
                  style={{background: 'rgba(255,51,102,0.1)', color: '#FF3366', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold'}}
                >
                  <Sparkles size={14} /> Idée de texte
                </button>
              </div>
              <p className="prompt-description" style={{marginTop: '8px'}}>
                Parle-nous de ton idée, de l'ambiance, du thème ou des émotions que tu veux transmettre...
              </p>
              
              <div className="textarea-wrapper">
                <textarea 
                  placeholder="Ex : Une chanson afrobeat romantique sur l'amour sincère..."
                  rows="4"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={500}
                ></textarea>
                <span className="char-count">{prompt.length}/500</span>
              </div>
            </div>
            <div className="prompt-graphic">
               <div className="music-note-glow"><Music size={48} color="white" /></div>
            </div>
          </div>
          
          <div className="prompt-actions-bottom">
            <button className="btn-primary-gradient" onClick={() => {
              if (!user || user.credits < 1) {
                navigate('/credits');
                return;
              }
              navigate('/generating', { 
                  state: { prompt, style, mood, voice, tempo, eventType } 
                });
            }}>
              <Sparkles size={16} /> Générer
            </button>
          </div>
        </section>

        {/* Carrousel Type d'évènement */}
        <section className="section-block">
          <div className="section-header">
            <h3 className="flex-title"><Target size={18} color="#FF3366" /> Pour quelle occasion ?</h3>
            {eventType && <button onClick={() => setEventType(null)} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer'}}>✕ Effacer</button>}
          </div>
          <div className="horizontal-scroll">
            {eventTypes.map(ev => (
              <div
                key={ev.id}
                className={`selectable-card ${eventType === ev.id ? 'selected' : ''}`}
                onClick={() => handleEventTypeSelect(ev)}
              >
                {eventType === ev.id && <div className="check-badge"><Check size={12} strokeWidth={3} /></div>}
                <div className={`genre-icon ${ev.color}`}>{ev.icon}</div>
                <span>{ev.id}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-header">
            <h3 className="flex-title"><Music size={18} color="#C466FF" /> Choisis un style</h3>
          </div>
          <div className="horizontal-scroll">
            {genres.map(g => (
              <div 
                key={g.id} 
                className={`selectable-card ${style === g.id ? 'selected' : ''}`}
                onClick={() => setStyle(g.id)}
              >
                {style === g.id && <div className="check-badge"><Check size={12} strokeWidth={3} /></div>}
                <div className={`genre-icon ${g.color}`}>{g.icon}</div>
                <span>{g.id}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-header">
            <h3 className="flex-title"><Heart size={18} color="#FF3366" /> Choisis une ambiance</h3>
          </div>
          <div className="horizontal-scroll">
            {moods.map(m => (
              <div 
                key={m.id} 
                className={`selectable-card ${mood === m.id ? 'selected' : ''}`}
                onClick={() => setMood(m.id)}
              >
                {mood === m.id && <div className="check-badge"><Check size={12} strokeWidth={3} /></div>}
                <div className={`genre-icon ${m.color}`}>{m.icon}</div>
                <span>{m.id}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-header">
            <h3 className="flex-title"><Settings size={18} /> Options avancées</h3>
          </div>
          <div className="options-grid">
            
            <div className="option-select">
              <Mic2 size={16} color="#9933FF" className="opt-icon" />
              <div className="opt-details">
                <span className="opt-label">Voix</span>
                <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                  <option value="Féminine">Féminine</option>
                  <option value="Masculine">Masculine</option>
                  <option value="Instrumentale">Instrumentale (sans voix)</option>
                </select>
              </div>
            </div>

            <div className="option-select">
              <Drum size={16} color="#FF3366" className="opt-icon" />
              <div className="opt-details">
                <span className="opt-label">Tempo</span>
                <select value={tempo} onChange={(e) => setTempo(e.target.value)}>
                  <option value="Lent">Lent</option>
                  <option value="Normal">Normal</option>
                  <option value="Rapide">Rapide</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        
        <div className="generate-footer-action">
          <button className="btn-primary-gradient full-width large" onClick={() => {
            if (!user || user.credits < 1) {
              navigate('/credits');
              return;
            }
            // Track Music Generation Initiation
            if (window.fbq) {
              window.fbq('trackCustom', 'GenerateMusic', { style, mood });
            }
            navigate('/generating', { 
                  state: { 
                    prompt, 
                    style, 
                    mood, 
                    voice,
                    tempo,
                    eventType
                  } 
                });
          }}>
            Générer ma musique <span className="cost-badge">-1 <Zap size={12} fill="currentColor" /></span>
          </button>
          <div className="cost-estimate">
            <Zap size={14} color={user && user.credits >= 1 ? "#9933FF" : "#FF3366"} fill={user && user.credits >= 1 ? "#9933FF" : "#FF3366"} />
            <span style={{color: user && user.credits >= 1 ? 'inherit' : '#FF3366'}}>Coût estimé : 1 Gen {(!user || user.credits < 1) && "(Solde insuffisant)"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Create;
