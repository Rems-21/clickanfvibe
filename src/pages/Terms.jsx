import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Auth.css';

function Terms() {
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
        
        <h1 style={{ marginBottom: '10px' }}>Conditions d’utilisation</h1>
        <p className="text-muted" style={{ marginBottom: '30px' }}>Dernière mise à jour : 28 juin 2026</p>

        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>
          <p>Bienvenue sur Click & Vibe.</p>
          <p>Les présentes Conditions d’utilisation régissent l’accès et l’utilisation de la plateforme Click & Vibe, accessible via notre site web et nos applications mobiles.</p>
          <p>En utilisant Click & Vibe, vous acceptez pleinement les présentes Conditions. Si vous n’acceptez pas ces Conditions, veuillez ne pas utiliser nos services.</p>
          
          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>1. Présentation du service</h2>
          <p>Click & Vibe est une plateforme de création musicale assistée par intelligence artificielle permettant aux utilisateurs de générer des chansons à partir d’instructions textuelles (prompts).</p>
          <p>Les fonctionnalités peuvent inclure notamment :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Génération de chansons par IA</li>
            <li>Génération de paroles</li>
            <li>Création de pochettes</li>
            <li>Téléchargement des créations</li>
            <li>Gestion d’un portefeuille de générations</li>
            <li>Achat de packs de générations</li>
          </ul>
          <p>Nous nous réservons le droit d’ajouter, modifier ou supprimer des fonctionnalités à tout moment.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>2. Création d’un compte</h2>
          <p>Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous vous engagez à :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>fournir des informations exactes ;</li>
            <li>maintenir vos informations à jour ;</li>
            <li>protéger vos identifiants de connexion.</li>
          </ul>
          <p>Vous êtes responsable de toutes les activités réalisées depuis votre compte.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>3. Générations</h2>
          <p>Les générations permettent de créer des chansons via la plateforme. Les générations :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>sont ajoutées après un achat ou une promotion ;</li>
            <li>sont déduites lors de chaque création selon les règles de la plateforme ;</li>
            <li>ne sont ni transférables ni échangeables contre de l’argent.</li>
          </ul>
          <p>Click & Vibe peut modifier les tarifs ou les offres de générations à tout moment.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>4. Paiements</h2>
          <p>Les paiements sont traités par des prestataires de paiement tiers. Click & Vibe ne conserve jamais vos informations de paiement sensibles.</p>
          <p>En cas d’échec, d’interruption ou de retard imputable au prestataire de paiement, Click & Vibe ne pourra être tenue responsable des délais de traitement.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>5. Utilisation autorisée</h2>
          <p>Vous acceptez d’utiliser Click & Vibe uniquement dans un cadre légal. Il est interdit notamment de générer des contenus :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>contraires aux lois applicables ;</li>
            <li>incitant à la haine ou à la violence ;</li>
            <li>diffamatoires ;</li>
            <li>frauduleux ;</li>
            <li>portant atteinte aux droits d’auteur, aux marques ou aux droits de tiers ;</li>
            <li>contenant des logiciels malveillants ou visant à perturber la plateforme.</li>
          </ul>
          <p>Nous pouvons suspendre ou supprimer tout contenu qui enfreint ces règles.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>6. Propriété intellectuelle</h2>
          <p>Click & Vibe, son nom, son logo, son interface, son design, son code source, ses éléments graphiques et sa technologie sont protégés par les lois applicables sur la propriété intellectuelle. Ils ne peuvent être copiés, reproduits ou redistribués sans autorisation écrite.</p>
          <p>Les utilisateurs restent responsables des prompts qu’ils soumettent et de l’utilisation qu’ils font des créations générées.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>7. Disponibilité du service</h2>
          <p>Nous faisons notre possible pour assurer un service continu. Toutefois, nous ne garantissons pas une disponibilité permanente.</p>
          <p>Des interruptions peuvent survenir notamment en raison :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>de maintenances ;</li>
            <li>de mises à jour ;</li>
            <li>de problèmes techniques ;</li>
            <li>d’incidents chez des fournisseurs tiers.</li>
          </ul>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>8. Suspension ou résiliation</h2>
          <p>Nous pouvons suspendre ou supprimer un compte notamment en cas de :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>fraude ;</li>
            <li>utilisation abusive de la plateforme ;</li>
            <li>non-respect des présentes Conditions ;</li>
            <li>activité susceptible de nuire à Click & Vibe ou à ses utilisateurs.</li>
          </ul>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>9. Limitation de responsabilité</h2>
          <p>Click & Vibe fournit un service de génération assistée par intelligence artificielle. Nous ne garantissons pas que les contenus générés répondront parfaitement à vos attentes ni qu’ils seront exempts d’erreurs.</p>
          <p>Dans les limites autorisées par la loi, Click & Vibe ne pourra être tenue responsable des pertes indirectes, des interruptions de service ou des dommages résultant de l’utilisation de la plateforme.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>10. Modifications des Conditions</h2>
          <p>Nous pouvons modifier les présentes Conditions d’utilisation à tout moment. La version mise à jour sera publiée sur cette page avec sa date d’entrée en vigueur.</p>
          <p>La poursuite de l’utilisation de la plateforme après publication des modifications vaut acceptation des nouvelles Conditions.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>11. Droit applicable</h2>
          <p>Les présentes Conditions sont régies par les lois applicables dans le pays où Click & Vibe exerce ses activités, sous réserve des dispositions impératives applicables aux utilisateurs.</p>

          <hr style={{ margin: '30px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>12. Contact</h2>
          <p>Pour toute question concernant les présentes Conditions d’utilisation, vous pouvez nous contacter :</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Email : support@clickandvibe.com</li>
            <li>Site web : <a href="https://clickandvibe.com" target="_blank" rel="noreferrer">https://clickandvibe.com</a></li>
          </ul>

          <p style={{ marginTop: '30px', fontWeight: 'bold' }}>En utilisant Click & Vibe, vous reconnaissez avoir lu, compris et accepté les présentes Conditions d’utilisation.</p>
        </div>
      </div>
    </div>
  );
}

export default Terms;
