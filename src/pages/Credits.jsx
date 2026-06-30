import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, HelpCircle, Music, Sparkles, Clock, ArrowRight, ShieldCheck, Gift, Loader2 } from 'lucide-react';
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

  const handleBuy = async (amount_fcfa, gens) => {
    if (isProcessing) return;
    setIsProcessing(amount_fcfa);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              amount_fcfa: amount_fcfa,
              credits_to_add: gens,
              origin: window.location.origin
          })
      });
      const data = await res.json();
      if (res.ok && data.checkout_url) {
          window.location.href = data.checkout_url;
      } else {
          addToast("Erreur", data.detail || "Erreur d'initialisation du paiement", "error");
          setIsProcessing(null);
      }
    } catch (e) {
        addToast("Erreur", "Erreur réseau", "error");
        setIsProcessing(null);
    }
  };

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
                  <button className="btn-buy primary" onClick={() => handleBuy(plan.price_fcfa, plan.credits)} disabled={isProcessing === plan.price_fcfa}>
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
                  <button className="btn-buy primary" onClick={() => handleBuy(plan.price_fcfa, plan.credits)} disabled={isProcessing === plan.price_fcfa}>
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
    </div>
  );
}

export default Credits;
