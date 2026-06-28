import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

function Error404() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '20px' }}>
      <AlertTriangle size={80} color="#FF3366" style={{ marginBottom: '20px' }} />
      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>Page introuvable</h2>
      <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>Oups ! La page que vous recherchez semble avoir disparu ou n'a jamais existé.</p>
      
      <button 
        className="btn-primary-gradient large"
        onClick={() => navigate('/', { replace: true })}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Home size={18} /> Retour à l'accueil
      </button>
    </div>
  );
}

export default Error404;
