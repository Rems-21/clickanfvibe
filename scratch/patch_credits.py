with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_str = "import { Zap, HelpCircle, Music, Sparkles, Clock, ArrowRight, ShieldCheck, Gift, Loader2 } from 'lucide-react';"
new_import_str = "import { Zap, HelpCircle, Music, Sparkles, Clock, ArrowRight, ShieldCheck, Gift, Loader2, X, Smartphone, CheckCircle } from 'lucide-react';"

content = content.replace(import_str, new_import_str)

state_vars = """  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);"""
new_state_vars = """  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentNetwork, setPaymentNetwork] = useState('wave');
  const [paymentStatus, setPaymentStatus] = useState('idle');"""

content = content.replace(state_vars, new_state_vars)

old_handleBuy = """  const handleBuy = async (amount_fcfa, gens) => {
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
          alert(data.detail || "Erreur d'initialisation du paiement");
          setIsProcessing(null);
      }
    } catch (e) {
        alert("Erreur réseau");
        setIsProcessing(null);
    }
  };"""

new_handleBuy = """  const handleBuy = (amount_fcfa, gens) => {
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
              phone_number: phoneNumber,
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
  };"""

content = content.replace(old_handleBuy, new_handleBuy)


modal_jsx = """      {/* Modal de Paiement Marque Blanche */}
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
                        <div className="phone-input-wrapper">
                            <Smartphone size={20} className="phone-icon" />
                            <input 
                                type="tel" 
                                placeholder="Ex: 0701020304" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="phone-input"
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
"""

# Insert modal at the end before closing </div> of container
content = content.replace('    </div>\n  );\n}\n\nexport default Credits;', modal_jsx + '\n    </div>\n  );\n}\n\nexport default Credits;')

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied to Credits.jsx")
