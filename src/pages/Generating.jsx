import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap, Check, Music, SlidersHorizontal, Sparkles, Edit2, Drum, Sunrise, AudioLines, Clock, Globe, Lightbulb, X, Compass, User, Play, Pause, Circle, CheckCircle2, Download, Share2, Headphones, RotateCcw, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import './Generating.css';
import '../pages/Home.css';

function Generating() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshCredits } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();
  const { prompt = "Une chanson afrobeat romantique sur l'amour sincère, avec une ambiance douce et entraînante.", style = "Afrobeat", mood = "Romantique", voice = "Féminine", tempo = "Normal", duration = "2:30", language = "Français" } = location.state || {};
  
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [generatedAudios, setGeneratedAudios] = useState([]);
  const [generationError, setGenerationError] = useState(null);
  
  const hasRequested = useRef(false);

  // Fetch audio from backend
  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;
    let interval;
    const generateAudio = async () => {
      try {
        // Start fake progress
        interval = setInterval(() => {
          setProgress(p => {
            if (p >= 99) return 99;
            return p + 2;
          });
        }, 1000);

        // Call the backend API
        const token = localStorage.getItem('token');

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'ngrok-skip-browser-warning': '69420'
          },
          body: JSON.stringify({
            prompt: `${style} ${mood} ${language} Voix ${voice} Tempo ${tempo} ${prompt}`,
            duration: 150
          })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          // data.versions is now an array of objects: {url, image_url, title}
          setGeneratedAudios(data.versions.map((track, index) => ({ 
            id: index === 0 ? 'A' : 'B', 
            url: track.url,
            image_url: track.image_url,
            title: track.title && track.title.trim() !== "" ? track.title : `Création ${style}`
          })));
          await refreshCredits(); // Deduct credits
          clearInterval(interval);
          setProgress(100);
          setIsFinished(true);
        } else if (response.ok && data.status === 'pending' && data.task_id) {
          // Generation is running asynchronously, start frontend polling
          const taskId = data.task_id;
          
          let isPolling = true;
          const poll = async () => {
            if (!isPolling) return;
            try {
              const statusRes = await fetch(`/api/generate/status/${taskId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'ngrok-skip-browser-warning': '69420'
                }
              });
              
              const statusData = await statusRes.json();
              
              if (statusRes.ok && statusData.status === 'success') {
                isPolling = false;
                const newAudios = statusData.versions.map((track, index) => ({ 
                  id: index === 0 ? 'A' : 'B', 
                  url: track.url,
                  image_url: track.image_url,
                  lyrics: track.lyrics,
                  title: track.title && track.title.trim() !== "" ? track.title : `Création ${style} (Version ${index + 1})`
                }));
                setGeneratedAudios(newAudios);
                await refreshCredits(); // Deduct credits
                
                clearInterval(interval);
                setProgress(100);
                setIsFinished(true);

                // Sauvegarder automatiquement en arrière-plan sans bloquer l'UI
                Promise.all(newAudios.map(async (track) => {
                  if (track.url) {
                    try {
                      const payload = {
                        title: track.title,
                        prompt: prompt,
                        style: style,
                        mood: mood,
                        duration_str: duration,
                        audio_url: track.url,
                        cover_url: track.image_url || '',
                        lyrics: track.lyrics || ''
                      };
                      await fetch(`/api/music/save`, {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                      });
                    } catch (e) {
                      console.error("Erreur de sauvegarde automatique :", e);
                    }
                  }
                }));
              } else if (statusData.status === 'error') {
                isPolling = false;
                clearInterval(interval);
                setGenerationError(statusData.detail || "Erreur lors de la génération avec l'API Suno.");
              } else {
                if (isPolling) setTimeout(poll, 5000);
              }
            } catch (err) {
              console.error("Polling error:", err);
              if (isPolling) setTimeout(poll, 5000);
            }
          };
          setTimeout(poll, 5000); // Start polling after 5 seconds
          
          window.__stopPolling = () => { isPolling = false; };
        } else {
           console.error("Erreur serveur:", data);
           clearInterval(interval);
           setGenerationError(data.detail || data.msg || "Une erreur est survenue lors de la génération avec l'API Suno.");
        }
      } catch (error) {
        console.error("Error generating music:", error);
        clearInterval(interval);
        setGenerationError("Impossible de se connecter au serveur de génération. Vérifiez votre connexion.");
      }
    };

    generateAudio();

    return () => {
      if (interval) clearInterval(interval);
      if (window.__currentPollInterval) clearInterval(window.__currentPollInterval);
    };
  }, []);

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Erreur lors du téléchargement direct:", e);
      window.open(url, '_blank'); // Fallback si CORS bloque
    }
  };

  if (generationError) {
    return (
      <div className="generating-container" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding: '2rem', textAlign: 'center'}}>
        <div style={{width: 80, height: 80, borderRadius: '50%', background: 'rgba(255, 51, 102, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px'}}>
          <X size={40} color="#FF3366" />
        </div>
        <h2 style={{marginBottom: 10}}>Échec de la génération</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: 30}}>{generationError}</p>
        <button className="btn-primary-gradient" onClick={() => navigate(-1)} style={{padding: '15px 30px', borderRadius: 30, display: 'flex', alignItems: 'center', gap: 10, border: 'none', color: 'white', fontWeight: 'bold'}}>
          <RotateCcw size={20} />
          Retour et réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="generating-container">
      <header className="recharge-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-title-center">
          <h1>Génération en cours</h1>
          <p>Ta musique prend vie...</p>
        </div>
        <div className="points-badge">
          <Zap size={16} fill="#FFB800" color="#FFB800" />
          <span>{user ? user.credits : 0}</span>
        </div>
      </header>

      <div className="generating-content">
        <div className="stepper-container">
          <div className="stepper-line">
            <div className="stepper-line-fill" style={{width: `${progress}%`}}></div>
          </div>
          <div className="stepper-steps">
            <div className="step completed">
              <div className="step-icon"><Check size={14} strokeWidth={3} /></div>
              <span>Prompt reçu</span>
            </div>
            <div className={`step ${progress > 50 ? 'completed' : 'active'}`}>
              <div className="step-icon">
                {progress > 50 ? <Check size={14} strokeWidth={3} /> : <Music size={14} fill="currentColor" />}
              </div>
              <span>Génération</span>
            </div>
            <div className={`step ${isFinished ? 'completed' : (progress > 50 ? 'active' : '')}`}>
              <div className="step-icon">
                {isFinished ? <Check size={14} strokeWidth={3} /> : <SlidersHorizontal size={14} />}
              </div>
              <span>Finalisation</span>
            </div>
            <div className={`step ${isFinished ? 'completed' : ''}`}>
              <div className="step-icon">
                {isFinished ? <Check size={14} strokeWidth={3} /> : <div className="dot-placeholder"></div>}
              </div>
              <span>Terminé</span>
            </div>
          </div>
        </div>

        {!isFinished ? (
          <section className="generating-main-card">
            <div className="glowing-orb-container">
              <div className="orb-ring ring-1"></div>
              <div className="orb-ring ring-2"></div>
              <div className="orb-ring ring-3"></div>
              <div className="orb-center">
                <Music size={48} color="white" fill="white" className="orb-music-icon" />
              </div>
            </div>

            <div className="generating-status-text">
              <h2>Génération de ta musique...</h2>
              <p>Cela peut prendre entre 20 et 40 secondes.<br/>Merci pour ta patience.</p>
            </div>

            <div className="progress-bar-container">
              <div className="progress-track">
                <div className="progress-fill-animated" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-percentage">{progress}%</span>
            </div>
          </section>
        ) : (
          <div className="finished-state-container">
            <header className="result-header">
              <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={24} />
              </button>
              <div className="header-title-center">
                <h1>Résultat de ta génération</h1>
                <p>Nous avons généré 2 versions pour toi</p>
              </div>
              <div className="points-badge">
                <Zap size={16} fill="#FF3366" color="#FF3366" />
                <span>110</span>
              </div>
            </header>

            <section className="result-hero-card">
              <div className="hero-cover">
                <img src={generatedAudios[selectedVersion === 'A' ? 0 : 1]?.image_url || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300&h=300"} alt="Cover" className="cover-img" />
                <div className="cover-title-overlay">
                  <h3>{generatedAudios[selectedVersion === 'A' ? 0 : 1]?.title || "Génération"}</h3>
                </div>
              </div>
              <div className="hero-info">
                <div className="hero-title-row">
                  <h2>{generatedAudios[selectedVersion === 'A' ? 0 : 1]?.title || "Nouvelle Création"}</h2>
                  <span className="badge-new">Nouveau</span>
                </div>
                <div className="hero-meta">
                  {style} • {duration} • 100 BPM
                </div>
                <p className="hero-desc">{prompt}</p>
                <div className="hero-pills">
                  <span className="pill"><Drum size={12} color="#FF6B00" /> {style}</span>
                  <span className="pill"><Sunrise size={12} color="#FF3366" /> {mood}</span>
                  <span className="pill"><Globe size={12} color="#9933FF" /> {language}</span>
                </div>
              </div>
            </section>

            <section className="versions-selection">
              <h3 className="section-title">Choisis ta version préférée</h3>
              
              <div 
                className={`version-card-detailed ${selectedVersion === 'A' ? 'selected' : ''}`}
                onClick={() => setSelectedVersion('A')}
              >
                <div className="version-header">
                  <div className="version-play-btn pink-gradient" onClick={(e) => {
                    e.stopPropagation();
                    if (generatedAudios[0]?.url) playTrack({ ...generatedAudios[0], title: 'Version 1', style, mood });
                  }}>
                    {currentTrack?.url === generatedAudios[0]?.url && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </div>
                  <div className="version-title">
                    <h4>Version 1</h4>
                    <span className="badge-ai"><Sparkles size={10} /> Recommandée par l'IA</span>
                  </div>
                  <div className="version-time">{duration}</div>
                </div>
                
                <div className="audio-player-container">
                  {generatedAudios[0]?.url ? (
                    <div className="waveform-mock"></div>
                  ) : (
                    <div className="waveform-mock"></div>
                  )}
                </div>

                <div className="version-footer">
                  <p>Plus douce et romantique, avec une mélodie émotionnelle et des voix chaleureuses.</p>
                  <div className="version-check">
                    {selectedVersion === 'A' ? (
                      <CheckCircle2 size={24} color="#FF3366" fill="#FF3366" stroke="white" />
                    ) : (
                      <Circle size={24} color="rgba(255,255,255,0.2)" />
                    )}
                  </div>
                </div>
              </div>

              <div 
                className={`version-card-detailed ${selectedVersion === 'B' ? 'selected' : ''}`}
                onClick={() => setSelectedVersion('B')}
              >
                <div className="version-header">
                  <div className="version-play-btn purple-gradient" onClick={(e) => {
                    e.stopPropagation();
                    if (generatedAudios[1]?.url) playTrack({ ...generatedAudios[1], title: 'Version 2', style, mood });
                  }}>
                    {currentTrack?.url === generatedAudios[1]?.url && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </div>
                  <div className="version-title">
                    <h4>Version 2</h4>
                  </div>
                  <div className="version-time">{duration}</div>
                </div>
                
                <div className="audio-player-container">
                  {generatedAudios[1]?.url ? (
                    <div className="waveform-mock alt"></div>
                  ) : (
                    <div className="waveform-mock alt"></div>
                  )}
                </div>

                <div className="version-footer">
                  <p>Plus rythmée et entraînante, avec des percussions prononcées et une vibe dansante.</p>
                  <div className="version-check">
                    {selectedVersion === 'B' ? (
                      <CheckCircle2 size={24} color="#FF3366" fill="#FF3366" stroke="white" />
                    ) : (
                      <Circle size={24} color="rgba(255,255,255,0.2)" />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="action-grid-section">
              <h3 className="section-title">Que veux-tu faire maintenant ?</h3>
              <div className="action-grid">
                <button className="action-square active" onClick={async () => {
                  if (!selectedVersion) {
                    alert("Sélectionnez d'abord une version !");
                    return;
                  }
                  const versionIndex = selectedVersion === 'A' ? 0 : 1;
                  const audioUrl = generatedAudios[versionIndex]?.url;
                  
                  try {
                    const token = localStorage.getItem('token');
                    const trackTitle = generatedAudios[versionIndex]?.title || 'Génération IA';
                    const coverUrl = generatedAudios[versionIndex]?.image_url || '';
                    
                    const payload = {
                      title: trackTitle,
                      prompt: prompt,
                      style: style,
                      mood: mood,
                      duration_str: duration,
                      audio_url: audioUrl,
                      cover_url: coverUrl,
                      lyrics: generatedAudios[versionIndex]?.lyrics || ''
                    };
                    
                    await fetch(`/api/music/save`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(payload)
                    });
                    alert("Musique ajoutée à ton historique !");
                  } catch (e) {
                    console.error(e);
                  }
                }}>
                  <Heart size={24} />
                  <span>Favoris</span>
                </button>
                <button className="action-square" onClick={() => {
                  if (!selectedVersion) {
                    alert("Sélectionnez d'abord une version pour la télécharger !");
                    return;
                  }
                  const versionIndex = selectedVersion === 'A' ? 0 : 1;
                  const audioUrl = generatedAudios[versionIndex]?.url;
                  if (audioUrl) {
                    handleDownload(audioUrl, `click_and_vibe_${Date.now()}.mp3`);
                  }
                }}>
                  <Download size={24} />
                  <span>Télécharger</span>
                </button>
                <button className="action-square" onClick={() => navigate(-1)}>
                  <Edit2 size={24} />
                  <span>Modifier</span>
                </button>
                <button className="action-square">
                  <RotateCcw size={24} />
                  <span>Régénérer</span>
                </button>
                <button className="action-square" onClick={async () => {
                  try {
                    const versionIndex = selectedVersion === 'A' ? 0 : 1;
                    const audioUrl = generatedAudios[versionIndex]?.url;
                    if (navigator.share && audioUrl) {
                      await navigator.share({
                        title: 'Ma création musicale',
                        text: `Écoute ma nouvelle musique générée par IA : ${prompt}`,
                        url: window.location.origin + audioUrl
                      });
                    } else {
                      alert("Le partage n'est pas supporté sur cet appareil.");
                    }
                  } catch (e) {
                    console.error("Partage annulé ou échoué", e);
                  }
                }}>
                  <Share2 size={24} />
                  <span>Partager</span>
                </button>
              </div>
            </section>

          </div>
        )}

        {showHint && (
          <section className="hint-banner">
            <div className="hint-icon">
              <Lightbulb size={24} color="#FF3366" />
            </div>
            <div className="hint-text">
              <h4>Le savais-tu ?</h4>
              <p>Plus ton prompt est détaillé, plus le résultat correspondra à tes attentes.</p>
            </div>
            <button className="close-hint-btn" onClick={() => setShowHint(false)}>
              <X size={16} />
            </button>
          </section>
        )}
      </div>

      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <div className="nav-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
          <span>Accueil</span>
        </Link>
        <Link to="/create" className="nav-item active text-primary">
          <div className="nav-icon"><Music size={24} /></div>
          <span>Créer</span>
        </Link>
        <Link to="/credits" className="nav-item">
          <div className="nav-icon"><Zap size={24} /></div>
          <span>Recharger</span>
        </Link>
        <Link to="/explore" className="nav-item">
          <div className="nav-icon"><Compass size={24} /></div>
          <span>Explorer</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <div className="nav-icon"><User size={24} /></div>
          <span>Profil</span>
        </Link>
      </nav>
    </div>
  );
}

export default Generating;
