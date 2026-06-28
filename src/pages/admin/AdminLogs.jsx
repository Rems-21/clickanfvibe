import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCcw, Download, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();
  const logsEndRef = useRef(null);

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/logs?lines=300', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLogs();
    
    // Auto-refresh every 3 seconds for "real-time" feel
    const interval = setInterval(() => {
      if (token) fetchLogs(true);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    // Auto-scroll to bottom when logs are loaded
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleDownload = () => {
    const blob = new Blob([logs.join('')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clickandvibe_logs_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar" style={{ marginBottom: '20px' }}>
        <div className="admin-topbar-left">
          <h1>Logs Système <Terminal size={24} style={{ marginLeft: '10px', verticalAlign: 'bottom' }} /></h1>
          <p>Consultez les logs de l'API (erreurs, événements importants)</p>
        </div>
        <div className="admin-topbar-right" style={{ gap: '10px', display: 'flex', alignItems: 'center' }}>
          <div className="admin-search" style={{ margin: 0, marginRight: '10px' }}>
            <Search size={18} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Filtrer les logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>
          <button 
            className="btn-secondary"
            onClick={fetchLogs}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCcw size={16} className={loading ? 'spinning' : ''} />
            Rafraîchir
          </button>
          <button 
            className="btn-primary-gradient"
            onClick={handleDownload}
            disabled={logs.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Exporter
          </button>
        </div>
      </header>

      <div className="admin-table-card" style={{ padding: '0', overflow: 'hidden', background: '#0a0a0a', border: '1px solid #333' }}>
        <div style={{
          padding: '20px',
          height: '600px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#00ff00',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {loading && logs.length === 0 ? (
            <div style={{ color: '#888' }}>Chargement des logs...</div>
          ) : logs.length === 0 ? (
            <div style={{ color: '#888' }}>Aucun log disponible.</div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ color: '#888' }}>Aucun log ne correspond à votre recherche.</div>
          ) : (
            filteredLogs.map((line, index) => {
              // Basic color coding for log levels
              let color = '#00ff00'; // Default INFO/DEBUG
              if (line.includes('ERROR') || line.includes('EXCEPTION')) color = '#ff3366';
              if (line.includes('WARNING')) color = '#ffb800';
              
              return (
                <div key={index} style={{ color, marginBottom: '2px' }}>
                  {line}
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}

export default AdminLogs;
