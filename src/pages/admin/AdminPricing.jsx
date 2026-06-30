import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import './AdminDashboard.css';

function AdminPricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPlans(await res.json());
      }
    } catch (e) {
      console.error(e);
      addToast("Erreur de chargement", "Impossible de charger les forfaits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isNew = !editingPlan.id;
      const url = isNew ? '/api/admin/plans' : `/api/admin/plans/${editingPlan.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPlan)
      });

      if (res.ok) {
        addToast("Succès", isNew ? "Forfait créé" : "Forfait mis à jour", "success");
        setIsModalOpen(false);
        fetchPlans();
      } else {
        const err = await res.json();
        let errorMsg = "Erreur de sauvegarde";
        if (err.detail) {
          errorMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
        }
        addToast("Erreur", errorMsg, "error");
      }
    } catch (e) {
      addToast("Erreur", "Problème réseau", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce forfait définitivement ?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Succès", "Forfait supprimé", "success");
        fetchPlans();
      }
    } catch (e) {
      addToast("Erreur", "Erreur lors de la suppression", "error");
    }
  };

  const openNewPlan = () => {
    setEditingPlan({
      category: 'single',
      credits: 1,
      price_fcfa: 1000,
      original_price_fcfa: null,
      title: 'Nouveau forfait',
      badge: '',
      badge_color: 'orange',
      icon_color: 'pink',
      description: '',
      display_order: 10,
      is_active: true
    });
    setIsModalOpen(true);
  };

  if (loading) return <div style={{padding: 40, textAlign:'center'}}><Loader2 className="spinner" size={32} /></div>;

  return (
    <div className="admin-content-inner">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Tarifs & Forfaits</h2>
          <p className="admin-subtitle">Gérez les prix, réductions et forfaits (Credits)</p>
        </div>
        <button className="btn-primary" onClick={openNewPlan} style={{display:'flex', alignItems:'center', gap:8}}>
          <Plus size={16} /> Ajouter un forfait
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Crédits</th>
              <th>Prix (FCFA)</th>
              <th>Prix barré</th>
              <th>Badge</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.id}>
                <td style={{fontWeight: 600}}>{plan.title}</td>
                <td>{plan.category === 'single' ? 'À l\'unité' : 'Kit Créateur'}</td>
                <td>{plan.credits} Gens</td>
                <td style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>{plan.price_fcfa}</td>
                <td style={{textDecoration: 'line-through', color: 'gray'}}>{plan.original_price_fcfa || '-'}</td>
                <td>{plan.badge ? <span className={`badge ${plan.badge_color}`}>{plan.badge}</span> : '-'}</td>
                <td>
                  {plan.is_active ? 
                    <span style={{color: '#10b981', display:'flex', alignItems:'center', gap:4}}><Check size={14}/> Actif</span> : 
                    <span style={{color: '#ef4444', display:'flex', alignItems:'center', gap:4}}><X size={14}/> Inactif</span>
                  }
                </td>
                <td>
                  <div style={{display:'flex', gap: 10}}>
                    <button className="btn-icon" onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }}><Edit2 size={16} /></button>
                    <button className="btn-icon text-danger" onClick={() => handleDelete(plan.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingPlan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: 600}}>
            <div className="modal-header">
              <h3>{editingPlan.id ? 'Éditer le forfait' : 'Nouveau forfait'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="settings-form">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
                <div className="form-group">
                  <label>Titre (ex: 2 Gens)</label>
                  <input type="text" value={editingPlan.title} onChange={e => setEditingPlan({...editingPlan, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select value={editingPlan.category} onChange={e => setEditingPlan({...editingPlan, category: e.target.value})}>
                    <option value="single">Achats à l'unité (single)</option>
                    <option value="kit">Kits Créateur (kit)</option>
                  </select>
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 16}}>
                <div className="form-group">
                  <label>Crédits générés</label>
                  <input type="number" value={editingPlan.credits} onChange={e => setEditingPlan({...editingPlan, credits: parseInt(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>Prix (FCFA)</label>
                  <input type="number" value={editingPlan.price_fcfa} onChange={e => setEditingPlan({...editingPlan, price_fcfa: parseInt(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>Prix Barré (optionnel)</label>
                  <input type="number" value={editingPlan.original_price_fcfa || ''} onChange={e => setEditingPlan({...editingPlan, original_price_fcfa: e.target.value ? parseInt(e.target.value) : null})} />
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 16}}>
                <div className="form-group">
                  <label>Texte Badge (ex: Populaire)</label>
                  <input type="text" value={editingPlan.badge || ''} onChange={e => setEditingPlan({...editingPlan, badge: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Couleur Badge</label>
                  <select value={editingPlan.badge_color || ''} onChange={e => setEditingPlan({...editingPlan, badge_color: e.target.value})}>
                    <option value="">Par défaut</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Violet</option>
                    <option value="pink">Rose</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Couleur Icône</label>
                  <select value={editingPlan.icon_color || 'pink'} onChange={e => setEditingPlan({...editingPlan, icon_color: e.target.value})}>
                    <option value="pink">Rose</option>
                    <option value="purple">Violet</option>
                    <option value="orange">Orange</option>
                    <option value="blue">Bleu</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description (surtout pour Kits)</label>
                <input type="text" value={editingPlan.description || ''} onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
                <div className="form-group">
                  <label>Ordre d'affichage (ex: 1, 2, 3)</label>
                  <input type="number" value={editingPlan.display_order} onChange={e => setEditingPlan({...editingPlan, display_order: parseInt(e.target.value)})} />
                </div>
                <div className="form-group" style={{display:'flex', alignItems:'center', gap: 10, marginTop: 30}}>
                  <input type="checkbox" id="active" checked={editingPlan.is_active} onChange={e => setEditingPlan({...editingPlan, is_active: e.target.checked})} style={{width:'auto'}} />
                  <label htmlFor="active" style={{marginBottom:0}}>Forfait visible aux utilisateurs</label>
                </div>
              </div>

              <div className="modal-actions" style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop: 20}}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPricing;
