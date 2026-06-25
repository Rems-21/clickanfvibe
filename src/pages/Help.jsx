import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import './History.css';
import '../pages/Home.css';

function Help() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "Comment recharger mes gens ?",
      answer: "Pour recharger vos recharger, rendez-vous sur la page 'Crédits' accessible depuis le menu principal ou l'icône éclair en haut de l'écran. Vous pourrez y choisir un pack adapté à vos besoins."
    },
    {
      id: 2,
      question: "Combien coûte une génération de musique ?",
      answer: "Chaque génération de musique coûte 1 gen. Assurez-vous d'avoir un solde suffisant avant de lancer une création !"
    },
    {
      id: 3,
      question: "Comment télécharger une musique ?",
      answer: "Dans votre 'Historique', chaque musique générée possède un bouton 'Télécharger'. En cliquant dessus, le fichier audio sera enregistré sur votre appareil et ajouté à l'onglet 'Mes téléchargements'."
    },
    {
      id: 4,
      question: "Comment modifier mon profil ?",
      answer: "Allez sur la page 'Profil' via le menu, puis cliquez sur 'Éditer mon profil'. Vous pourrez y changer votre nom et l'URL de votre photo de profil."
    }
  ];

  return (
    <div className="history-container">
      <header className="create-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <div className="title-section" style={{marginLeft: 16}}>
            <h1>Centre d'Aide</h1>
          </div>
        </div>
      </header>

      <div className="history-content">
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <HelpCircle size={64} color="#FF3366" style={{ marginBottom: 16 }} />
          <h2>Comment pouvons-nous t'aider ?</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            Retrouve toutes les réponses à tes questions.
          </p>
        </div>

        <div className="history-list">
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color="#0099FF" /> Questions Fréquentes (FAQ)
            </h3>
            
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className="history-card" 
                style={{ padding: '16px', cursor: 'pointer', marginBottom: '8px' }}
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: 15, color: 'white', margin: 0 }}>{faq.question}</h4>
                  {openFaq === faq.id ? <ChevronDown size={18} color="var(--text-secondary)" /> : <ChevronRight size={18} color="var(--text-secondary)" />}
                </div>
                {openFaq === faq.id && (
                  <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={20} color="#00E676" /> Contactez-nous
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://wa.me/237657381167" target="_blank" rel="noopener noreferrer" className="history-card" style={{ flexDirection: 'row', alignItems: 'center', textDecoration: 'none' }}>
                <MessageCircle size={24} color="#25D366" />
                <div style={{ flex: 1, marginLeft: 16 }}>
                  <h3 style={{ fontSize: 16, color: 'white' }}>Nous contacter sur WhatsApp</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Assistance directe</p>
                </div>
                <ChevronRight size={20} color="var(--text-secondary)" />
              </a>

              <a href="https://whatsapp.com/channel/0029Vb8L6ip47Xe9Hg66E42m" target="_blank" rel="noopener noreferrer" className="history-card" style={{ flexDirection: 'row', alignItems: 'center', textDecoration: 'none' }}>
                <MessageCircle size={24} color="#25D366" />
                <div style={{ flex: 1, marginLeft: 16 }}>
                  <h3 style={{ fontSize: 16, color: 'white' }}>Rejoindre la Chaîne WhatsApp</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Actualités et mises à jour</p>
                </div>
                <ChevronRight size={20} color="var(--text-secondary)" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Help;
