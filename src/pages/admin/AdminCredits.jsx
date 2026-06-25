import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminCredits() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/admin/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTransactions();
  }, [token]);

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>Achats de Générations 💳</h1>
          <p>Historique des transactions et recharges de générations</p>
        </div>
      </header>
      <div className="admin-table-card">
        {loading ? (
          <p>Chargement des transactions...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Trans.</th>
                <th>Utilisateur</th>
                <th>Générations Achetées</th>
                <th>Prix (FCFA)</th>
                <th>Méthode</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>
                    <div><strong>{t.user_name}</strong></div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{t.user_email}</div>
                  </td>
                  <td><span style={{ color: '#a855f7', fontWeight: 'bold' }}>+{t.amount_credits}</span> 🎵</td>
                  <td style={{ fontWeight: 'bold' }}>{t.price_fcfa} FCFA</td>
                  <td>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {t.payment_method}
                    </span>
                  </td>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#666' }}>Aucune transaction trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminCredits;
