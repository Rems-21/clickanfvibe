import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, AlertTriangle } from 'lucide-react';
import './AdminDashboard.css';

function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [sunoKey, setSunoKey] = useState('sk-suno-************************');
  const [freeCredits, setFreeCredits] = useState(12);
  const [saved, setSaved] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFreeCredits(data.free_credits);
          if (data.maintenance_mode !== undefined) {
            setMaintenance(data.maintenance_mode);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchSettings();
  }, [token]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          free_credits: parseInt(freeCredits, 10),
          maintenance_mode: maintenance
        })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>Paramètres ⚙️</h1>
          <p>Configuration générale du système</p>
        </div>
      </header>
      
      <div className="admin-table-card" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '20px' }}>
        <h3 style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Configuration de l'Application</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Maintenance */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: 'rgba(255,0,0,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,0,0,0.2)' }}>
            <AlertTriangle color="#ef4444" />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>Mode Maintenance</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#9ca3af' }}>Désactive l'accès à la plateforme pour tous les utilisateurs non-administrateurs.</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={maintenance} 
                  onChange={(e) => setMaintenance(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                Activer le mode maintenance
              </label>
            </div>
          </div>

          {/* API Keys */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Clé API Suno (Génération Audio)</label>
            <input 
              type="text" 
              value={sunoKey}
              onChange={(e) => setSunoKey(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
          </div>

          {/* Onboarding Credits */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Générations gratuites à l'inscription</label>
            <input 
              type="number" 
              value={freeCredits}
              onChange={(e) => setFreeCredits(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={handleSave}
              style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
            >
              <Save size={18} /> Sauvegarder les modifications
            </button>
            {saved && <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '500' }}>Paramètres sauvegardés avec succès !</span>}
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#ef4444' }}>Maintenance Avancée</h4>
            <button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/upgrade-db', { headers: { 'Authorization': `Bearer ${token}` } });
                  if (res.ok) alert("Base de données mise à jour avec succès !");
                  else alert("Erreur lors de la mise à jour de la base de données.");
                } catch (e) {
                  alert("Erreur réseau.");
                }
              }}
              style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Mettre à jour la Base de données (Créer les nouvelles tables)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
