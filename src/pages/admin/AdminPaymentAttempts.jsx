import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ArrowDownCircle, CheckCircle, XCircle } from 'lucide-react';

function AdminPaymentAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/payment-attempts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAttempts(data);
      }
    } catch (error) {
      console.error("Erreur de chargement des tentatives de paiement", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = attempts.filter(att => 
    att.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    att.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Chargement des tentatives de paiement...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar" style={{ marginBottom: 30 }}>
        <div className="admin-topbar-left">
          <h1>Tentatives de Paiement <CreditCard size={22} style={{ verticalAlign: 'bottom', marginLeft: 8 }} /></h1>
          <p>Historique de toutes les intentions d'achats (même abandonnées)</p>
        </div>
        <div className="admin-topbar-right">
          <div className="admin-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Pays</th>
              <th>Montant (FCFA)</th>
              <th>Crédits</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttempts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Aucune tentative de paiement trouvée.</td>
              </tr>
            ) : (
              filteredAttempts.map((att) => {
                const dateObj = new Date(att.created_at);
                const isRecent = (new Date() - dateObj) < 24 * 60 * 60 * 1000;
                
                return (
                  <tr key={att.id}>
                    <td>{dateObj.toLocaleDateString('fr-FR')} {dateObj.toLocaleTimeString('fr-FR')}</td>
                    <td>{att.user_name}</td>
                    <td>{att.user_email}</td>
                    <td>{att.user_country}</td>
                    <td style={{ fontWeight: 'bold' }}>{att.amount_fcfa} FCFA</td>
                    <td><span className="kpi-trend positive">+{att.credits_to_add}</span></td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '4px 8px', 
                        borderRadius: '20px', 
                        fontSize: '12px',
                        background: isRecent ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: isRecent ? '#f97316' : 'var(--text-secondary)'
                      }}>
                        <ArrowDownCircle size={14} /> 
                        Initié
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPaymentAttempts;
