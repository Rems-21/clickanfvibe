import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Music, Compass, User, Search, SlidersHorizontal, Plus, ListMusic, Heart, Trash2, ChevronDown, LayoutGrid, List, Play, MoreVertical, Flame, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import Skeleton from '../components/Skeleton';
import './Explore.css';
import '../pages/Home.css';

function Explore() {
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const [songs, setSongs] = useState([]);
  const [favoritesMap, setFavoritesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Fetch explore tracks
        const resExplore = await fetch('/api/music/explore');
        if (resExplore.ok) {
          const exploreData = await resExplore.json();
          setSongs(exploreData);
        }

        // Fetch favorites to build map
        if (token) {
          const resFavs = await fetch('/api/music/favorites', { headers });
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
        console.error("Error fetching explore data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const filteredSongs = songs.filter(song => {
    if (activeFilter === 'Favoris' && !favoritesMap[song.id]) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(song.title && song.title.toLowerCase().includes(q)) && !(song.style && song.style.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="explore-container">
      <div className="page-header-simple">
        <div className="title-section">
          <h1>Explorer</h1>
          <p className="subtitle">Découvrez de nouvelles <span className="text-primary">vibes</span>.</p>
        </div>
        <div className="search-bar mobile-only" style={{display: 'flex', background: 'rgba(255,255,255,0.05)', alignItems: 'center', padding: '10px 16px', borderRadius: 24, marginTop: 16}}>
           <Search size={18} color="rgba(255,255,255,0.5)" />
           <input 
             type="text" 
             placeholder="Rechercher une musique, un style..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             style={{background: 'transparent', border: 'none', color: 'white', marginLeft: 8, outline: 'none', width: '100%'}}
           />
        </div>
      </div>

      <div className="explore-content">
        <div className="filter-pills horizontal-scroll no-scrollbar">
          <button className={`filter-pill ${activeFilter === 'Toutes' ? 'active' : ''}`} onClick={() => setActiveFilter('Toutes')}>
            <Music size={14} /> Toutes
          </button>
          <button className={`filter-pill ${activeFilter === 'Favoris' ? 'active' : ''}`} onClick={() => setActiveFilter('Favoris')}>
            <Heart size={14} /> Favoris
          </button>
        </div>

        {isLoading ? (
          <div className="songs-grid">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} type="card" />
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)'}}>
            <Compass size={48} style={{opacity: 0.2, marginBottom: 16}} />
            <h3>Aucune vibe trouvée</h3>
          </div>
        ) : (
          <div className="songs-grid">
            {filteredSongs.map((song) => (
            <div key={song.id} className="song-grid-card">
              <div className="song-image-wrapper">
                {song.cover_url ? (
                  <img src={song.cover_url} alt={song.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <div style={{width: '100%', height: '100%', background: 'linear-gradient(135deg, #FF3366 0%, #9933FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Music size={32} color="rgba(255,255,255,0.5)" />
                  </div>
                )}
                {song.isNew && <span className="badge-new">Nouveau</span>}
                <div className="song-image-overlay">
                  <button className="play-circle-btn" onClick={() => playTrack({
                    url: song.audio_url,
                    title: song.title,
                    style: song.style,
                    duration_str: song.duration_str,
                    lyrics: song.lyrics
                  }, filteredSongs)}>
                    <Play size={14} fill="white" />
                  </button>
                  <button className="heart-circle-btn" onClick={() => toggleFavorite(song.id)}>
                    <Heart size={14} color="#FF3366" fill={favoritesMap[song.id] ? "#FF3366" : "none"} />
                  </button>
                </div>
              </div>
              <div className="song-card-info">
                <div className="song-card-text">
                  <h4>{song.title}</h4>
                  <p>{song.style} • {song.duration_str}</p>
                </div>
                <button className="more-btn">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
          {filteredSongs.length === 0 && (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)'}}>
              Aucune chanson trouvée.
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
