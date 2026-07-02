import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Auth.css';

function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '800px', width: '100%', padding: '40px', margin: '40px auto', maxHeight: 'none', height: 'auto', overflowY: 'visible' }}>
        <button 
          className="back-btn" 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={18} /> Retour
        </button>
        
        <h1 style={{ marginBottom: '10px' }}>Politique de remboursement</h1>
        <p className="text-muted" style={{ marginBottom: '30px' }}>Dernière mise à jour : 02 juillet 2026</p>

        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>
          <p>Chez Click & Vibe, nous mettons tout en œuvre pour offrir une expérience simple, rapide et fiable. Cette politique explique dans quels cas un remboursement peut être accordé.</p>
          
          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>1. Principe général</h2>
          <p>Les générations achetées sont des produits numériques permettant de créer des chansons personnalisées.</p>
          <p>En raison de leur nature numérique, les générations utilisées ne sont généralement pas remboursables une fois qu'une chanson a été générée.</p>
          
          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '25px', marginBottom: '15px' }}>2. Cas donnant droit à un remboursement</h2>
          <p>Un remboursement peut être accordé dans les situations suivantes :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Paiement débité mais aucune génération créditée sur le compte.</li>
            <li>Double paiement effectué par erreur.</li>
            <li>Erreur technique empêchant définitivement l'utilisation des générations achetées.</li>
            <li>Débit effectué alors que la transaction n'a jamais été finalisée.</li>
          </ul>
          <p>Chaque demande est étudiée individuellement.</p>
          
          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '25px', marginBottom: '15px' }}>3. Cas ne donnant pas droit à un remboursement</h2>
          <p>Aucun remboursement ne sera effectué lorsque :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Une ou plusieurs générations ont déjà été utilisées.</li>
            <li>La chanson générée ne correspond pas aux attentes personnelles de l'utilisateur.</li>
            <li>Une erreur provient des informations fournies lors de la création de la chanson.</li>
            <li>L'utilisateur change d'avis après son achat.</li>
            <li>Une promotion ou un bonus gratuit a déjà été utilisé.</li>
          </ul>

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '25px', marginBottom: '15px' }}>4. Paiement en attente</h2>
          <p>Il peut arriver qu'un paiement Mobile Money reste temporairement en attente.</p>
          <p>Dans ce cas, nous invitons l'utilisateur à patienter quelques minutes.</p>
          <p>Si les générations ne sont toujours pas créditées après un délai raisonnable, notre équipe vérifiera la transaction.</p>

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '25px', marginBottom: '15px' }}>5. Délais de traitement</h2>
          <p>Les demandes de remboursement sont généralement traitées sous 3 à 7 jours ouvrables après vérification.</p>
          <p>Le délai effectif dépend également des procédures de l'opérateur de paiement.</p>

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '25px', marginBottom: '15px' }}>6. Comment demander un remboursement</h2>
          <p>Pour toute demande, contactez notre support en indiquant :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Votre adresse e-mail utilisée sur Click & Vibe</li>
            <li>La date du paiement</li>
            <li>Le montant payé</li>
            <li>Le moyen de paiement utilisé</li>
            <li>Une capture d'écran ou l'identifiant de la transaction (si disponible)</li>
          </ul>
          <p>Notre équipe analysera votre dossier dans les meilleurs délais.</p>

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '25px', marginBottom: '15px' }}>7. Fraude et abus</h2>
          <p>Click & Vibe se réserve le droit de refuser toute demande de remboursement en cas de tentative de fraude, d'utilisation abusive de la plateforme ou de non-respect des Conditions d'utilisation.</p>

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '25px', marginBottom: '15px' }}>8. Contact</h2>
          <p>Pour toute question concernant cette politique de remboursement, vous pouvez contacter notre équipe d'assistance via :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>WhatsApp</li>
            <li>E-mail</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RefundPolicy;
