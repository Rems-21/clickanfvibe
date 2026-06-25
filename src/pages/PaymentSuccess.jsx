import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Payment.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshCredits } = useAuth();
  const [recharging, setRecharging] = useState(true);
  
  // GeniusPay redirects here without state, so we won't show exact local amounts 
  // We just fetch the updated user object.
  const hasRecharged = useRef(false);

  useEffect(() => {
    const processRecharge = async () => {
      if (hasRecharged.current) return;
      hasRecharged.current = true;
      try {
        await refreshCredits();
      } catch (err) {
        console.error("Erreur lors du refresh", err);
      } finally {
        setRecharging(false);
      }
    };
    
    // Slight delay to allow webhook to process before fetching credits
    setTimeout(() => {
      processRecharge();
    }, 1500);
  }, [refreshCredits]);

  const methodName = 'GeniusPay';

  if (recharging) {
    return (
      <div className="payment-processing-container">
        <div className="processing-content text-center">
          <Loader2 size={48} className="spinner" color="#9933FF" style={{ animation: 'spin 2s linear infinite' }} />
          <h2 className="mt-20">Validation de votre paiement...</h2>
          <p className="text-muted mt-10">Veuillez patienter pendant que nous confirmons la transaction auprès de GeniusPay.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-content text-center">
        <div className="success-icon-wrapper mb-20" style={{display: 'inline-flex', background: 'rgba(0, 255, 0, 0.1)', padding: '20px', borderRadius: '50%'}}>
          <CheckCircle2 size={64} color="#00FF00" />
        </div>
        <h1>Paiement Réussi !</h1>
        <p className="text-muted mt-10 mb-30">Votre compte a été crédité avec succès.</p>
        
        <div className="recharge-summary-card">
          <div className="recharge-amount">
            <Zap size={24} fill="#FFB800" color="#FFB800" />
            <h2>Nouveau Solde</h2>
          </div>
          <div className="recharge-details">
            <div className="detail-row">
              <span className="label">Total Gens</span>
              <span className="value text-primary font-bold">{user ? user.credits : '...'} Gens</span>
            </div>
          </div>
        </div>

        <button 
          className="btn-primary-gradient full-width large mt-30"
          onClick={() => navigate('/create', { replace: true })}
        >
          Aller créer de la musique <ArrowRight size={18} />
        </button>
        
        <button 
          className="btn-secondary full-width large mt-10"
          onClick={() => navigate('/credits', { replace: true })}
        >
          Retour aux crédits
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
