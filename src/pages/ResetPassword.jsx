import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './Auth.css';

function ResetPassword() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email manquant.");
      return;
    }
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Mot de passe réinitialisé avec succès !");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.detail || "Code invalide ou expiré");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="top-nav">
        <Link to="/login" className="back-btn">
          <ArrowLeft size={24} color="white" />
        </Link>
      </div>
      
      <div className="auth-content">
        <div className="auth-header">
          <div className="logo-placeholder" style={{marginBottom: 24}}>
            <div style={{width: 60, height: 60, background: 'linear-gradient(135deg, #FF3366 0%, #9933FF 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Lock size={32} color="white" />
            </div>
          </div>
          <h1 className="page-title">Nouveau mot de passe</h1>
          <p className="auth-subtitle">
            Entrez le code reçu par email pour {email}
          </p>
        </div>
        
        {error && <div className="error-message" style={{color: '#FF3366', backgroundColor: 'rgba(255,51,102,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center'}}>{error}</div>}
        {message && <div className="success-message" style={{color: '#33ff99', backgroundColor: 'rgba(51,255,153,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center'}}>{message}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <KeyRound size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder="Code à 6 chiffres" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              style={{letterSpacing: '5px', textAlign: 'center', fontSize: '1.2rem', paddingLeft: '16px'}}
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              placeholder="Nouveau mot de passe" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn-primary full-width" disabled={loading || code.length < 5 || newPassword.length < 6}>
            <CheckCircle2 size={18} style={{marginRight: 8, verticalAlign: 'middle'}}/>
            {loading ? "Réinitialisation..." : "Valider"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
