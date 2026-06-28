import React, { useState } from 'react';
import { Send, Bell, User, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './AdminDashboard.css';

function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { token } = useAuth();
  const { addToast } = useNotification();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setLoading(true);
    try {
      const payload = {
        title,
        message,
        type,
        user_id: targetUserId ? parseInt(targetUserId) : null
      };

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        addToast("Notification envoyée", "La notification a bien été envoyée avec succès.", "success");
        setTitle('');
        setMessage('');
        setTargetUserId('');
      } else {
        addToast("Erreur d'envoi", "Une erreur est survenue lors de l'envoi.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Erreur réseau", "Impossible de joindre le serveur.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar" style={{ marginBottom: '30px' }}>
        <div className="admin-topbar-left">
          <h1>Envoyer une Notification <Bell size={24} style={{ marginLeft: '10px', verticalAlign: 'bottom' }} /></h1>
          <p>Envoyez des messages aux utilisateurs (popups & alertes persistantes)</p>
        </div>
      </header>

      <div style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSend} className="admin-table-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Cible :</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked={targetUserId === ''} 
                  onChange={() => setTargetUserId('')}
                  name="target"
                />
                <Users size={16} /> Tous les utilisateurs
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked={targetUserId !== ''} 
                  onChange={() => setTargetUserId('1')} // default to some id to activate input
                  name="target"
                />
                <User size={16} /> Utilisateur spécifique
              </label>
            </div>
            
            {targetUserId !== '' && (
              <input 
                type="number" 
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="ID de l'utilisateur"
                className="admin-input"
                style={{ marginTop: '10px' }}
                required
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Type :</label>
            <select value={type} onChange={e => setType(e.target.value)} className="admin-input">
              <option value="info">Info (Bleu)</option>
              <option value="success">Succès (Vert)</option>
              <option value="warning">Avertissement (Orange)</option>
              <option value="error">Erreur (Rouge)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Titre :</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mise à jour, Maintenance, Promo..."
              className="admin-input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Message :</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contenu de la notification..."
              className="admin-input"
              style={{ minHeight: '100px', resize: 'vertical' }}
              required
            />
          </div>

          <button type="submit" className="btn-primary-gradient" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <Send size={18} />
            {loading ? "Envoi en cours..." : "Envoyer la notification"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminNotifications;
