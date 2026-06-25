import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, RefreshCcw } from 'lucide-react';
import './Auth.css';

function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Un email vous a été envoyé lors de la création de votre compte.');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email manquant. Veuillez vous réinscrire ou vous connecter.");
      return;
    }
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          window.location.href = '/home';
        } else {
          navigate('/login');
        }
      } else {
        setError(data.detail || "Code de vérification invalide");
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de la vérification");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Un nouveau code vous a été envoyé !");
      } else {
        setError(data.detail || "Erreur lors du renvoi");
      }
    } catch (err) {
      setError("Erreur réseau lors du renvoi du code");
    } finally {
      setResendLoading(false);
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
              <Mail size={32} color="white" />
            </div>
          </div>
          <h1 className="page-title">Vérifiez votre email</h1>
          <p className="auth-subtitle">
            Nous avons envoyé un code à 6 chiffres à <strong>{email || "votre adresse email"}</strong>
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
          
          <button type="submit" className="btn-primary full-width" disabled={loading || code.length < 5}>
            {loading ? "Vérification..." : "Vérifier et continuer"}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <button 
            type="button" 
            onClick={handleResend}
            disabled={resendLoading || !email}
            style={{background: 'none', border: 'none', color: '#aaaaaa', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'}}
          >
            <RefreshCcw size={14} className={resendLoading ? "spinning" : ""} />
            {resendLoading ? "Renvoi en cours..." : "Je n'ai rien reçu, renvoyer le code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
