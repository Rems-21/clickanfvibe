import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, AlertOctagon } from 'lucide-react';

function Error500() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '20px' }}>
      <AlertOctagon size={80} color="#FF3366" style={{ marginBottom: '20px' }} />
      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>500</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>Erreur Serveur</h2>
      <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>Oups ! Quelque chose s'est mal passé de notre côté. Nos ingénieurs sont probablement déjà sur le coup.</p>
      
      <button 
        className="btn-primary-gradient large"
        onClick={() => window.location.reload()}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <RefreshCcw size={18} /> Réessayer
      </button>
    </div>
  );
}

export default Error500;
