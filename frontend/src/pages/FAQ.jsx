import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const faqItems = [
  {
    id: 1,
    question: 'Was ist Maios?',
    answer:
      'Maios ist eine umfassende Amazon-Seller-Analytics-Plattform, die dir hilft, deine Produkte zu analysieren, Keywords zu recherchieren und deine Werbekampagnen zu optimieren. Mit Tools wie Black Box, Cerebro und Smart Portfolios erhältst du datengestützte Erkenntnisse für bessere Verkäufe.',
  },
  {
    id: 2,
    question: 'Welche Amazon-Marketplace werden unterstützt?',
    answer:
      'Maios unterstützt mehrere internationale Amazon-Marketplace einschließlich Amazon.de, Amazon.com, Amazon.co.uk und andere. Zusätzlich können auch Kaufland und weitere Marktplätze integriert werden.',
  },
  {
    id: 3,
    question: 'Wie verbinde ich mein Amazon-Verkäuferkonto?',
    answer:
      'Du kannst dein Amazon-Verkäuferkonto in den Einstellungen verbinden. Navigiere zu Einstellungen → Amazon Connect und folge den Anweisungen zur OAuth-Authentifizierung. Deine Zugangsdaten werden verschlüsselt gespeichert.',
  },
  {
    id: 4,
    question: 'Ist Maios sicher?',
    answer:
      'Ja, Sicherheit ist unser Hauptanliegen. Wir verwenden SSL/TLS-Verschlüsselung, sichere JWT-Token-Authentifizierung, Rate Limiting und strenge Zugriffskontrolle. Deine API-Schlüssel und Passwörter werden verschlüsselt in der Datenbank gespeichert.',
  },
  {
    id: 5,
    question: 'Was ist Black Box?',
    answer:
      'Black Box ist ein Produktrecherche-Tool, das dir hilft, profitable Nischen und Produkte zu finden. Du kannst nach Produktkategorien suchen, Konkurrenzprodukte analysieren und Keyword-Chancen entdecken.',
  },
  {
    id: 6,
    question: 'Was ist Cerebro?',
    answer:
      'Cerebro ist ein Reverse-ASIN-Analyse-Tool. Gib eine ASIN oder ein Keyword ein und erfahre, für welche Keywords andere Produkte ranken, wie hoch ihre Positionen sind und welche Suchvolumina relevant sind.',
  },
  {
    id: 7,
    question: 'Kann ich meine Listings in Maios verwalten?',
    answer:
      'Ja! Mit dem Listing Builder kannst du neue Listings erstellen oder bestehende bearbeiten. Der Listing Analyzer hilft dir, deine Listings zu optimieren, und der Listing Score bewertet die Qualität deiner Produktbeschreibungen.',
  },
  {
    id: 8,
    question: 'Wie funktioniert der Index Checker?',
    answer:
      'Der Index Checker zeigt dir den Indexstatus deiner Keywords. Du siehst, in welchem Index dein Produkt für verschiedene Keywords indexiert ist und kannst so Probleme schnell erkennen.',
  },
  {
    id: 9,
    question: 'Was sind Smart Portfolios?',
    answer:
      'Smart Portfolios sind automatisierte Werbekampagnen-Gruppen, die nach definierten Regeln verwaltet werden. Du kannst automatische Gebotanpassungen, Budget-Umverteilungen und Campaign-Optimierungen durchführen lassen.',
  },
  {
    id: 10,
    question: 'Wie lange werden meine Daten gespeichert?',
    answer:
      'Deine Daten werden solange in deinem Konto gespeichert, wie du es aktiv nutzt. Nach Kontolöschung werden alle persönlichen Daten gelöscht, außer gesetzlich erforderliche Nachweise für Zahlungen.',
  },
  {
    id: 11,
    question: 'Bietet ihr technischen Support?',
    answer:
      'Ja, unser Support-Team steht dir zur Verfügung. Kontaktiere uns über das Support-Formular oder sende eine E-Mail an support@maios.de. Wir antworten normalerweise innerhalb von 24 Stunden.',
  },
  {
    id: 12,
    question: 'Können alle meinen Funktionen offline nutzen?',
    answer:
      'Nein, Maios ist eine Cloud-basierte Anwendung und benötigt eine Internetverbindung. Dies ermöglicht dir, von überall aus auf deine Daten zuzugreifen.',
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '20px',
          padding: '8px 12px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '6px',
          color: '#6366f1',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
        }}
      >
        ← Zurück
      </button>
      <h1 style={{ marginBottom: 30, fontSize: 28 }}>Häufig Gestellte Fragen</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faqItems.map((item) => (
          <div key={item.id} className="card" style={{ padding: 0 }}>
            <button
              onClick={() => toggle(item.id)}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text)',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {item.question}
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 20,
                  color: 'var(--primary)',
                  transition: 'transform 0.2s ease',
                  transform: openId === item.id ? 'rotate(180deg)' : 'rotate(0)',
                  flexShrink: 0,
                }}
              >
                ▼
              </span>
            </button>

            {openId === item.id && (
              <div
                style={{
                  padding: '0 20px 16px 20px',
                  borderTop: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  fontSize: 14,
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 40,
          padding: 20,
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          borderRadius: 12,
          borderLeft: '4px solid var(--primary)',
          fontSize: 14,
          color: 'var(--text-muted)',
        }}
      >
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 8 }}>
          Deine Frage nicht beantwortet?
        </strong>
        Kontaktiere unser Support-Team unter support@maios.de oder nutze das Support-Formular in den
        Einstellungen.
      </div>
    </div>
  );
}
