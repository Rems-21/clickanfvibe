import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Si cet email existe, un code de réinitialisation a été envoyé.");
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 3000);
      } else {
        setError(data.detail || "Une erreur s'est produite");
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
              <Mail size={32} color="white" />
            </div>
          </div>
          <h1 className="page-title">Mot de passe oublié</h1>
          <p className="auth-subtitle">
            Entrez votre email pour recevoir un code de réinitialisation.
          </p>
        </div>
        
        {error && <div className="error-message" style={{color: '#FF3366', backgroundColor: 'rgba(255,51,102,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center'}}>{error}</div>}
        {message && <div className="success-message" style={{color: '#33ff99', backgroundColor: 'rgba(51,255,153,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center'}}>{message}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary full-width" disabled={loading || !email}>
            <Send size={18} style={{marginRight: 8, verticalAlign: 'middle'}}/>
            {loading ? "Envoi..." : "Envoyer le code"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
