import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Megaphone, CheckCircle2, XCircle, Search, Copy, Tag, Gift, Zap, Percent } from 'lucide-react';
import './AdminDashboard.css';
import './AdminPromotions.css';

function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Brouillon',
    is_active: false,
    promo_type: 'BONUS_RECHARGE',
    free_gens: 0,
    bonus_gens: 0,
    min_recharge: 0,
    discount_percent: 0,
    discount_amount: 0,
    promo_code: '',
    target_audience: 'ALL',
    auto_event: 'NONE',
    max_uses: 0,
    limit_per_user: 1
  });

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/promotions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPromotions(await response.json());
      }
    } catch (error) {
      console.error("Erreur de chargement des promotions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        ...promo,
        start_date: promo.start_date ? promo.start_date.substring(0, 16) : '',
        end_date: promo.end_date ? promo.end_date.substring(0, 16) : ''
      });
    } else {
      setEditingPromo(null);
      setFormData({
        name: '', description: '', start_date: '', end_date: '', status: 'Brouillon', is_active: false,
        promo_type: 'BONUS_RECHARGE', free_gens: 0, bonus_gens: 0, min_recharge: 0, discount_percent: 0,
        discount_amount: 0, promo_code: '', target_audience: 'ALL', auto_event: 'NONE', max_uses: 0, limit_per_user: 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        free_gens: parseInt(formData.free_gens) || 0,
        bonus_gens: parseInt(formData.bonus_gens) || 0,
        min_recharge: parseInt(formData.min_recharge) || 0,
        discount_percent: parseInt(formData.discount_percent) || 0,
        discount_amount: parseInt(formData.discount_amount) || 0,
        max_uses: parseInt(formData.max_uses) || 0,
        limit_per_user: parseInt(formData.limit_per_user) || 0,
      };

      const url = editingPromo ? `/api/admin/promotions/${editingPromo.id}` : '/api/admin/promotions';
      const method = editingPromo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        handleCloseModal();
        fetchPromotions();
      } else {
        alert("Erreur lors de l'enregistrement de la promotion");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/admin/promotions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPromotions();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'FREE_GENS': return <Gift size={16} className="text-pink" />;
      case 'BONUS_RECHARGE': return <Zap size={16} className="text-orange" />;
      case 'DISCOUNT': return <Percent size={16} className="text-purple" />;
      case 'PROMO_CODE': return <Tag size={16} className="text-blue" />;
      default: return <Megaphone size={16} />;
    }
  };

  if (loading) return <div className="admin-loading">Chargement des promotions...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar" style={{marginBottom: '20px'}}>
        <div className="admin-topbar-left">
          <h1>Promotions & Campagnes 🚀</h1>
          <p>Gérez vos offres marketing et fidélisez vos utilisateurs</p>
        </div>
        <div className="admin-topbar-right">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Nouvelle Promotion
          </button>
        </div>
      </header>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Dates</th>
              <th>Utilisations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map(promo => (
              <tr key={promo.id}>
                <td>
                  <strong>{promo.name}</strong>
                  {promo.promo_code && <div className="text-muted" style={{fontSize: '12px'}}>Code: {promo.promo_code}</div>}
                </td>
                <td>
                  <div className="promo-type-badge">
                    {getTypeIcon(promo.promo_type)}
                    <span>{promo.promo_type.replace('_', ' ')}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${promo.is_active ? 'active' : 'inactive'}`}>
                    {promo.is_active ? 'Active' : promo.status}
                  </span>
                </td>
                <td>
                  <div style={{fontSize: '12px'}}>
                    <div>Du: {promo.start_date ? new Date(promo.start_date).toLocaleDateString('fr-FR') : '-'}</div>
                    <div>Au: {promo.end_date ? new Date(promo.end_date).toLocaleDateString('fr-FR') : '-'}</div>
                  </div>
                </td>
                <td>{promo.current_uses} {promo.max_uses > 0 ? `/ ${promo.max_uses}` : ''}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => handleOpenModal(promo)} title="Modifier"><Edit size={16} /></button>
                    <button className="btn-icon danger" onClick={() => handleDelete(promo.id)} title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                  Aucune promotion trouvée. Créez-en une pour commencer !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal promo-modal">
            <div className="admin-modal-header">
              <h2>{editingPromo ? 'Modifier la promotion' : 'Créer une promotion'}</h2>
              <button className="btn-close" onClick={handleCloseModal}><XCircle size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de la promotion *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Type de promotion *</label>
                  <select name="promo_type" value={formData.promo_type} onChange={handleInputChange} required>
                    <option value="BONUS_RECHARGE">Bonus sur recharge (ex: +5 Gens)</option>
                    <option value="PROMO_CODE">Code Promotionnel (ex: WELCOME)</option>
                    <option value="FREE_GENS">Générations Gratuites</option>
                    <option value="DISCOUNT">Réduction (Non implémenté)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows="2" />
              </div>

              {formData.promo_type === 'BONUS_RECHARGE' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Achat minimum (Gens)</label>
                    <input type="number" name="min_recharge" value={formData.min_recharge} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Gens Bonus Offerts</label>
                    <input type="number" name="bonus_gens" value={formData.bonus_gens} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {formData.promo_type === 'PROMO_CODE' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Code (ex: WELCOME2026)</label>
                    <input type="text" name="promo_code" value={formData.promo_code || ''} onChange={handleInputChange} style={{textTransform: 'uppercase'}} />
                  </div>
                  <div className="form-group">
                    <label>Gens Offerts avec le code</label>
                    <input type="number" name="free_gens" value={formData.free_gens} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {formData.promo_type === 'FREE_GENS' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Gens Offerts</label>
                    <input type="number" name="free_gens" value={formData.free_gens} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Événement Automatique</label>
                    <select name="auto_event" value={formData.auto_event} onChange={handleInputChange}>
                      <option value="NONE">Aucun (Manuel)</option>
                      <option value="SIGNUP">A l'inscription</option>
                      <option value="BIRTHDAY">Anniversaire</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Date de début</label>
                  <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Limite totale d'utilisations (0 = illimité)</label>
                  <input type="number" name="max_uses" value={formData.max_uses} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Limite par utilisateur</label>
                  <input type="number" name="limit_per_user" value={formData.limit_per_user} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row" style={{alignItems: 'center', marginTop: '10px'}}>
                <label className="checkbox-label" style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} style={{width: '20px', height: '20px'}} />
                  <strong>Activer cette promotion immédiatement</strong>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn-primary">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromotions;
