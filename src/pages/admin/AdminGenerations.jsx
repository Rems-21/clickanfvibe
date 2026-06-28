import React, { useState, useEffect } from 'react';
import { Search, Play, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminGenerations() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        const res = await fetch('/api/admin/musics', {
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
      const res = await fetch(`/api/admin/musics/${musicId}/trending`, {
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
      const res = await fetch(`/api/admin/musics/${musicId}/explore`, {
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

  const deleteMusic = async (musicId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette musique de la base de données ?")) return;
    try {
      const res = await fetch(`/api/admin/musics/${musicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMusics(musics.filter(m => m.id !== musicId));
      } else {
        const text = await res.text();
        alert(`Erreur lors de la suppression (Code ${res.status}): ${text}`);
      }
    } catch (err) {
      console.error("Erreur de suppression", err);
      alert(`Erreur réseau: ${err.message}`);
    }
  };

  const filteredMusics = musics.filter(m => 
    (m.title && m.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (m.user_name && m.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>Générations 🎵</h1>
          <p>Gestion de toutes les musiques générées par les utilisateurs</p>
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
          <p>Chargement des musiques...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Titre</th>
                <th>Créateur</th>
                <th>Style / Mood</th>
                <th>Durée</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMusics.map(m => (
                <tr key={m.id}>
                  <td>
                    {m.cover_url ? (
                      <img src={m.cover_url} alt="Cover" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#333' }}></div>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{m.title}</td>
                  <td>{m.user_name}</td>
                  <td><span style={{ color: '#a855f7' }}>{m.style}</span> / {m.mood}</td>
                  <td>{m.duration_str}</td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
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
                      <button 
                        onClick={() => deleteMusic(m.id)}
                        style={{ 
                          background: 'rgba(255, 0, 0, 0.1)', 
                          color: '#ef4444', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
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

export default AdminGenerations;
