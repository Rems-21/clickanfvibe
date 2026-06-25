import React, { useState, useEffect } from 'react';
import { Search, Bell, User as UserIcon, Download, Music, Users, Zap, DollarSign, Crown, Play, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#FF3366', '#8A2BE2', '#3333FF', '#FF9900', '#555555'];

function AdminDashboard() {
  const [stats, setStats] = useState({ generations: 0, users: 0, credits: 0, revenues: 0, premium_users: 0 });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [usersGrowth, setUsersGrowth] = useState([]);
  const [recentGenerations, setRecentGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [statsRes, chartRes, recentRes, styleRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/chart-data', { headers }),
          fetch('/api/admin/recent-generations', { headers }),
          fetch('/api/admin/style-distribution', { headers }),
          fetch('/api/admin/users-growth', { headers })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (chartRes.ok) setChartData(await chartRes.json());
        if (recentRes.ok) setRecentGenerations(await recentRes.json());
        if (styleRes.ok) { const d = await styleRes.json(); if (d.length > 0) setPieData(d); else setPieData([{ name: 'Aucune donnée', value: 100 }]); }
        if (usersRes.ok) setUsersGrowth(await usersRes.json());

      } catch (error) {
        console.error("Erreur chargement admin", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);



  const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num);

  if (loading) return <div className="admin-loading">Chargement du tableau de bord...</div>;

  return (
    <div className="admin-dashboard">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>Tableau de bord 👋</h1>
          <p>Vue d'ensemble de ta plateforme Click & Vibe</p>
        </div>
        <div className="admin-topbar-right">
          <div className="admin-search">
            <Search size={18} />
            <input type="text" placeholder="Rechercher une chanson, un utilisateur..." />
            <span className="shortcut">Ctrl K</span>
          </div>
          <button className="icon-btn"><Bell size={20} /><span className="badge">8</span></button>
          <button className="icon-btn"><UserIcon size={20} /></button>
          <button className="export-btn"><Download size={16} /> Exporter rapport</button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card card-glow-purple">
          <div className="kpi-icon"><Music size={24} color="#a855f7" /></div>
          <div className="kpi-info">
            <h3>Générations</h3>
            <h2>{formatNumber(stats.generations)}</h2>
            <span className="kpi-trend positive">↑ +18,4% vs S-1</span>
          </div>
        </div>
        <div className="kpi-card card-glow-blue">
          <div className="kpi-icon"><Users size={24} color="#3b82f6" /></div>
          <div className="kpi-info">
            <h3>Utilisateurs actifs</h3>
            <h2>{formatNumber(stats.users)}</h2>
            <span className="kpi-trend positive">↑ +12,6% vs S-1</span>
          </div>
        </div>
        <div className="kpi-card card-glow-orange">
          <div className="kpi-icon"><Zap size={24} color="#f97316" /></div>
          <div className="kpi-info">
            <h3>Générations Utilisées</h3>
            <h2>{formatNumber(stats.credits)}</h2>
            <span className="kpi-trend positive">↑ +21,9% vs S-1</span>
          </div>
        </div>
        <div className="kpi-card card-glow-green">
          <div className="kpi-icon"><DollarSign size={24} color="#10b981" /></div>
          <div className="kpi-info">
            <h3>Revenus</h3>
            <h2>{formatNumber(stats.revenues)} FCFA</h2>
            <span className="kpi-trend positive">↑ +27,3% vs S-1</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-bellow">
        <div className="admin-left-col">
          {/* Charts */}
          <div className="admin-charts-row">
            <div className="chart-card line-chart-card">
              <div className="chart-header">
                <h3>Évolution des générations</h3>
                <select className="chart-select"><option>7 jours</option></select>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}} />
                    <Line type="monotone" dataKey="generations" stroke="#FF3366" strokeWidth={3} dot={{r: 4, fill: '#FF3366', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-card donut-chart-card">
              <h3>Répartition par style</h3>
              <div className="donut-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-legend">
                  {pieData.map((d, i) => (
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{backgroundColor: COLORS[i]}}></span>
                      <span className="legend-label">{d.name}</span>
                      <span className="legend-value">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Users Growth Chart */}
          <div className="admin-charts-row" style={{ marginTop: '16px' }}>
            <div className="chart-card line-chart-card" style={{ flex: 1 }}>
              <div className="chart-header">
                <h3>Nouveaux utilisateurs (7 jours)</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usersGrowth}>
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px'}} formatter={(v) => [`${v} utilisateur(s)`, 'Nouveaux']} />
                    <Bar dataKey="users" fill="#8A2BE2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Generations Table */}
          <div className="admin-table-card">
            <div className="chart-header">
              <h3>Générations récentes</h3>
              <a href="#" className="view-all">Voir tout →</a>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Style</th>
                  <th>Ambiance</th>
                  <th>Durée</th>
                  <th>Utilisateur</th>
                  <th>Gens</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentGenerations.map((gen) => (
                  <tr key={gen.id}>
                    <td>
                      <div className="td-title">
                        {gen.cover_url ? <img src={gen.cover_url} alt="cover" className="td-cover" /> : <div className="td-cover-placeholder"><Music size={12}/></div>}
                        <span>{gen.title || "Titre Généré"}</span>
                      </div>
                    </td>
                    <td>{gen.style}</td>
                    <td>{gen.mood}</td>
                    <td>{gen.duration_str}</td>
                    <td>{gen.user_name}</td>
                    <td>{gen.credits_used}</td>
                    <td className="td-date">{new Date(gen.created_at).toLocaleString('fr-FR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</td>
                    <td>
                      <button className="td-btn"><Play size={16}/></button>
                      <button className="td-btn"><MoreVertical size={16}/></button>
                    </td>
                  </tr>
                ))}
                {recentGenerations.length === 0 && (
                  <tr><td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>Aucune génération récente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
