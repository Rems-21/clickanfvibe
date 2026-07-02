import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Activity, Plus, Play, RefreshCw, X } from 'lucide-react';
import './AdminDashboard.css';

function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    html_content: "<p>Bonjour {nom},</p>\\n\\n<p>Ceci est un message de relance.</p>\\n\\n<p>L'équipe Click & Vibe</p>",
    target_audience: 'ALL'
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', subject: '', html_content: '', target_audience: 'ALL' });
        fetchCampaigns();
      } else {
        alert("Erreur lors de la création");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir envoyer cette campagne à tous les utilisateurs ciblés ? Cette action est irréversible.")) return;
    
    setSendingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert("Envoi démarré en arrière-plan avec succès !");
        fetchCampaigns();
      } else {
        const data = await res.json();
        alert("Erreur : " + data.detail);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setSendingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DRAFT': return <span className="kpi-trend neutral">Brouillon</span>;
      case 'SENDING': return <span className="kpi-trend positive"><RefreshCw size={12} className="spinning" style={{marginRight:4}} /> En cours</span>;
      case 'COMPLETED': return <span className="kpi-trend positive">Terminé</span>;
      default: return <span className="kpi-trend negative">{status}</span>;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar" style={{ marginBottom: 30 }}>
        <div className="admin-topbar-left">
          <h1>Campagnes Emails <Mail size={22} style={{ verticalAlign: 'bottom', marginLeft: 8 }} /></h1>
          <p>Gérez vos relances et newsletters via Brevo</p>
        </div>
        <div className="admin-topbar-right">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nouvelle Campagne
          </button>
        </div>
      </header>

      <div className="admin-table-card">
        {loading ? (
          <div className="admin-loading">Chargement...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date de création</th>
                <th>Titre (Interne)</th>
                <th>Sujet (Email)</th>
                <th>Cible</th>
                <th>Statut</th>
                <th>Envoyés</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Aucune campagne trouvée.</td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ fontWeight: 'bold' }}>{c.title}</td>
                    <td>{c.subject}</td>
                    <td>
                      <span className="badge-outline">
                        {c.target_audience === 'ALL' ? 'Tous' : 
                         c.target_audience === 'NO_CREDIT' ? 'Sans crédits' : 
                         c.target_audience === 'PAYING' ? 'Clients payants' : 'Inactifs'}
                      </span>
                    </td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>{c.sent_count} / {c.total_target}</td>
                    <td>
                      {c.status === 'DRAFT' && (
                        <button 
                          className="btn-primary-glow" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleSend(c.id)}
                          disabled={sendingId === c.id}
                        >
                          <Play size={14} style={{ marginRight: 6 }} /> 
                          {sendingId === c.id ? 'Démarrage...' : 'Envoyer'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3>Créer une Campagne d'Email</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form className="admin-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nom de la campagne (Interne)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="Ex: Relance inscription J+3"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Sujet de l'email</label>
                <input 
                  type="text" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                  placeholder="Ex: Il vous reste 5 générations offertes !"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Audience Cible</label>
                <select 
                  value={formData.target_audience} 
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                >
                  <option value="ALL">Tous les utilisateurs</option>
                  <option value="NO_CREDIT">Utilisateurs avec 0 crédit</option>
                  <option value="PAYING">Utilisateurs ayant déjà payé</option>
                  <option value="NON_PAYING">Utilisateurs n'ayant jamais payé</option>
                </select>
              </div>

              <div className="form-group">
                <label>Contenu de l'email (HTML autorisé)</label>
                <p style={{fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8}}>
                  Variables disponibles : <code>{'{nom}'}</code>
                </p>
                <textarea 
                  value={formData.html_content} 
                  onChange={(e) => setFormData({...formData, html_content: e.target.value})} 
                  rows="8"
                  style={{ fontFamily: 'monospace' }}
                  required 
                ></textarea>
              </div>

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Enregistrer le brouillon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCampaigns;
