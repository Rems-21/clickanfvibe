import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminSubscriptions() {
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPremiumUsers = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPremiumUsers(data.filter(u => u.is_premium));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPremiumUsers();
  }, [token]);

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>Abonnements 👑</h1>
          <p>Gestion des membres Premium et des plans d'abonnement</p>
        </div>
      </header>
      <div className="admin-table-card">
        {loading ? (
          <p>Chargement des abonnés...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Statut Actuel</th>
              </tr>
            </thead>
            <tbody>
              {premiumUsers.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>PREMIUM ACTIF</span>
                  </td>
                </tr>
              ))}
              {premiumUsers.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>Aucun abonné Premium actif</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminSubscriptions;
