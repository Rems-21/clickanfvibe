import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import '../pages/admin/AdminDashboard.css';

export default function SendEmailModal({ isOpen, onClose, targetUser }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        email: targetUser.email,
        name: targetUser.name || 'Utilisateur',
        subject: subject,
        html_content: content.replace(/\\n/g, '<br/>')
      };

      const res = await fetch('/api/admin/email/send-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Email envoyé avec succès !");
        onClose();
        setSubject('');
        setContent('');
      } else {
        alert("Erreur lors de l'envoi de l'email.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" style={{ zIndex: 10000 }}>
      <div className="admin-modal-content" style={{ maxWidth: '500px' }}>
        <div className="admin-modal-header" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Send size={18} /> Envoyer un email à {targetUser.name || targetUser.email}
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSend} className="admin-form">
          <div className="form-group">
            <label>Sujet</label>
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="Sujet de l'email"
              required 
              style={{ background: '#222', border: '1px solid #444', color: '#fff' }}
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              rows="6" 
              placeholder={`Bonjour ${targetUser.name || ''}...\\nVos sauts de ligne seront automatiquement respectés.`}
              required
              style={{ background: '#222', border: '1px solid #444', color: '#fff', resize: 'vertical' }}
            />
          </div>
          <div className="form-actions" style={{ marginTop: 25, justifyContent: 'flex-end', gap: 15 }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading} style={{ background: '#333', color: '#fff', border: 'none' }}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
