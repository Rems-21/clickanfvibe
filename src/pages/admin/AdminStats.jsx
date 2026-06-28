import React, { useState, useEffect } from 'react';
import { Users, Activity, Music, CreditCard, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminStats() {
  const [stats, setStats] = useState({
    total_users: 0,
    online_users: 0,
    total_generations: 0,
    total_revenue: 0,
    total_downloads: 0
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStats();
    
    // Auto-refresh every 10 seconds for real-time online users
    const interval = setInterval(() => {
      if (token) fetchStats(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [token]);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="stat-card" style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      padding: '24px', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px',
      border: `1px solid ${color}33`
    }}>
      <div style={{ 
        background: `${color}1A`, 
        padding: '16px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: color
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: '0', fontSize: '14px', color: '#9ca3af', fontWeight: 'normal' }}>{title}</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="admin-topbar-left">
          <h1>Statistiques 📊</h1>
          <p>Aperçu en temps réel de l'activité sur la plateforme</p>
        </div>
        <button 
          onClick={() => fetchStats()} 
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            border: 'none', 
            color: '#fff', 
            padding: '10px 16px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Actualiser
        </button>
      </header>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginTop: '30px' 
      }}>
        <StatCard 
          icon={<Activity size={32} />} 
          title="En Ligne (Actifs < 5m)" 
          value={stats.online_users ?? 0} 
          color="#10b981" 
        />
        <StatCard 
          icon={<Users size={32} />} 
          title="Utilisateurs Inscrits" 
          value={stats.total_users ?? 0} 
          color="#3b82f6" 
        />
        <StatCard 
          icon={<Download size={32} />} 
          title="App Installée (PWA)" 
          value={stats.total_downloads ?? 0} 
          color="#f59e0b" 
        />
        <StatCard 
          icon={<Music size={32} />} 
          title="Générations Totales" 
          value={stats.total_generations ?? 0} 
          color="#8b5cf6" 
        />
        <StatCard 
          icon={<CreditCard size={32} />} 
          title="Chiffre d'Affaires (FCFA)" 
          value={new Intl.NumberFormat('fr-FR').format(stats.total_revenue ?? 0)} 
          color="#ef4444" 
        />
      </div>
    </div>
  );
}

export default AdminStats;
