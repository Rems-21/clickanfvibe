import React, { useState, useEffect } from 'react';
import { Users, Activity, Music, CreditCard, TrendingUp, Zap, Globe, BarChart2, RefreshCw, MessageCircle, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminStats() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
    const interval = setInterval(() => { if (token) fetchAll(true); }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const funnel = analytics?.funnel || {};
  let sources = analytics?.sources || [];
  
  // Ensure whatsapp and facebook always appear
  if (!sources.find(s => s.source === 'whatsapp')) sources.push({ source: 'whatsapp', count: 0 });
  if (!sources.find(s => s.source === 'facebook')) sources.push({ source: 'facebook', count: 0 });

  const funnelSteps = [
    { key: 'visit', label: '🌍 Visites', color: '#6366f1' },
    { key: 'signup', label: '✍️ Inscriptions', color: '#8b5cf6' },
    { key: 'login', label: '🔑 Connexions', color: '#a855f7' },
    { key: 'create_click', label: '🎵 Clics Créer', color: '#ec4899' },
    { key: 'generate', label: '⚡ Générations', color: '#f43f5e' },
    { key: 'payment_init', label: '💳 Paiements initiés', color: '#f97316' },
    { key: 'payment_success', label: '✅ Paiements réussis', color: '#10b981' },
  ];

  const maxFunnelVal = Math.max(...funnelSteps.map(s => funnel[s.key] || 0), 1);

  const kpiCards = stats ? [
    { icon: <Users size={22} />, label: 'Utilisateurs', value: stats.total_users ?? 0, color: '#8b5cf6', sub: `${stats.online_users ?? 0} en ligne`, glowName: 'purple' },
    { icon: <Music size={22} />, label: 'Générations totales', value: stats.total_generations ?? 0, color: '#ec4899', sub: `${analytics?.gens_today ?? 0} aujourd'hui`, glowName: 'pink' },
    { icon: <CreditCard size={22} />, label: 'Revenu mensuel', value: `${(analytics?.monthly_revenue ?? 0).toLocaleString()} FCFA`, color: '#10b981', sub: `${(analytics?.daily_revenue ?? 0).toLocaleString()} FCFA aujourd'hui`, glowName: 'green' },
    { icon: <Activity size={22} />, label: 'Actifs aujourd\'hui', value: analytics?.active_today ?? 0, color: '#f97316', sub: 'utilisateurs uniques', glowName: 'orange' },
  ] : [];

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar" style={{ marginBottom: 30 }}>
        <div className="admin-topbar-left">
          <h1>Statistiques & Analytics <BarChart2 size={22} style={{ verticalAlign: 'bottom', marginLeft: 8 }} /></h1>
          <p>Tunnel de conversion, revenus et sources de trafic en temps réel</p>
        </div>
        <button onClick={() => fetchAll()} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={16} /> Actualiser
        </button>
      </header>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Chargement des données...</p>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="admin-kpi-grid" style={{ marginBottom: 30 }}>
            {kpiCards.map((k, i) => (
              <div key={i} className={`kpi-card card-glow-${k.glowName}`} style={{ border: `1px solid ${k.color}33` }}>
                <div className="kpi-icon" style={{ background: `${k.color}22`, color: k.color }}>{k.icon}</div>
                <div className="kpi-info">
                  <h3>{k.label}</h3>
                  <h2 style={{ color: k.color, textShadow: `0 0 10px ${k.color}44` }}>{k.value}</h2>
                  <span className="kpi-trend" style={{ color: '#9ca3af', fontWeight: 'normal' }}>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '30px' }}>
            {/* FUNNEL */}
            <div className="admin-table-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 15, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <TrendingUp size={18} color="#a855f7" /> Tunnel de conversion
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
                {funnelSteps.map((step, i) => {
                  const val = funnel[step.key] || 0;
                  const pct = Math.round((val / maxFunnelVal) * 100);
                  const prevVal = i > 0 ? (funnel[funnelSteps[i-1].key] || 0) : val;
                  const dropPct = prevVal > 0 && i > 0 ? Math.round((1 - val / prevVal) * 100) : null;
                  return (
                    <div key={step.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{step.label}</span>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          {dropPct !== null && dropPct > 0 && (
                            <span style={{ fontSize: 11, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: 4 }}>▼ {dropPct}%</span>
                          )}
                          <strong style={{ color: step.color, fontSize: 15 }}>{val.toLocaleString()}</strong>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: step.color, borderRadius: 8, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 10px ${step.color}88` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SOURCES DE TRAFIC */}
            <div className="admin-table-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 15, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Globe size={18} color="#a855f7" /> Sources de trafic
              </h3>
              {sources.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 30, textAlign: 'center', color: '#6b7280', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>Aucune donnée disponible.<br/>Les sources apparaîtront dès que vos utilisateurs viendront via vos liens publicitaires.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1, justifyContent: 'flex-start' }}>
                  {sources.sort((a, b) => b.count - a.count).map((s, i) => {
                    const maxSrc = Math.max(...sources.map(x => x.count), 1);
                    const pct = Math.round((s.count / maxSrc) * 100);
                    
                    let icon = <Globe size={16} />;
                    let color = '#a855f7';
                    let name = s.source || 'Direct';
                    
                    if (name === 'whatsapp') { icon = <MessageCircle size={16} color="#25D366" />; color = '#25D366'; name = 'WhatsApp'; }
                    else if (name === 'facebook') { icon = <Share2 size={16} color="#1877F2" />; color = '#1877F2'; name = 'Facebook'; }
                    else if (name === 'instagram') { icon = <Share2 size={16} color="#E1306C" />; color = '#E1306C'; name = 'Instagram'; }

                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                            <span style={{ background: `${color}15`, padding: 6, borderRadius: 6, display: 'flex' }}>{icon}</span> 
                            {name}
                          </span>
                          <strong style={{ color: color, fontSize: 16 }}>{s.count}</strong>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 10px ${color}66` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* TAUX DE CONVERSION */}
          <div className="admin-table-card">
            <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 15, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Zap size={18} color="#f59e0b" /> Indicateurs Clés de Performance (Taux de Conversion)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {[
                { label: 'Visite → Inscription', a: funnel.visit, b: funnel.signup, color: '#8b5cf6' },
                { label: 'Inscription → Génération', a: funnel.signup, b: funnel.generate, color: '#ec4899' },
                { label: 'Génération → Paiement', a: funnel.generate, b: funnel.payment_init, color: '#f97316' },
                { label: 'Paiement initié → Réussi', a: funnel.payment_init, b: funnel.payment_success, color: '#10b981' },
              ].map((item, i) => {
                const rate = item.a > 0 ? Math.round((item.b / item.a) * 100) : 0;
                return (
                  <div key={i} style={{ 
                    background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, ${item.color}11 100%)`, 
                    borderRadius: 16, 
                    padding: 24, 
                    textAlign: 'center',
                    border: `1px solid ${item.color}22`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: item.color, filter: 'blur(40px)', opacity: 0.2 }} />
                    <div style={{ fontSize: 36, fontWeight: 800, color: item.color, textShadow: `0 0 15px ${item.color}55`, marginBottom: 8 }}>{rate}%</div>
                    <div style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 500 }}>{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminStats;
