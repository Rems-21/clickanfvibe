import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, HelpCircle, Music, Sparkles, Clock, ArrowRight, ShieldCheck, Gift, Loader2 } from 'lucide-react';
import { CheckCircle2, Smartphone, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Credits.css';
import '../pages/Home.css'; // Reuse common styles

function Credits() {
  const navigate = useNavigate();
  const { user, refreshCredits } = useAuth();
  const { addToast } = useNotification();

  const credits = user ? user.credits : 0;
  const estimatedGenerations = credits; // 1 credit = 1 gen

  const [transactions, setTransactions] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null); // stores the id of the package being processed
  const [activePromos, setActivePromos] = useState([]);
  const [plans, setPlans] = useState({ single: [], kit: [] });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  
  // Custom USSD Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('MTN_MOMO_CMR');
  const [paymentStatus, setPaymentStatus] = useState('IDLE'); // IDLE, PENDING, SUCCESS, ERROR
  const [paymentError, setPaymentError] = useState('');

  const mobileMoneyProviders = [
    { code: 'MTN_MOMO_BEN', name: 'MTN Bénin', country: 'BEN' },
    { code: 'MOOV_BEN', name: 'Moov Bénin', country: 'BEN' },
    { code: 'MTN_MOMO_CMR', name: 'MTN Cameroun', country: 'CMR' },
    { code: 'ORANGE_CMR', name: 'Orange Cameroun', country: 'CMR' },
    { code: 'MTN_MOMO_CIV', name: "MTN Côte d'Ivoire", country: 'CIV' },
    { code: 'ORANGE_CIV', name: "Orange Côte d'Ivoire", country: 'CIV' },
    { code: 'VODACOM_MPESA_COD', name: 'Vodacom M-Pesa RD Congo', country: 'COD' },
    { code: 'AIRTEL_COD', name: 'Airtel RD Congo', country: 'COD' },
    { code: 'ORANGE_COD', name: 'Orange RD Congo', country: 'COD' },
    { code: 'AIRTEL_GAB', name: 'Airtel Gabon', country: 'GAB' },
    { code: 'MPESA_KEN', name: 'M-Pesa Kenya', country: 'KEN' },
    { code: 'AIRTEL_COG', name: 'Airtel Congo', country: 'COG' },
    { code: 'MTN_MOMO_COG', name: 'MTN Congo', country: 'COG' },
    { code: 'AIRTEL_RWA', name: 'Airtel Rwanda', country: 'RWA' },
    { code: 'MTN_MOMO_RWA', name: 'MTN Rwanda', country: 'RWA' },
    { code: 'FREE_SEN', name: 'Free Sénégal', country: 'SEN' },
    { code: 'ORANGE_SEN', name: 'Orange Sénégal', country: 'SEN' },
    { code: 'ORANGE_SLE', name: 'Orange Sierra Leone', country: 'SLE' },
    { code: 'AIRTEL_OAPI_UGA', name: 'Airtel Ouganda', country: 'UGA' },
    { code: 'MTN_MOMO_UGA', name: 'MTN Ouganda', country: 'UGA' },
    { code: 'AIRTEL_OAPI_ZMB', name: 'Airtel Zambie', country: 'ZMB' },
    { code: 'MTN_MOMO_ZMB', name: 'MTN Zambie', country: 'ZMB' },
    { code: 'ZAMTEL_ZMB', name: 'Zamtel Zambie', country: 'ZMB' },
  ];

  // Polling mechanism
  useEffect(() => {
    let interval;
    if (paymentStatus === 'PENDING') {
      const startCredits = credits;
      interval = setInterval(async () => {
        if (refreshCredits) {
          await refreshCredits();
          // We can't rely directly on 'credits' state here because of closure, 
          // but if refreshCredits triggers a context update, user.credits will change.
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentStatus, refreshCredits, credits]);
  
  // Watch user.credits to detect success
  useEffect(() => {
    if (paymentStatus === 'PENDING' && selectedPlan) {
      // If credits increased
      setPaymentStatus('SUCCESS');
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStatus('IDLE');
        setSelectedPlan(null);
        setPhoneNumber('');
      }, 3000);
    }
    // We only want this to run when 'credits' changes, but we need a way to know it increased.
    // Actually, a simpler way is a ref or just comparing if it's strictly greater.
  }, [credits]); // Will refine below


  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch('/api/promotions/active');
        if (res.ok) {
          setActivePromos(await res.json());
        }
      } catch (e) {
        console.error("Erreur promos", e);
      }
    };
    
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/plans');
        if (res.ok) {
          const data = await res.json();
          setPlans({
            single: data.filter(p => p.category === 'single'),
            kit: data.filter(p => p.category === 'kit')
          });
        }
      } catch (e) {
        console.error("Erreur plans", e);
      } finally {
        setLoadingPlans(false);
      }
    };
    
    fetchPromos();
    fetchPlans();
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/promotions/apply_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ promo_code: promoCode })
      });
      const data = await res.json();
      if (res.ok) {
        setPromoMessage({ type: 'success', text: data.message || 'Code promo appliqué avec succès !' });
        setPromoCode('');
        if (refreshCredits) refreshCredits();
      } else {
        setPromoMessage({ type: 'error', text: data.detail || 'Code invalide' });
      }
    } catch (e) {
      setPromoMessage({ type: 'error', text: 'Erreur réseau' });
    }
  };

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setInitialCredits(credits);
    setShowPaymentModal(true);
    setPaymentStatus('IDLE');
  };

  const initiateDirectPayment = async () => {
    if (!phoneNumber || !provider) {
      setPaymentError("Veuillez remplir tous les champs");
      return;
    }
    setPaymentError("");
    setPaymentStatus('PENDING');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              amount_fcfa: selectedPlan.price_fcfa,
              credits_to_add: selectedPlan.credits,
              origin: window.location.origin,
              phoneNumber: phoneNumber,
              provider: provider
          })
      });
      const data = await res.json();
      if (!res.ok) {
          setPaymentStatus('ERROR');
          setPaymentError(data.detail || "Erreur d'initialisation du paiement");
      }
    } catch (e) {
        setPaymentStatus('ERROR');
        setPaymentError("Erreur réseau");
    }
  };
  
  // Refetch transactions when needed
  useEffect(() => {
    if (transactions.length === 0 && !loadingTxs) {
      const fetchTransactions = async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const res = await fetch('/api/user/transactions', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              setTransactions(await res.json());
            }
          }
        } catch (err) {}
      };
      fetchTransactions();
    }
  }, [transactions.length, loadingTxs]);


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetch('/api/user/transactions', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            setTransactions(await res.json());
          }
        }
      } catch (err) {
        console.error("Erreur chargement transactions", err);
      } finally {
        setLoadingTxs(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="credits-container">
      <div className="page-header-simple">
        <div className="title-section">
          <h1>Recharger</h1>
          <p className="subtitle">Tes <span className="text-primary">Gens</span> alimentent ta <span className="text-secondary">créativité</span>.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      <div className="credits-content">
        <section className="balance-card glass-panel">
          <div className="balance-info">
            <p className="balance-label">Gens disponibles</p>
            <div className="balance-amount">
              <Zap size={32} fill="#FF3366" color="#FF3366" />
              <h2>{credits}</h2>
              <span>Gens</span>
            </div>
            <p className="balance-estimate">Tu peux générer {credits} musiques <HelpCircle size={12} /></p>
          </div>

        </section>

        <section className="section-block">
          <h3 className="section-title">Comment ça marche ?</h3>
          <div className="how-it-works-grid">
            <div className="info-card">
              <div className="info-icon pink"><Music size={20} /></div>
              <h4>1 génération</h4>
              <p>consomme 1 Gen</p>
            </div>
            <div className="info-card">
              <div className="info-icon purple"><Sparkles size={20} /></div>
              <p>Un prompt plus détaillé aide l'IA à générer un meilleur résultat</p>
            </div>
            <div className="info-card">
              <div className="info-icon blue"><Clock size={20} /></div>
              <p>Tes Gens restent valables sans limite de temps</p>
            </div>
          </div>
        </section>

        <section className="section-block">
          <h3 className="section-title">Achète plus de Gens</h3>
          {loadingPlans ? (
            <div style={{textAlign: 'center', padding: '20px'}}><Loader2 className="spinner" size={24} /></div>
          ) : (
            <div className="packages-list">
              {plans.single.map(plan => (
                <div key={plan.id} className="package-card popular">
                  {plan.badge && <div className="package-badge">{plan.badge}</div>}
                  <div className={`package-icon ${plan.icon_color || 'pink'}`}>
                    <Zap size={24} fill="currentColor" color="currentColor" />
                  </div>
                  <div className="package-details">
                    <div className="package-title-row">
                      <h4>{plan.title}</h4>
                      {plan.badge_color && plan.badge && plan.badge.includes('%') && (
                        <div className={`package-discount ${plan.badge_color}`}>{plan.badge}</div>
                      )}
                    </div>
                    {plan.description && <p>{plan.description}</p>}
                  </div>
                  <div className="package-price-container">
                    {plan.original_price_fcfa && (
                      <span className="package-price-original">
                        <del>{plan.original_price_fcfa.toLocaleString()} FCFA</del>
                      </span>
                    )}
                    <div className="package-price text-primary">{plan.price_fcfa.toLocaleString()} FCFA</div>
                  </div>
                  <button className="btn-buy primary" onClick={() => handleBuyClick(plan)} disabled={isProcessing === plan.price_fcfa}>
                    {isProcessing === plan.price_fcfa ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <h3 className="section-title" style={{marginTop: '2rem'}}>Kits Créateur</h3>
          {loadingPlans ? (
            <div style={{textAlign: 'center', padding: '20px'}}><Loader2 className="spinner" size={24} /></div>
          ) : (
            <div className="packages-list">
              {plans.kit.map(plan => (
                <div key={plan.id} className="package-card popular">
                  {plan.badge && <div className="package-badge">{plan.badge}</div>}
                  <div className={`package-icon ${plan.icon_color || 'purple'}`}>
                    <Zap size={24} fill="currentColor" color="currentColor" />
                  </div>
                  <div className="package-details">
                    <div className="package-title-row">
                      <h4>{plan.title}</h4>
                    </div>
                    {plan.description && <p>{plan.description}</p>}
                  </div>
                  <div className="package-price-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center'}}>
                    {plan.original_price_fcfa && (
                      <span className="package-price-original" style={{fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'line-through'}}>
                        {plan.original_price_fcfa.toLocaleString()} FCFA
                      </span>
                    )}
                    <div className="package-price">{plan.price_fcfa.toLocaleString()} FCFA</div>
                  </div>
                  <button className="btn-buy primary" onClick={() => handleBuyClick(plan)} disabled={isProcessing === plan.price_fcfa}>
                    {isProcessing === plan.price_fcfa ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="secure-payment">
            <ShieldCheck size={14} />
            <span>Paiement 100% sécurisé via KPay</span>
          </div>
        </section>

        {/* Promo Code Section */}
        <section className="section-block">
          {activePromos.length > 0 && (
            <div className="active-promo-banner" style={{background: 'linear-gradient(45deg, rgba(255,51,102,0.1), rgba(153,51,255,0.1))', border: '1px solid var(--primary-color)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <Gift size={24} color="var(--primary-color)" />
              <div>
                <h4 style={{margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--primary-color)'}}>🔥 {activePromos[0].name}</h4>
                <p style={{margin: 0, fontSize: '0.85rem', opacity: 0.8}}>{activePromos[0].description}</p>
              </div>
            </div>
          )}
          <h3 className="section-title">Code Promotionnel</h3>
          <div className="promo-code-container" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <div className="input-with-icon" style={{flex: 1, position: 'relative'}}>
              <Gift size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
              <input 
                type="text" 
                placeholder="Entrez votre code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                style={{width: '100%', padding: '12px 12px 12px 38px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white'}}
              />
            </div>
            <button 
              className="btn-primary" 
              onClick={handleApplyPromo}
              style={{padding: '0 20px', borderRadius: '12px', opacity: promoCode ? 1 : 0.5}}
              disabled={!promoCode}
            >
              Appliquer
            </button>
          </div>
          {promoMessage && (
            <div style={{marginTop: '10px', fontSize: '0.9rem', color: promoMessage.type === 'success' ? '#00FF00' : '#FF3366'}}>
              {promoMessage.text}
            </div>
          )}
        </section>

        <section className="section-block">
          <div className="section-header">
            <h3 className="section-title">Historique des transactions</h3>
            {transactions.length > 5 && <a href="#" className="link-secondary">Voir tout</a>}
          </div>
          <div className="transactions-list">
            {loadingTxs ? (
              <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Chargement...</p>
            ) : transactions.length === 0 ? (
              <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Aucune transaction pour le moment.</p>
            ) : (
              transactions.slice(0, 5).map(tx => (
                <div className="transaction-item" key={tx.id}>
                  <div className={`package-icon ${tx.amount_credits > 5 ? 'orange' : tx.amount_credits > 1 ? 'purple' : 'pink'} small`}>
                    <Zap size={16} fill={tx.amount_credits > 5 ? '#FF6B00' : tx.amount_credits > 1 ? '#9933FF' : '#FF3366'} color="white" />
                  </div>
                  <div className="transaction-details">
                    <h4>Recharge {tx.payment_method === 'System' ? '(Bonus / Promo)' : ''}</h4>
                    <p>{new Date(tx.created_at).toLocaleDateString('fr-FR')} • {new Date(tx.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="transaction-amount">
                    <span className="amount-plus">+{tx.amount_credits}</span>
                    <span className="amount-price">{tx.price_fcfa} FCFA</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Custom Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content kpay-modal" style={{maxWidth: '400px'}}>
            <button className="modal-close" onClick={() => paymentStatus !== 'PENDING' && setShowPaymentModal(false)} disabled={paymentStatus === 'PENDING'}>×</button>
            <h2 style={{fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Zap color="var(--primary-color)" /> Acheter {selectedPlan.title}
            </h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
              Montant à payer : <strong style={{color: 'white'}}>{selectedPlan.price_fcfa} FCFA</strong>
            </p>

            {paymentStatus === 'IDLE' || paymentStatus === 'ERROR' ? (
              <div className="kpay-form">
                {paymentStatus === 'ERROR' && (
                  <div style={{background: 'rgba(255, 51, 102, 0.1)', color: '#FF3366', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(255, 51, 102, 0.2)'}}>
                    {paymentError}
                  </div>
                )}
                <div className="form-group">
                  <label><Building2 size={16}/> Opérateur Mobile</label>
                  <select 
                    value={provider} 
                    onChange={(e) => setProvider(e.target.value)}
                    style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginTop: '8px'}}
                  >
                    {mobileMoneyProviders.map(p => (
                      <option key={p.code} value={p.code} style={{background: '#1A1A1A', color: 'white'}}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label><Smartphone size={16}/> Numéro Mobile Money</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 237650000000" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginTop: '8px'}}
                  />
                  <small style={{color: 'var(--text-muted)', display: 'block', marginTop: '6px'}}>N'oubliez pas l'indicatif du pays sans le + (ex: 237 pour le Cameroun)</small>
                </div>

                <button 
                  className="btn-primary" 
                  style={{width: '100%', padding: '14px', borderRadius: '8px', marginTop: '1.5rem', fontWeight: 'bold'}}
                  onClick={initiateDirectPayment}
                >
                  Confirmer le paiement
                </button>
              </div>
            ) : paymentStatus === 'PENDING' ? (
              <div style={{textAlign: 'center', padding: '2rem 1rem'}}>
                <Loader2 size={48} className="spinner" style={{color: 'var(--primary-color)', margin: '0 auto 1rem'}} />
                <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>En attente de validation</h3>
                <p style={{color: 'var(--text-muted)'}}>
                  Veuillez consulter votre téléphone et valider la transaction Mobile Money.
                </p>
                <div style={{marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>
                  Ne fermez pas cette fenêtre. La mise à jour sera automatique.
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '2rem 1rem'}}>
                <CheckCircle2 size={56} style={{color: '#00FF00', margin: '0 auto 1rem'}} />
                <h3 style={{fontSize: '1.4rem', color: '#00FF00', marginBottom: '0.5rem'}}>Paiement réussi !</h3>
                <p style={{color: 'var(--text-muted)'}}>
                  Tes crédits ont été ajoutés avec succès.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Credits;
