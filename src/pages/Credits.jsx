import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, HelpCircle, Music, Sparkles, Clock, ArrowRight, ShieldCheck, Gift, Loader2, X, Smartphone, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Credits.css';
import '../pages/Home.css'; // Reuse common styles

function Credits() {
  const navigate = useNavigate();
  const { user, refreshCredits } = useAuth();

  const credits = user ? user.credits : 0;
  const estimatedGenerations = credits; // 1 credit = 1 gen

  const [transactions, setTransactions] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null); // stores the id of the package being processed
  const [activePromos, setActivePromos] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+225');
  const [isoCode, setIsoCode] = useState('CI');
  const [paymentNetwork, setPaymentNetwork] = useState('wave');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const countriesByNetwork = {
    mtn_money: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'CM', code: '+237', name: 'Cameroun', flag: '🇨🇲' },
      { iso: 'BJ', code: '+229', name: 'Bénin', flag: '🇧🇯' },
      { iso: 'GN', code: '+224', name: 'Guinée', flag: '🇬🇳' }
    ],
    orange_money: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'SN', code: '+221', name: 'Sénégal', flag: '🇸🇳' },
      { iso: 'ML', code: '+223', name: 'Mali', flag: '🇲🇱' },
      { iso: 'BF', code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
      { iso: 'GN', code: '+224', name: 'Guinée', flag: '🇬🇳' },
      { iso: 'CM', code: '+237', name: 'Cameroun', flag: '🇨🇲' },
      { iso: 'CD', code: '+243', name: 'RDC', flag: '🇨🇩' }
    ],
    wave: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'SN', code: '+221', name: 'Sénégal', flag: '🇸🇳' },
      { iso: 'ML', code: '+223', name: 'Mali', flag: '🇲🇱' }
    ],
    moov_money: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'TG', code: '+228', name: 'Togo', flag: '🇹🇬' },
      { iso: 'BJ', code: '+229', name: 'Bénin', flag: '🇧🇯' },
      { iso: 'BF', code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
      { iso: 'NE', code: '+227', name: 'Niger', flag: '🇳🇪' }
    ]
  };

  const availableCountries = countriesByNetwork[paymentNetwork] || countriesByNetwork['wave'];
  const currentCountry = availableCountries.find(c => c.iso === isoCode) || availableCountries[0];

  useEffect(() => {
    const isValid = availableCountries.find(c => c.iso === isoCode);
    if (!isValid) {
      setIsoCode(availableCountries[0].iso);
      setCountryCode(availableCountries[0].code);
    }
  }, [paymentNetwork, availableCountries, isoCode]);

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
    fetchPromos();
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

  const handleBuy = (amount_fcfa, gens) => {
    setSelectedPackage({ amount: amount_fcfa, gens });
    setShowPaymentModal(true);
    setPaymentStatus('idle');
  };

  const confirmPayment = async () => {
    if (!phoneNumber) {
      alert("Veuillez entrer votre numéro de téléphone (ex: 0701020304)");
      return;
    }
    setPaymentStatus('processing');
    let isDone = false;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              amount_fcfa: selectedPackage.amount,
              credits_to_add: selectedPackage.gens,
              payment_method: paymentNetwork,
              phone_number: `${countryCode}${phoneNumber.replace(/^0+/, '')}`,
              country: isoCode,
              origin: window.location.origin
          })
      });
      const data = await res.json();
      if (res.ok) {
          // Si l'API retourne une URL de paiement (certains réseaux comme Wave le nécessitent parfois)
          // Mais on essaie de garder l'utilisateur sur la page.
          if (data.checkout_url && paymentNetwork === 'wave' && data.checkout_url.includes('wave.com')) {
             window.location.href = data.checkout_url;
             return;
          }
          
          // Polling
          const initialCredits = user.credits;
          const pollInterval = setInterval(async () => {
             if (isDone) {
                 clearInterval(pollInterval);
                 return;
             }
             try {
                 const userRes = await fetch('/api/user/me', {
                   headers: { 'Authorization': `Bearer ${token}` }
                 });
                 if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.credits > initialCredits) {
                       isDone = true;
                       clearInterval(pollInterval);
                       setPaymentStatus('success');
                       if (refreshCredits) refreshCredits();
                       setTimeout(() => {
                          setShowPaymentModal(false);
                          setPaymentStatus('idle');
                       }, 4000);
                    }
                 }
             } catch(err) {
                 console.log("Polling error", err);
             }
          }, 3000);
          
          // Timeout après 5 minutes
          setTimeout(() => {
             if (!isDone) {
                 isDone = true;
                 clearInterval(pollInterval);
                 setPaymentStatus('error');
             }
          }, 5 * 60 * 1000);

      } else {
          alert(data.detail || "Erreur d'initialisation du paiement");
          setPaymentStatus('idle');
      }
    } catch (e) {
        alert("Erreur réseau");
        setPaymentStatus('idle');
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
          <div className="packages-list">
            <div className="package-card popular">
              <div className="package-icon pink"><Zap size={24} fill="#FF3366" color="#FF3366" /></div>
              <div className="package-details">
                <h4>1 Gen</h4>
              </div>
              <div className="package-price text-primary">1 250 FCFA</div>
              <button className="btn-buy primary" onClick={() => handleBuy(1250, 1)} disabled={isProcessing === 1250}>
                {isProcessing === 1250 ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
              </button>
            </div>

            <div className="package-card popular">
              <div className="package-badge">Populaire</div>
              <div className="package-icon purple"><Zap size={24} fill="#9933FF" color="#9933FF" /></div>
              <div className="package-details">
                <div className="package-title-row">
                  <h4>2 Gens</h4>
                  <div className="package-discount">-8%</div>
                </div>
              </div>
              <div className="package-price">2 300 FCFA</div>
              <button className="btn-buy primary" onClick={() => handleBuy(2300, 2)} disabled={isProcessing === 2300}>
                {isProcessing === 2300 ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
              </button>
            </div>

            <div className="package-card popular">
              <div className="package-badge">Meilleur prix</div>
              <div className="package-icon orange"><Zap size={24} fill="#FF6B00" color="#FF6B00" /></div>
              <div className="package-details">
                <div className="package-title-row">
                  <h4>3 Gens</h4>
                  <div className="package-discount orange">-15%</div>
                </div>
              </div>
              <div className="package-price">3 200 FCFA</div>
              <button className="btn-buy primary" onClick={() => handleBuy(3200, 3)} disabled={isProcessing === 3200}>
                {isProcessing === 3200 ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
              </button>
            </div>
          </div>
          
          <h3 className="section-title" style={{marginTop: '2rem'}}>Kits Créateur</h3>
          <div className="packages-list">

            <div className="package-card popular">
              <div className="package-badge">🥉 Starter</div>
              <div className="package-icon pink"><Zap size={24} fill="#FF3366" color="#FF3366" /></div>
              <div className="package-details">
                <h4>5 Gens</h4>
                <p>Idéal pour découvrir Click & Vibe.</p>
              </div>
              <div className="package-price text-primary">5 000 FCFA</div>
              <button className="btn-buy primary" onClick={() => handleBuy(5000, 5)} disabled={isProcessing === 5000}>
                {isProcessing === 5000 ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
              </button>
            </div>

            <div className="package-card popular">
              <div className="package-badge">🥈 Populaire</div>
              <div className="package-icon purple"><Zap size={24} fill="#9933FF" color="#9933FF" /></div>
              <div className="package-details">
                <div className="package-title-row">
                  <h4>10 Gens</h4>
                  <div className="package-discount">Creator</div>
                </div>
                <p>Économie par rapport aux achats à l'unité.</p>
              </div>
              <div className="package-price">9 000 FCFA</div>
              <button className="btn-buy primary" onClick={() => handleBuy(9000, 10)} disabled={isProcessing === 9000}>
                {isProcessing === 9000 ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
              </button>
            </div>

            <div className="package-card popular">
              <div className="package-badge">🥇 Premium</div>
              <div className="package-icon orange"><Zap size={24} fill="#FF6B00" color="#FF6B00" /></div>
              <div className="package-details">
                <div className="package-title-row">
                  <h4>25 Gens</h4>
                </div>
                <p>Pour les créateurs réguliers.</p>
              </div>
              <div className="package-price">20 000 FCFA</div>
              <button className="btn-buy primary" onClick={() => handleBuy(20000, 25)} disabled={isProcessing === 20000}>
                {isProcessing === 20000 ? <Loader2 size={20} className="spinner" /> : <ArrowRight size={20} />}
              </button>
            </div>
          </div>
          <div className="secure-payment">
            <ShieldCheck size={14} />
            <span>Paiement 100% sécurisé via GeniusPay</span>
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
      {/* Modal de Paiement Marque Blanche */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={() => paymentStatus !== 'processing' && setShowPaymentModal(false)}>
          <div className="payment-modal-content" onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setShowPaymentModal(false)} disabled={paymentStatus === 'processing'}>
              <X size={20} />
            </button>
            
            {paymentStatus === 'idle' && (
                <>
                    <h3>Paiement Sécurisé</h3>
                    <p className="payment-modal-subtitle">Vous achetez <strong>{selectedPackage?.gens} Gens</strong> pour {selectedPackage?.amount} FCFA.</p>
                    
                    <div className="payment-networks">
                        <label className={`network-option ${paymentNetwork === 'mtn_money' ? 'selected' : ''}`}>
                            <input type="radio" name="network" value="mtn_money" checked={paymentNetwork === 'mtn_money'} onChange={(e) => setPaymentNetwork(e.target.value)} />
                            <div className="network-details">
                                <span className="network-name">MTN Mobile Money</span>
                                <span className="network-badge mtn">MTN</span>
                            </div>
                        </label>
                        <label className={`network-option ${paymentNetwork === 'orange_money' ? 'selected' : ''}`}>
                            <input type="radio" name="network" value="orange_money" checked={paymentNetwork === 'orange_money'} onChange={(e) => setPaymentNetwork(e.target.value)} />
                            <div className="network-details">
                                <span className="network-name">Orange Money</span>
                                <span className="network-badge orange">Orange</span>
                            </div>
                        </label>
                        <label className={`network-option ${paymentNetwork === 'wave' ? 'selected' : ''}`}>
                            <input type="radio" name="network" value="wave" checked={paymentNetwork === 'wave'} onChange={(e) => setPaymentNetwork(e.target.value)} />
                            <div className="network-details">
                                <span className="network-name">Wave</span>
                                <span className="network-badge wave">Wave</span>
                            </div>
                        </label>
                        <label className={`network-option ${paymentNetwork === 'moov_money' ? 'selected' : ''}`}>
                            <input type="radio" name="network" value="moov_money" checked={paymentNetwork === 'moov_money'} onChange={(e) => setPaymentNetwork(e.target.value)} />
                            <div className="network-details">
                                <span className="network-name">Moov Money</span>
                                <span className="network-badge moov">Moov</span>
                            </div>
                        </label>
                    </div>

                    <div className="phone-input-group">
                        <label>Numéro de téléphone Mobile Money</label>
                        <div className="phone-input-wrapper-with-code">
                            <div className="country-code-selector custom-dropdown-container">
                                <button 
                                    type="button"
                                    className="custom-dropdown-btn" 
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                >
                                    <span className="flag-icon">{currentCountry.flag}</span>
                                    <span>{currentCountry.code}</span>
                                    <ChevronDown size={14} />
                                </button>
                                
                                {showCountryDropdown && (
                                    <div className="custom-dropdown-menu">
                                        {availableCountries.map(country => (
                                            <div 
                                                key={country.iso} 
                                                className={`custom-dropdown-item ${isoCode === country.iso ? 'active' : ''}`}
                                                onClick={() => {
                                                    setIsoCode(country.iso);
                                                    setCountryCode(country.code);
                                                    setShowCountryDropdown(false);
                                                }}
                                            >
                                                <span className="flag-icon">{country.flag}</span>
                                                <span className="country-name">{country.name}</span>
                                                <span className="country-code-span">{country.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input 
                                type="tel" 
                                placeholder="Ex: 0701020304" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="phone-input phone-input-with-code"
                            />
                        </div>
                    </div>

                    <button className="confirm-payment-btn" onClick={confirmPayment}>
                        Payer {selectedPackage?.amount} FCFA
                    </button>
                </>
            )}

            {paymentStatus === 'processing' && (
                <div className="payment-processing">
                    <Loader2 size={48} className="spin-icon" />
                    <h3>Veuillez valider le paiement sur votre téléphone</h3>
                    <p>Une demande de paiement a été envoyée au <strong>{phoneNumber}</strong>.</p>
                    <p className="payment-instruction">Tapez votre code secret sur votre téléphone pour confirmer l'achat de {selectedPackage?.gens} Gens.</p>
                    <div className="payment-polling-pulse">
                        <div className="pulse-dot"></div>
                        <span>En attente de validation...</span>
                    </div>
                </div>
            )}

            {paymentStatus === 'success' && (
                <div className="payment-success-modal">
                    <CheckCircle size={64} className="success-icon" />
                    <h3>Paiement Réussi !</h3>
                    <p>Vos {selectedPackage?.gens} Gens ont été ajoutés à votre compte avec succès.</p>
                    <p className="redirecting-text">Fermeture automatique...</p>
                </div>
            )}

            {paymentStatus === 'error' && (
                <div className="payment-error-modal">
                    <X size={64} className="error-icon" />
                    <h3>Paiement Échoué ou Expiré</h3>
                    <p>Le paiement n'a pas pu être validé. Vous pouvez réessayer.</p>
                    <button className="retry-payment-btn" onClick={() => setPaymentStatus('idle')}>
                        Réessayer
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Credits;
