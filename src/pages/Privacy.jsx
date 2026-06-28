import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Auth.css';

function Privacy() {
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
        
        <h1 style={{ marginBottom: '10px' }}>Politique de confidentialité</h1>
        <p className="text-muted" style={{ marginBottom: '30px' }}>Dernière mise à jour : 28 juin 2026</p>

        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>
          <p>Bienvenue sur Click & Vibe.</p>
          <p>La présente Politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme de création musicale basée sur l’intelligence artificielle.</p>
          <p>En utilisant Click & Vibe, vous acceptez les pratiques décrites dans cette politique.</p>
          
          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>1. Informations que nous collectons</h2>
          <p>Lors de votre utilisation de Click & Vibe, nous pouvons collecter les informations suivantes :</p>
          
          <h3 style={{ color: '#fff', fontSize: '1rem', marginTop: '15px', marginBottom: '10px' }}>Informations de compte</h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Nom</li>
            <li>Adresse e-mail</li>
            <li>Photo de profil (si applicable)</li>
            <li>Identifiant utilisateur</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1rem', marginTop: '15px', marginBottom: '10px' }}>Informations de paiement</h3>
          <p>Les paiements sont traités par nos partenaires de paiement sécurisés. Nous ne stockons jamais vos mots de passe Mobile Money, vos codes PIN ou vos informations bancaires.</p>
          <p>Nous pouvons conserver :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Référence de transaction</li>
            <li>Montant</li>
            <li>Date</li>
            <li>Statut du paiement</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1rem', marginTop: '15px', marginBottom: '10px' }}>Informations liées aux créations</h3>
          <p>Lorsque vous utilisez notre IA, nous enregistrons :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Vos prompts</li>
            <li>Les styles musicaux sélectionnés</li>
            <li>Les paramètres de génération</li>
            <li>Les chansons générées</li>
            <li>Les pochettes générées</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1rem', marginTop: '15px', marginBottom: '10px' }}>Informations techniques</h3>
          <p>Nous pouvons collecter automatiquement :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Adresse IP</li>
            <li>Type d’appareil</li>
            <li>Navigateur</li>
            <li>Système d’exploitation</li>
            <li>Journaux d’utilisation</li>
            <li>Date et heure des connexions</li>
          </ul>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>2. Utilisation des données</h2>
          <p>Vos informations sont utilisées afin de :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>créer et gérer votre compte ;</li>
            <li>générer vos chansons grâce à l’intelligence artificielle ;</li>
            <li>traiter vos paiements ;</li>
            <li>fournir un support technique ;</li>
            <li>améliorer nos services ;</li>
            <li>prévenir les fraudes et les abus ;</li>
            <li>respecter nos obligations légales.</li>
          </ul>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>3. Confidentialité des créations</h2>
          <p>Les chansons générées restent associées à votre compte. Nous ne revendiquons aucun droit de propriété sur les créations que vous réalisez via Click & Vibe. Toutefois, vous êtes responsable du contenu des prompts que vous soumettez.</p>
          <p>Vous vous engagez à ne pas générer de contenus illégaux, diffamatoires, haineux ou portant atteinte aux droits de tiers.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>4. Partage des informations</h2>
          <p>Nous ne vendons jamais vos données personnelles. Nous pouvons partager certaines informations uniquement avec :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>nos prestataires de paiement ;</li>
            <li>nos fournisseurs d’infrastructure cloud ;</li>
            <li>nos fournisseurs de services d’intelligence artificielle ;</li>
            <li>les autorités compétentes lorsque la loi l’exige.</li>
          </ul>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>5. Sécurité</h2>
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles destinées à protéger vos données contre :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>l’accès non autorisé ;</li>
            <li>la perte ;</li>
            <li>la modification ;</li>
            <li>la divulgation.</li>
          </ul>
          <p>Cependant, aucune méthode de transmission sur Internet n’est totalement sécurisée.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>6. Conservation des données</h2>
          <p>Nous conservons vos données uniquement pendant la durée nécessaire à la fourniture du service ou au respect de nos obligations légales. Certaines créations peuvent être supprimées automatiquement conformément aux règles de conservation de la plateforme.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>7. Cookies</h2>
          <p>Click & Vibe peut utiliser des cookies et technologies similaires afin de :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>maintenir votre session active ;</li>
            <li>améliorer votre expérience utilisateur ;</li>
            <li>analyser l’utilisation de la plateforme ;</li>
            <li>sécuriser les connexions.</li>
          </ul>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>8. Vos droits</h2>
          <p>Vous pouvez, selon les lois applicables :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>consulter vos données ;</li>
            <li>demander leur correction ;</li>
            <li>demander leur suppression ;</li>
            <li>demander l’export de vos données ;</li>
            <li>retirer votre consentement lorsque cela est applicable.</li>
          </ul>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>9. Comptes</h2>
          <p>Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité réalisée depuis votre compte est présumée effectuée par vous.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>10. Services tiers</h2>
          <p>Click & Vibe peut intégrer des services tiers tels que :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>fournisseurs de paiement ;</li>
            <li>fournisseurs d’intelligence artificielle ;</li>
            <li>services d’analyse ;</li>
            <li>services de stockage cloud.</li>
          </ul>
          <p>Ces services disposent de leurs propres politiques de confidentialité.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>11. Mineurs</h2>
          <p>Click & Vibe n’est pas destiné aux enfants de moins de 13 ans (ou de l’âge minimum applicable dans votre pays).</p>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
