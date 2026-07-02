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
  const [selectedCountry, setSelectedCountry] = useState('');
  const [fullName, setFullName] = useState('');

  const countryNames = {
    'BEN': 'Bénin',
    'CMR': 'Cameroun',
    'CIV': "Côte d'Ivoire",
    'COD': 'RD Congo',
    'GAB': 'Gabon',
    'KEN': 'Kenya',
    'COG': 'Congo',
    'RWA': 'Rwanda',
    'SEN': 'Sénégal',
    'SLE': 'Sierra Leone',
    'UGA': 'Ouganda',
    'ZMB': 'Zambie'
  };

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
  const [initialCredits, setInitialCredits] = useState(0);
  useEffect(() => {
    if (paymentStatus === 'PENDING') {
       if (credits > initialCredits) {
         setPaymentStatus('SUCCESS');
         setTimeout(() => {
           setShowPaymentModal(false);
           setPaymentStatus('IDLE');
           setSelectedPlan(null);
           setPhoneNumber('');
           setTransactions([]); // reset to force refetch
         }, 3000);
       }
    }
  }, [credits, paymentStatus, initialCredits]);


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

  const pollPaymentStatus = async (kpay_id, attempts = 0) => {
    if (attempts > 100) { // 5 minutes timeout
        setPaymentStatus('ERROR');
        setPaymentError("Délai d'attente dépassé. Veuillez réessayer.");
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/payment/status/${kpay_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'COMPLETED') {
                setPaymentStatus('SUCCESS');
                if (refreshCredits) refreshCredits();
                return;
            } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
                setPaymentStatus('ERROR');
                const reason = data.status === 'FAILED' ? 'refusé ou a échoué' : 'annulé';
                setPaymentError(`Le paiement a été ${reason} sur votre téléphone.`);
                return;
            }
        }
    } catch (e) {
        console.error("Polling error", e);
    }
    // Continue polling
    setTimeout(() => pollPaymentStatus(kpay_id, attempts + 1), 3000);
  };

  const initiateDirectPayment = async () => {
    if (!phoneNumber || !provider) {
      setPaymentError("Veuillez remplir tous les champs");
      return;
    }

    const providerObj = mobileMoneyProviders.find(p => p.code === provider);
    const countryCodes = {
      'BEN': '229', 'CMR': '237', 'CIV': '225', 'COD': '243',
      'GAB': '241', 'KEN': '254', 'COG': '242', 'RWA': '250',
      'SEN': '221', 'SLE': '232', 'UGA': '256', 'ZMB': '260'
    };
    
    let cleanPhone = phoneNumber.trim().replace(/^0+/, '');
    
    // Country validation
    if (providerObj) {
        if (providerObj.country === 'CMR' && !/^[6|2]\d{8}$/.test(cleanPhone)) {
            setPaymentError("Le numéro pour le Cameroun doit comporter 9 chiffres.");
            return;
        }
        if (providerObj.country === 'CIV' && !/^\d{10}$/.test(cleanPhone)) {
            setPaymentError("Le numéro pour la Côte d'Ivoire doit comporter 10 chiffres.");
            return;
        }
        if (providerObj.country === 'SEN' && !/^[7]\d{8}$/.test(cleanPhone)) {
            setPaymentError("Le numéro pour le Sénégal doit comporter 9 chiffres.");
            return;
        }
    }

    const prefix = providerObj ? countryCodes[providerObj.country] : '';
    let formattedPhone = cleanPhone;
    if (prefix && !formattedPhone.startsWith(prefix)) {
      formattedPhone = prefix + formattedPhone;
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
              phoneNumber: formattedPhone,
              provider: provider,
              fullName: fullName
          })
      });
      const data = await res.json();
      if (!res.ok) {
          setPaymentStatus('ERROR');
          setPaymentError(data.detail || "Erreur d'initialisation du paiement");
          return;
      }
      
      if (data.status === 'PENDING' && data.kpay_id) {
          pollPaymentStatus(data.kpay_id);
      } else if (data.checkout_url) {
          window.location.href = data.checkout_url;
      } else {
          setPaymentStatus('ERROR');
          setPaymentError("Réponse inattendue du serveur");
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
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', zIndex: 1000, background: 'rgba(0,0,0,0.85)', overflowY: 'auto', padding: '40px 20px'}}>
          <div className="modal-content kpay-modal" style={{width: '100%', maxWidth: '420px', background: 'var(--bg-card, #1c1c1c)', border: '1px solid var(--border-color, #333)', padding: '0', borderRadius: '16px', overflow: 'hidden', margin: 'auto'}}>
            
            <div style={{padding: '20px 24px', borderBottom: '1px solid var(--border-color, #333)', display: 'flex', justifyContent: 'center', position: 'relative'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: 0}}>clickandvibe</h3>
              <button className="modal-close" onClick={() => paymentStatus !== 'PENDING' && setShowPaymentModal(false)} disabled={paymentStatus === 'PENDING'} style={{position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>
            </div>
            
            <div style={{padding: '24px'}}>
              <div style={{background: 'var(--bg-color, #111)', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border-color, #333)'}}>
                <div style={{fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'}}>MONTANT À PAYER</div>
                <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '4px', lineHeight: 1}}>{selectedPlan.price_fcfa} <span style={{fontSize: '2rem'}}>XAF</span></div>
                <div style={{fontSize: '0.85rem', color: '#a1a1aa', marginTop: '8px'}}>KPAY</div>
              </div>

              <h4 style={{fontSize: '1.1rem', color: 'white', marginBottom: '16px', fontWeight: 'bold'}}>Moyen de paiement</h4>

            {paymentStatus === 'IDLE' || paymentStatus === 'ERROR' ? (
              <div className="kpay-form">
                {paymentStatus === 'ERROR' && (
                  <div style={{background: 'rgba(255, 51, 102, 0.1)', color: '#FF3366', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(255, 51, 102, 0.2)'}}>
                    {paymentError}
                  </div>
                )}
                
                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', fontSize: '0.9rem', color: 'white', marginBottom: '8px', fontWeight: 'bold'}}>Pays</label>
                  <select 
                    value={selectedCountry} 
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      const firstProvider = mobileMoneyProviders.find(p => p.country === e.target.value);
                      setProvider(firstProvider ? firstProvider.code : '');
                    }}
                    style={{width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--bg-color, #111)', border: '1px solid var(--primary, #FF3366)', color: 'white', fontSize: '0.95rem', outline: 'none', cursor: 'pointer'}}
                  >
                    <option value="" disabled>-- Cliquez ici pour choisir un pays --</option>
                    {Object.entries(countryNames).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                {selectedCountry && (
                  <div className="form-group" style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', fontSize: '0.9rem', color: 'white', marginBottom: '8px', fontWeight: 'bold'}}>Opérateur</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {mobileMoneyProviders.filter(p => p.country === selectedCountry).map(p => (
                        <label key={p.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: provider === p.code ? 'rgba(255, 51, 102, 0.15)' : 'var(--bg-color, #111)', border: `1px solid ${provider === p.code ? 'var(--primary, #FF3366)' : 'var(--border-color, #333)'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <input type="radio" name="operator" value={p.code} checked={provider === p.code} onChange={(e) => setProvider(e.target.value)} style={{ accentColor: 'var(--primary, #FF3366)', cursor: 'pointer', width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: provider === p.code ? 'bold' : 'normal' }}>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group" style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', fontSize: '0.9rem', color: 'white', marginBottom: '8px', fontWeight: 'bold'}}>Nom complet</label>
                  <input 
                    type="text" 
                    placeholder="Ex. Alice Dupont" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--bg-color, #111)', border: '1px solid var(--border-color, #333)', color: 'white', fontSize: '0.95rem', outline: 'none'}}
                  />
                </div>

                <div className="form-group" style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '0.9rem', color: 'white', marginBottom: '8px', fontWeight: 'bold'}}>Numéro de téléphone <span style={{color: 'var(--primary, #FF3366)', fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '6px'}}>(Sans indicatif pays)</span></label>
                  <input 
                    type="text" 
                    placeholder="Ex. 6XXXXXXXX (sans code pays)" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: '8px', 
                      background: 'var(--bg-color, #111)', 
                      border: paymentError && (paymentError.toLowerCase().includes('numéro') || (!phoneNumber && paymentError.includes('champs'))) ? '1px solid #ef4444' : '1px solid var(--border-color, #333)', 
                      color: 'white', 
                      fontSize: '0.95rem', 
                      outline: 'none'
                    }}
                  />
                </div>

                <button 
                  style={{width: '100%', padding: '16px', borderRadius: '8px', background: 'var(--primary, #FF3366)', color: 'white', fontWeight: 'bold', fontSize: '1.05rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s'}}
                  onMouseOver={(e) => e.target.style.opacity = '0.9'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                  onClick={initiateDirectPayment}
                >
                  Payer {selectedPlan.price_fcfa} XAF
                </button>
              </div>
            ) : paymentStatus === 'PENDING' ? (
              <div style={{textAlign: 'center', padding: '2rem 1rem'}}>
                <div style={{border: '4px solid rgba(255, 51, 102, 0.2)', borderTop: '4px solid var(--primary, #FF3366)', borderRadius: '50%', width: '48px', height: '48px', margin: '0 auto 1rem', animation: 'spin 1s linear infinite'}} className="spinner"></div>
                <h3 style={{fontSize: '1.2rem', color: 'white', marginBottom: '0.5rem'}}>En attente de validation</h3>
                <p style={{color: '#a1a1aa'}}>
                  Veuillez consulter votre téléphone et valider la transaction Mobile Money.
                </p>
                <div style={{marginTop: '1.5rem', fontSize: '0.85rem', color: '#a1a1aa', background: 'var(--bg-color, #111)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color, #333)'}}>
                  Ne fermez pas cette fenêtre. La mise à jour sera automatique.
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '2rem 1rem'}}>
                <div style={{color: '#00FF00', fontSize: '56px', margin: '0 auto 1rem'}}>✓</div>
                <h3 style={{fontSize: '1.4rem', color: '#00FF00', marginBottom: '0.5rem'}}>Paiement réussi !</h3>
                <p style={{color: '#a1a1aa'}}>
                  Vos crédits ont été ajoutés avec succès.
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Credits;
