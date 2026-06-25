import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import './Payment.css';

function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="payment-success-container">
      <div className="success-content text-center">
        <div className="success-icon-wrapper mb-20" style={{display: 'inline-flex', background: 'rgba(255, 0, 0, 0.1)', padding: '20px', borderRadius: '50%'}}>
          <XCircle size={64} color="#FF3366" />
        </div>
        <h1>Paiement Échoué</h1>
        <p className="text-muted mt-10 mb-30">Votre paiement n'a pas pu être finalisé. Veuillez réessayer ou utiliser un autre moyen de paiement.</p>

        <button 
          className="btn-primary-gradient full-width large mt-30"
          onClick={() => navigate('/credits', { replace: true })}
        >
          <ArrowLeft size={18} style={{marginRight: '8px'}} /> Retourner aux forfaits
        </button>
      </div>
    </div>
  );
}

export default PaymentFailed;
