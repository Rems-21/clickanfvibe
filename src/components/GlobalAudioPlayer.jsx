import React, { useState } from 'react';
import { Play, Pause, X, Music, Drum, ChevronDown, Heart, Share2, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import './GlobalAudioPlayer.css';

function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, progress, togglePlay, closePlayer, playNext, playPrevious, playlist } = useAudio();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentTrack) return null;

  if (isFullScreen) {
    return (
      <div className="full-screen-player">
        <div className="player-bg-orb orb-1"></div>
        <div className="player-bg-orb orb-2"></div>
        <div className="player-glass-overlay">
          <div className="full-screen-header">
            <button className="icon-btn-transparent" onClick={() => setIsFullScreen(false)}>
              <ChevronDown size={28} color="white" />
            </button>
            <span className="now-playing-text">{showLyrics ? "Paroles" : "En lecture"}</span>
            <button className="icon-btn-transparent" style={{opacity: 0}}>
              <ChevronDown size={28} />
            </button>
          </div>

          {!showLyrics ? (
            <div className="full-screen-art-container">
              <div className={`record-disk ${isPlaying ? 'spinning glow-pulse' : ''}`}>
                <div className="record-center-label">
                  <Music size={40} color="white" />
                </div>
                <div className="record-hole"></div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', textAlign: 'center', color: '#fff', fontSize: '18px', lineHeight: '1.8' }}>
              {currentTrack.lyrics ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{currentTrack.lyrics}</div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '50px' }}>Aucune parole disponible pour ce titre.</div>
              )}
            </div>
          )}

          <div className="full-screen-info">
            <div className="full-screen-title-group">
              <h2>{currentTrack.title || "Titre inconnu"}</h2>
              <p>{currentTrack.style || "Musique"} • {currentTrack.duration_str || "0:00"}</p>
            </div>
            <button className="icon-btn-transparent" onClick={() => setShowLyrics(!showLyrics)} style={{ background: showLyrics ? 'rgba(255,255,255,0.2)' : 'transparent', borderRadius: '50%', padding: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>TXT</span>
            </button>
          </div>

          <div className="full-screen-progress-container">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill glow-bar" style={{ width: `${progress || 0}%` }}></div>
              <div className="progress-bar-thumb" style={{ left: `${progress || 0}%` }}></div>
            </div>
          </div>

          <div className="full-screen-controls">
            <button className="icon-btn-transparent" onClick={playPrevious} style={{opacity: playlist?.length ? 1 : 0.5}}>
              <SkipBack size={32} color="white" fill="white" />
            </button>
            <button className="full-screen-play-btn btn-primary-gradient" onClick={togglePlay} style={{padding: 0}}>
              {isPlaying ? <Pause size={32} fill="white" color="white" /> : <Play size={32} fill="white" color="white" style={{marginLeft: 4}} />}
            </button>
            <button className="icon-btn-transparent" onClick={playNext} style={{opacity: playlist?.length ? 1 : 0.5}}>
              <SkipForward size={32} color="white" fill="white" />
            </button>
          </div>

          <div className="full-screen-footer">
            <button className="icon-btn-transparent">
              <Share2 size={24} color="var(--text-secondary)" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="global-player-container">
      <div className="global-player-progress">
        <div className="global-player-progress-fill" style={{ width: `${progress || 0}%` }}></div>
      </div>
      <div className="global-player-content">
        <div className="global-player-info" onClick={() => setIsFullScreen(true)} style={{cursor: 'pointer'}}>
          <div className="global-player-icon">
            <Music size={16} />
          </div>
          <div className="global-player-text">
            <h4>{currentTrack.title || "Titre inconnu"}</h4>
            <p><Drum size={10} style={{marginRight: 4}}/> {currentTrack.style || "Musique"} • {currentTrack.duration_str || "0:00"}</p>
          </div>
        </div>
        <div className="global-player-actions">
          <button className="global-btn-play" onClick={togglePlay}>
            {isPlaying ? <Pause size={18} fill="black" color="black" /> : <Play size={18} fill="black" color="black" style={{marginLeft: 2}} />}
          </button>
          <button className="global-btn-close" onClick={closePlayer}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GlobalAudioPlayer;
