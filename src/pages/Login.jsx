import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle: authLoginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const result = await authLoginWithGoogle(tokenResponse.access_token);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    },
    onError: () => {
      setError('Échec de la connexion Google.');
    },
  });

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
        <h2 className="page-title">Se connecter</h2>
        <p className="page-subtitle">Choisis ton moyen de connexion</p>
        
        <div className="social-buttons">
          <button type="button" className="btn-social google" onClick={() => handleGoogleLogin()}>
            <svg viewBox="0 0 24 24" className="social-icon" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>
        </div>
        
        <div className="divider">
          <span>ou</span>
        </div>
        
        {error && <div className="error-message" style={{color: '#FF3366', marginBottom: '10px', textAlign: 'center'}}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input type="email" placeholder="Adresse e-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
          </div>
          
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Pas encore de compte ? <Link to="/signup" className="text-secondary">S'inscrire</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
