import React, { useState, useEffect } from 'react';
import { Search, Star, PlusCircle, Check, Trash2 } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const togglePremium = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-premium`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addCredits = async (userId, amount) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const suspendUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur définitivement ?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>Utilisateurs 👥</h1>
          <p>Gérer les comptes et les générations restantes</p>
        </div>
        <div className="admin-topbar-right">
          <div className="admin-search">
            <Search size={18} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Rechercher par email ou nom..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </header>

      <div className="admin-table-card">
        {loading ? (
          <p>Chargement des utilisateurs...</p>
        ) : (
          <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Générations</th>
                <th>Actions rapides</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span style={{ color: '#a855f7', fontWeight: 'bold' }}>{u.credits}</span> 🎵</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Montant"
                        min="1"
                        id={`credit-input-${u.id}`}
                        style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: 'white' }}
                      />
                      <button 
                        onClick={() => {
                          const val = parseInt(document.getElementById(`credit-input-${u.id}`).value);
                          if (!isNaN(val) && val > 0) addCredits(u.id, val);
                        }}
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        + Ajouter
                      </button>
                      <button 
                        onClick={() => {
                          const val = parseInt(document.getElementById(`credit-input-${u.id}`).value);
                          if (!isNaN(val) && val > 0) addCredits(u.id, -val);
                        }}
                        style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        - Réduire
                      </button>
                      <button 
                        onClick={() => suspendUser(u.id)}
                        style={{ background: u.is_suspended ? '#10b981' : '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {u.is_suspended ? 'Activer' : 'Suspendre'}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination 
            currentPage={currentPage} 
            totalItems={filteredUsers.length} 
            itemsPerPage={itemsPerPage} 
            onPageChange={setCurrentPage} 
          />
        </>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
