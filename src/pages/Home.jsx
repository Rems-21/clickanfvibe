import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Zap, Music, Play, Pause, Heart, Compass, MoreVertical, Share2, Drum, Piano, Mic2, Church, Gift, Star, Flame, Users, ShieldCheck, Headphones, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [genreMusics, setGenreMusics] = useState({});
  const [prompt, setPrompt] = useState('');
  const [activePromos, setActivePromos] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [demoPlaying, setDemoPlaying] = useState(null);
  const demoRefs = useRef({});

  const calculateTimeLeft = (endDateStr) => {
    if (!endDateStr) return null;
    const safeDateStr = endDateStr.split('.')[0].replace(' ', 'T') + 'Z';
    const end = new Date(safeDateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (isNaN(diff) || diff <= 0) return null;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (d > 0) return `${d}j ${h}h ${m}m ${s}s`;
    return `${h}h ${m}m ${s}s`;
  };

  useEffect(() => {
    let interval;
    if (activePromos.length > 0 && activePromos[0].end_date) {
      const initialTime = calculateTimeLeft(activePromos[0].end_date);
      if (initialTime) {
        setTimeLeft(initialTime);
        interval = setInterval(() => {
          const time = calculateTimeLeft(activePromos[0].end_date);
          if (time) {
            setTimeLeft(time);
          } else {
            setActivePromos(prev => prev.slice(1));
            setTimeLeft('');
          }
        }, 1000);
      } else {
        setActivePromos(prev => prev.slice(1));
      }
    }
    return () => clearInterval(interval);
  }, [activePromos]);

  const randomPrompts = [
    "Une chanson afrobeat romantique sur l'amour sincère.",
    "Un rythme amapiano intense pour faire danser le club.",
    "Un gospel doux avec une chorale pour donner de l'espoir.",
    "Du rap hardcore avec des basses puissantes et un tempo rapide.",
    "Une balade R'n'B mélancolique sous la pluie."
  ];

  const handleRandomPrompt = () => {
    const r = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(r);
  };

  useEffect(() => {
    const fetchHistoryAndTrending = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/music/history', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setHistory(data.slice(0, 3)); 
          }
        }
        
        const trendRes = await fetch('/api/music/trending');
        if (trendRes.ok) {
          const trendData = await trendRes.json();
          setTrending(trendData);
        }

        const promoRes = await fetch('/api/promotions/active');
        if (promoRes.ok) {
          const promoData = await promoRes.json();
          const now = new Date().getTime();
          const validPromos = promoData.filter(promo => {
            if (!promo.end_date) return true;
            const safeDateStr = promo.end_date.split('.')[0].replace(' ', 'T') + 'Z';
            const end = new Date(safeDateStr).getTime();
            return !isNaN(end) && end > now;
          });
          setActivePromos(validPromos);
        }
      } catch (err) {
        console.error("Erreur chargement données accueil", err);
      }
    };
    fetchHistoryAndTrending();
  }, []);

  const styleCarousels = [
    { label: 'Afrobeat', icon: <Drum size={16} color="#FF6B00" />, style: 'Afrobeat' },
    { label: 'Amapiano', icon: <Piano size={16} color="#3b82f6" />, style: 'Amapiano' },
    { label: 'Gospel', icon: <Church size={16} color="#ec4899" />, style: 'Gospel' },
    { label: 'Rap', icon: <Mic2 size={16} color="#a855f7" />, style: 'Rap' },
    { label: "R'n'B", icon: <Heart size={16} color="#ef4444" />, style: "R'n'B" },
    { label: 'Mbolé', icon: <Flame size={16} color="#f97316" />, style: 'Mbolé' },
  ];

  const handleDemoPlay = (trackId, url, title, style, duration_str, lyrics, allTracks) => {
    playTrack({ url, title, style, duration_str, lyrics }, allTracks);
  };
  return (
    <div className="home-container">
      <header className="home-header mobile-only">
        <div className="header-top">
          <div className="title-section">
            <div className="flex-title">
              <img src="/log.png" alt="Click & Vibe Logo" style={{height: 24, width: 'auto'}} />
              <h2>Click & Vibe</h2>
            </div>
            <p className="subtitle">L'IA au service de ton flow.</p>
          </div>
          <div className="header-actions">
            <div className="points-badge" onClick={() => navigate('/credits')} style={{cursor: 'pointer'}}>
              <Zap size={16} fill="#FFB800" color="#FFB800" />
              <span>{user ? user.credits : 0}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="user-greeting-global desktop-only">
        <h2>Bienvenue, {user ? user.name : 'Créateur'} !</h2>
        <p>Prêt à donner vie à tes <span className="text-secondary">idées musicales</span> ?</p>
      </div>

      {activePromos.length > 0 && (
        <div className="promo-banner" onClick={() => navigate('/credits')}>
          <div style={{display: 'flex'}}>
            <Gift size={24} color="var(--primary-color)" />
          </div>
          <div className="promo-banner-content">
            <h3>🎉 {activePromos[0].name}</h3>
            <p>{activePromos[0].description}</p>
            {timeLeft && (
              <p className="promo-banner-time">
                ⏳ Se termine dans : {timeLeft}
              </p>
            )}
          </div>
          <button className="btn-primary-gradient" style={{padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem'}}>En profiter</button>
        </div>
      )}

      <div className="home-content">
        <section className="hero-banner-new glass-panel desktop-only">
          <div className="hero-content">
            <h2>Quelle chanson souhaites-tu créer aujourd'hui ?</h2>
            <p>Décris ton idée, choisis un style et une ambiance,<br/>et laisse notre IA composer pour toi.</p>
            <div className="hero-actions">
              <button className="btn-primary-gradient" onClick={() => navigate('/create')}>
                <Zap size={16} /> Créer ma chanson
              </button>
              <button className="btn-outline" onClick={() => navigate('/explore')}>
                <Music size={16} /> Explorer
              </button>
            </div>
          </div>
          <div className="hero-graphic">
            <Music size={120} className="neon-note" />
          </div>
        </section>

        <section className="prompt-section glass-panel mobile-only">
          <div className="prompt-header">
            <Zap size={16} fill="currentColor" />
            <span>Quelle chanson souhaites-tu créer ?</span>
          </div>
          <textarea 
            placeholder="Décris le style, l'humeur, les instruments... ex: Un beat trap lourd avec une flûte mélancolique"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          ></textarea>
          <div className="prompt-actions">
            <button className="btn-secondary small" onClick={handleRandomPrompt}>
              <Zap size={14} /> Aléatoire
            </button>
            <button className="btn-primary-gradient" onClick={() => navigate('/generating', { state: { prompt } })}>
              Générer <Play size={14} fill="currentColor" />
            </button>
          </div>
        </section>

        {/* SECTION TENDANCES GLOBALES - en premier */}
        <section className="section-block">
          <div className="section-header">
            <h3 style={{display:'flex',alignItems:'center',gap:6}}><TrendingUp size={18} color="#FF3366" /> Tendances</h3>
            <a href="#" className="link-secondary">Voir tout</a>
          </div>
          <div className="horizontal-scroll">
            {trending.length > 0 ? trending.slice(0, 8).map((music) => (
              <div className="trend-card" key={music.id}>
                <div className="trend-img-container">
                  <img src={music.cover_url || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop"} alt={music.title} className="trend-img" />
                  <button className="play-btn" onClick={() => playTrack({
                    url: music.audio_url,
                    title: music.title || 'Tendance',
                    style: music.style,
                    duration_str: music.duration_str,
                    lyrics: music.lyrics
                  }, trending)}><Play size={16} fill="white" /></button>
                </div>
                <div className="trend-info">
                  <h4>{music.title}</h4>
                  <p>{music.style} • {music.duration_str}</p>
                  <span className="trend-plays"><Play size={10} fill="#FF3366" color="#FF3366" /> Tendance</span>
                </div>
              </div>
            )) : (
              <p style={{color: 'var(--text-secondary)', fontSize: 14, marginLeft: '20px'}}>Aucune musique en tendance pour le moment.</p>
            )}
          </div>
        </section>

        <section className="section-block">
          <div className="section-header">
            <h3>Démarrer rapidement</h3>
            <a href="#" className="link-secondary">Voir tout</a>
          </div>
          <div className="horizontal-scroll">
            <div className="genre-card" onClick={() => navigate('/create', { state: { style: 'Afrobeat' } })} style={{cursor: 'pointer'}}>
              <div className="genre-icon orange"><Drum size={24} /></div>
              <span>Afrobeat</span>
            </div>
            <div className="genre-card" onClick={() => navigate('/create', { state: { style: 'Amapiano' } })} style={{cursor: 'pointer'}}>
              <div className="genre-icon blue"><Piano size={24} /></div>
              <span>Amapiano</span>
            </div>
            <div className="genre-card" onClick={() => navigate('/create', { state: { style: 'Rap' } })} style={{cursor: 'pointer'}}>
              <div className="genre-icon purple"><Mic2 size={24} /></div>
              <span>Rap</span>
            </div>
            <div className="genre-card" onClick={() => navigate('/create', { state: { style: 'Gospel' } })} style={{cursor: 'pointer'}}>
              <div className="genre-icon pink"><Church size={24} /></div>
              <span>Gospel</span>
            </div>
            <div className="genre-card" onClick={() => navigate('/create', { state: { style: "R'n'B" } })} style={{cursor: 'pointer'}}>
              <div className="genre-icon red"><Heart size={24} /></div>
              <span>R'n'B</span>
            </div>
          </div>
        </section>

        {/* CARROUSELS PAR STYLE */}
        {styleCarousels.map(({ label, icon, style }) => {
          const tracks = trending.filter(t => t.style === style);
          if (tracks.length === 0) return null;
          return (
            <section className="section-block" key={style}>
              <div className="section-header">
                <h3 style={{display:'flex',alignItems:'center',gap:6}}>{label.icon}{label.label}</h3>
                <button className="link-secondary" onClick={() => navigate('/create', { state: { style } })} style={{background:'none',border:'none',cursor:'pointer',color:'var(--primary-color)',fontSize:13}}>Créer →</button>
              </div>
              <div className="horizontal-scroll">
                {tracks.map((music) => (
                  <div className="trend-card" key={music.id}>
                    <div className="trend-img-container">
                      <img src={music.cover_url || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop"} alt={music.title} className="trend-img" />
                      <button className="play-btn" onClick={() => handleDemoPlay(music.id, music.audio_url, music.title, music.style, music.duration_str, music.lyrics, tracks)}><Play size={16} fill="white" /></button>
                    </div>
                    <div className="trend-info">
                      <h4>{music.title}</h4>
                      <p>{music.style} • {music.duration_str}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}


        {/* SECTION ELEMENTS DE CONFIANCE */}
        <section className="section-block trust-section">
          <h3 style={{textAlign:'center', marginBottom: 20}}>Pourquoi choisir Click & Vibe ?</h3>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon"><Headphones size={28} color="#C466FF" /></div>
              <div className="trust-text">
                <strong>Qualité Professionnelle</strong>
                <span>Des chansons générées en moins de 2 minutes</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><ShieldCheck size={28} color="#10b981" /></div>
              <div className="trust-text">
                <strong>Paiement Sécurisé</strong>
                <span>Orange Money · MTN MoMo · Wave</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Star size={28} color="#FFB800" fill="#FFB800" /></div>
              <div className="trust-text">
                <strong>Apprécié par nos utilisateurs</strong>
                <span>⭐⭐⭐⭐⭐ Satisfaction garantie</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Users size={28} color="#FF3366" /></div>
              <div className="trust-text">
                <strong>Support disponible</strong>
                <span>Assistance via WhatsApp</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block" style={{ paddingBottom: '80px' }}>
          <div className="section-header">
            <h3>Vos dernières créations</h3>
            <Link to="/history" className="link-secondary">Voir tout</Link>
          </div>
          <div className="vertical-list">
            {history.length > 0 ? history.map((music) => (
              <div className="creation-item" key={music.id}>
                <div className="creation-img-container">
                  <div style={{width: 60, height: 60, background: 'linear-gradient(135deg, #FF3366 0%, #9933FF 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Music size={24} color="white" />
                  </div>
                  <button className="play-btn small" onClick={() => playTrack({
                    url: music.audio_url,
                    title: music.title || "Ma création",
                    style: music.style,
                    duration_str: music.duration_str
                  }, history)}><Play size={12} fill="white" /></button>
                </div>
                <div className="creation-info">
                  <h4>{music.title || "Ma création"}</h4>
                  <p>{music.style} • {music.duration_str}</p>
                </div>
                <div className="creation-actions">
                  <button><MoreVertical size={18} /></button>
                  <button className="btn-share"><Share2 size={16} /></button>
                </div>
              </div>
            )) : (
              <p style={{color: 'var(--text-secondary)', fontSize: 14}}>Aucune création pour le moment.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
