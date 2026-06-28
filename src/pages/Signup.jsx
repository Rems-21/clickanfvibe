import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error);
    } else {
      // Track Registration
      if (window.fbq) {
        window.fbq('track', 'CompleteRegistration', { content_name: 'Signup' });
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="top-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="auth-header">
        <div className="soundwave-icon">
          <span className="bar bar1"></span>
          <span className="bar bar2"></span>
          <span className="bar bar3"></span>
          <span className="bar bar4"></span>
          <span className="bar bar5"></span>
        </div>
        <h1 className="brand-title">Click <span className="brand-amp">&</span> Vibe</h1>
        <p className="brand-subtitle">Crée ta musique. Ton style. <span className="text-secondary">Ton vibe.</span></p>
      </div>

      <div className="auth-content">
        <h2 className="page-title">Créer un compte</h2>
        <p className="page-subtitle">Rejoins des milliers de créateurs et donne vie<br/>à ta musique.</p>
        
        {error && <div className="error-message" style={{color: '#FF3366', marginBottom: '10px', textAlign: 'center'}}>{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <User className="input-icon" size={20} color="#FF3366" />
            <input type="text" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          
          <div className="input-group">
            <Mail className="input-icon" size={20} color="#FF3366" />
            <input type="email" placeholder="Adresse e-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div className="input-group">
            <Lock className="input-icon" size={20} color="#FF3366" />
            <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <p className="password-hint">Le mot de passe doit contenir au moins 6 caractères.</p>
          
          <label className="terms-checkbox">
            <input type="checkbox" required />
            <span>J'accepte les <Link to="/terms" target="_blank">Conditions d'utilisation</Link> et la <Link to="/privacy" target="_blank">Politique de confidentialité</Link>.</span>
          </label>
          
          <button type="submit" className="btn-primary full-width" style={{ marginTop: '16px' }} disabled={loading}>
            {loading ? "Création en cours..." : "Créer mon compte"} <span className="arrow-right">→</span>
          </button>
          
          <p className="disclaimer">
            En créant un compte, tu acceptes de recevoir des emails de Click & Vibe. Tu peux te désinscrire à tout moment.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
