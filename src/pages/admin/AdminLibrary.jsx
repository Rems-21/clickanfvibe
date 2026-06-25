import React, { useState, useEffect } from 'react';
import { Search, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminLibrary() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/admin/musics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMusics(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMusics();
  }, [token]);

  const toggleTrending = async (musicId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/musics/${musicId}/trending`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMusics(musics.map(m => m.id === musicId ? { ...m, is_trending: data.is_trending } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExplore = async (musicId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/musics/${musicId}/explore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMusics(musics.map(m => m.id === musicId ? { ...m, is_explore: data.is_explore } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uniqueMusics = Array.from(new Map(musics.map(m => [m.title, m])).values());

  const filteredMusics = uniqueMusics.filter(m => 
    (m.title && m.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (m.user_name && m.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>Bibliothèque Globale 🎧</h1>
          <p>Le catalogue complet des musiques créées sur la plateforme</p>
        </div>
        <div className="admin-topbar-right">
          <div className="admin-search">
            <Search size={18} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Rechercher par titre ou créateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>
      
      <div className="admin-table-card">
        {loading ? (
          <p>Chargement du catalogue...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Titre</th>
                <th>Créateur</th>
                <th>Style / Mood</th>
                <th>Durée</th>
                <th>Lecture</th>
              </tr>
            </thead>
            <tbody>
              {filteredMusics.map(m => (
                <tr key={m.id}>
                  <td>
                    {m.cover_url ? (
                      <img src={m.cover_url} alt="Cover" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#333' }}></div>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{m.title}</td>
                  <td>{m.user_name}</td>
                  <td><span style={{ color: '#a855f7' }}>{m.style}</span> / {m.mood}</td>
                  <td>{m.duration_str}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {m.audio_url ? (
                        <audio controls src={m.audio_url} style={{ height: '36px', width: '200px' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: '#666' }}>Erreur</span>
                      )}
                      <button 
                        onClick={() => toggleTrending(m.id)}
                        style={{ 
                          background: m.is_trending ? '#eab308' : 'rgba(255,255,255,0.1)', 
                          color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' 
                        }}
                      >
                        {m.is_trending ? '★ Tendance' : '☆ Tendance'}
                      </button>
                      <button 
                        onClick={() => toggleExplore(m.id)}
                        style={{ 
                          background: m.is_explore ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
                          color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' 
                        }}
                      >
                        {m.is_explore ? '★ Explorer' : '☆ Explorer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminLibrary;
