import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const audioRef = useRef(new Audio());

  // Use a ref to access the latest state in event listeners without re-binding
  const stateRef = useRef({ playlist, currentTrack });
  
  useEffect(() => {
    stateRef.current = { playlist, currentTrack };
  }, [playlist, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      // Contournement du bug d'Infinity sur les navigateurs basés sur Chromium
      // avec les fichiers audio générés par l'IA (qui manquent parfois d'en-têtes)
      let currentDuration = audio.duration;
      
      if (currentDuration && currentDuration !== Infinity && !isNaN(currentDuration)) {
        setProgress((audio.currentTime / currentDuration) * 100);
      } else {
        // Si la durée est infinie, on essaye de forcer le navigateur à la calculer
        // en simulant un saut à la fin du fichier, ou on fait une estimation par défaut (120s)
        const estimatedDuration = 120; // 2 minutes par défaut
        setProgress((audio.currentTime / estimatedDuration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        // Astuce classique pour forcer la récupération de la durée
        audio.currentTime = 1e101;
        setTimeout(() => {
          audio.currentTime = 0;
        }, 100);
      }
    };

    const playNextFromState = () => {
      const { playlist: currentList, currentTrack: track } = stateRef.current;
      if (!currentList || currentList.length === 0 || !track) return;
      
      const trackUrl = track.url || track.audio_url;
      const currentIndex = currentList.findIndex(t => (t.url || t.audio_url) === trackUrl);
      
      if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
        const nextTrack = currentList[currentIndex + 1];
        playTrack(nextTrack, currentList);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    const handleEnded = () => {
      playNextFromState();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playTrack = (track, list = null) => {
    const audio = audioRef.current;
    
    // Normalize track format
    const normalizedTrack = {
      ...track,
      url: track.url || track.audio_url
    };

    if (list !== null) {
      setPlaylist(list);
    }

    if (currentTrack?.url === normalizedTrack.url) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      audio.src = normalizedTrack.url;
      audio.play();
      setCurrentTrack(normalizedTrack);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!playlist || playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex(t => (t.url || t.audio_url) === currentTrack.url);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playTrack(playlist[currentIndex + 1], playlist);
    }
  };

  const playPrevious = () => {
    if (!playlist || playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex(t => (t.url || t.audio_url) === currentTrack.url);
    if (currentIndex > 0) {
      playTrack(playlist[currentIndex - 1], playlist);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else if (currentTrack) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const closePlayer = () => {
    audioRef.current.pause();
    setCurrentTrack(null);
    setIsPlaying(false);
    setPlaylist([]);
  };

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, playlist, playTrack, togglePlay, closePlayer, playNext, playPrevious }}>
      {children}
    </AudioContext.Provider>
  );
};
