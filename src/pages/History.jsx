import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Music, Heart, Share2, MoreVertical, Drum, Calendar, Zap, Compass, User, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import Skeleton from '../components/Skeleton';
import './History.css';
import '../pages/Home.css';

function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { playTrack } = useAudio();
  
  const [history, setHistory] = useState([]);
  const [favoritesMap, setFavoritesMap] = useState({});
  const [downloadedSongs, setDownloadedSongs] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'history');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/music/history', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok) {
            setHistory(data);
          }
          
          // Fetch favorites
          const resFavs = await fetch('/api/music/favorites', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resFavs.ok) {
            const favsData = await resFavs.json();
            const fMap = {};
            favsData.forEach(f => {
               fMap[f.id] = true;
            });
            setFavoritesMap(fMap);
          }
        }
      } catch (err) {
        console.error("Erreur de récupération de l'historique", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
    
    // Load downloaded songs from localStorage
    try {
      const stored = localStorage.getItem('downloaded_songs');
      if (stored) {
        setDownloadedSongs(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDownload = async (music) => {
    try {
      const response = await fetch(music.audio_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${music.title ? music.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'creation'}_clickandvibe.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      const newDownloads = { ...downloadedSongs, [music.id]: true };
      setDownloadedSongs(newDownloads);
      localStorage.setItem('downloaded_songs', JSON.stringify(newDownloads));
    } catch (e) {
      console.error("Erreur téléchargement :", e);
      const a = document.createElement('a');
      a.href = music.audio_url;
      a.download = 'clickandvibe.mp3';
      a.click();
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const toggleFavorite = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Vous devez être connecté !');
      
      const res = await fetch(`/api/music/favorite/${songId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavoritesMap(prev => ({
          ...prev,
          [songId]: data.is_favorite
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="history-container">
      <div className="page-header-simple">
        <div className="title-section" style={{display: 'flex', alignItems: 'center'}}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{background: 'none', border: 'none', color: 'white', marginRight: 16, cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
            <ArrowLeft size={24} />
          </button>
          <h1>Mon Historique</h1>
        </div>
      </div>

      <div className="history-tabs">
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
          onClick={() => setActiveTab('history')}
          style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'history' ? 'white' : 'var(--text-secondary)', borderBottom: activeTab === 'history' ? '2px solid #FF3366' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Clock size={16} style={{marginRight: 8, verticalAlign: 'middle'}} />
          Historique Complet
        </button>
        <button 
          className={`tab-btn ${activeTab === 'downloads' ? 'active' : ''}`} 
          onClick={() => setActiveTab('downloads')}
          style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'downloads' ? 'white' : 'var(--text-secondary)', borderBottom: activeTab === 'downloads' ? '2px solid #FF3366' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Download size={16} style={{marginRight: 8, verticalAlign: 'middle'}} />
          Mes téléchargements
        </button>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="history-list">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} type="list" />
            ))}
          </div>
        ) : (
          <div className="history-list">
            {(() => {
              const displayList = history.filter(h => activeTab === 'history' || downloadedSongs[h.id]);
              if (displayList.length === 0) {
                return (
                  <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)'}}>
                    <Music size={48} style={{opacity: 0.2, marginBottom: 16}} />
                    <h3>Aucune musique dans cet onglet</h3>
                  </div>
                );
              }
              return displayList.map((music) => (
                <div key={music.id} className="history-card">
                  <div className="history-card-header">
                    {music.cover_url && (
                      <img src={music.cover_url} alt="Cover" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', marginRight: '16px' }} />
                    )}
                    <button className="play-circle-btn" onClick={() => playTrack({
                      url: music.audio_url,
                      title: music.title,
                      style: music.style,
                      duration_str: music.duration_str,
                      lyrics: music.lyrics
                    }, displayList)}>
                      <Play size={20} fill="currentColor" />
                    </button>
                      <div className="history-title-group">
                        <h3>{music.title || "Ma création"}</h3>
                        <div className="history-meta">
                          <span><Drum size={12} /> {music.style}</span>
                          <span><Clock size={12} /> {music.duration_str}</span>
                          <span><Calendar size={12} /> {formatDate(music.created_at)}</span>
                        </div>
                      </div>
                      <button className="icon-btn-small" onClick={() => toggleFavorite(music.id)}>
                        <Heart size={16} color="#FF3366" fill={favoritesMap[music.id] ? "#FF3366" : "none"} />
                      </button>
                    </div>
                <div className="history-prompt">
                  <p>"{music.prompt}"</p>
                </div>
                <div className="history-card-actions">
                  <button className="btn-secondary-small" onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: music.title || "Ma création",
                          text: `Écoute ma musique sur Click&Vibe: ${music.prompt}`,
                          url: window.location.origin + music.audio_url
                        });
                      } else {
                        alert("Le partage n'est pas supporté sur cet appareil.");
                      }
                    } catch (e) {
                      console.error("Partage annulé", e);
                    }
                  }}>
                    <Share2 size={14} /> Partager
                  </button>
                    <button 
                      className="btn-secondary-small" 
                      onClick={() => handleDownload(music)}
                    >
                      Télécharger
                    </button>
                </div>
              </div>
            ))})()}
          </div>
        )}
      </div>

    </div>
  );
}

export default History;
