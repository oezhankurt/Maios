import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', lineHeight: 1.8 }}>
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
      <h1 style={{ marginBottom: 30, fontSize: 28 }}>Allgemeine Geschäftsbedingungen</h1>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Maios-Plattform durch
          Kunden. Mit der Registrierung erklären Sie sich mit diesen AGB einverstanden.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>2. Vertragsabschluss</h2>
        <p>
          Der Vertrag kommt zustande durch Ihre Registrierung auf unserer Website und unsere
          Bestätigung. Sie erklären sich mit diesen AGB und unserer Datenschutzerklärung einverstanden.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>3. Nutzungsrechte</h2>
        <p>
          Wir räumen Ihnen ein persönliches, nicht-exklusives, nicht übertragbares Nutzungsrecht an
          der Maios-Plattform ein. Dieses Recht ist begrenzt auf die Nutzung nach diesen AGB.
        </p>
        <p style={{ marginTop: 12 }}>Verboten sind insbesondere:</p>
        <ul style={{ marginLeft: 20, color: 'var(--text-muted)' }}>
          <li>Reverse Engineering oder Dekompilierung der Software</li>
          <li>Unauthorisierte Modifikationen oder Patches</li>
          <li>Verkauf oder Weitergabe der Zugriffsrechte</li>
          <li>Automatisiertes Scraping oder Data Mining</li>
          <li>Nutzung für Zwecke, die Amazon oder anderen Plattformen schaden</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>4. Benutzerkonto</h2>
        <p>
          Sie sind verantwortlich für die Geheimhaltung Ihres Passworts und aller Aktivitäten unter
          Ihrem Konto. Sie müssen uns sofort über verdächtige Aktivitäten informieren. Wir sind nicht
          verantwortlich für unbefugte Zugriffe.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>5. Gebühren und Zahlung</h2>
        <p>
          Die Nutzung von Maios ist kostenpflichtig. Die Gebühren richten sich nach dem gewählten
          Aboplan. Zahlungen erfolgen monatlich oder jährlich im Voraus. Zusätzliche Gebühren können
          für Premium-Features anfallen.
        </p>
        <p style={{ marginTop: 12 }}>
          Alle Preise sind zzgl. gesetzlicher Umsatzsteuer. Wir behalten uns das Recht vor, Preise mit
          30 Tagen Vorankündigung zu ändern.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>6. Abmeldung und Kündigung</h2>
        <p>
          Sie können Ihr Konto jederzeit kündigen. Eine Kündigung wird zum Ende des laufenden
          Abrechnungszeitraums wirksam. Es werden keine Rückerstattungen für teilweise genutzte Monate
          gewährt.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>7. Datensicherung und Backup</h2>
        <p>
          Obwohl wir angemessene Sicherheitsmaßnahmen implementieren, können wir nicht garantieren,
          dass die Daten uneingeschränkt sicher sind. Sie sind verantwortlich für das Erstellen von
          Backups Ihrer wichtigen Daten.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>8. Haftungsbeschränkung</h2>
        <p>
          Wir haften nicht für direkte, indirekte, beiläufige oder Folgeschäden, die sich aus Ihrer
          Nutzung der Plattform ergeben, einschließlich:
        </p>
        <ul style={{ marginLeft: 20, color: 'var(--text-muted)' }}>
          <li>Verlust von Daten oder Gewinn</li>
          <li>Geschäftsunterbrechung</li>
          <li>Reputationsschaden</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Insgesamt haften wir nicht für Schäden, die einen Betrag von einem Monat Abonnementgebühren
          übersteigen.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>9. Änderung der Serviceleistungen</h2>
        <p>
          Wir behalten uns das Recht vor, die Maios-Plattform, ihre Features oder ihre Verfügbarkeit
          jederzeit zu ändern oder einzustellen. Größere Änderungen werden mit 30 Tagen Vorankündigung
          mitgeteilt.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>10. Datenlöschung nach Kündigung</h2>
        <p>
          Nach Kündigung Ihres Kontos behalten wir Ihre Daten für einen Zeitraum von 90 Tagen. Danach
          werden alle Daten permanent gelöscht. Sie können die Löschung auch vorher anfordern.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>11. Verbotene Aktivitäten</h2>
        <p>Sie erklären sich einverstanden, Maios nicht für folgende Zwecke zu nutzen:</p>
        <ul style={{ marginLeft: 20, color: 'var(--text-muted)' }}>
          <li>Übermittlung von Viren, Malware oder schädlichem Code</li>
          <li>Unlawful or harassing activity</li>
          <li>Verletzung von Rechten anderer Benutzer</li>
          <li>Spam oder kommerzielle Ausbeutung</li>
          <li>Beeinträchtigung der Systemleistung oder Sicherheit</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>12. Intellectual Property</h2>
        <p>
          Alle Inhalte, Software und Dokumentation auf der Maios-Plattform sind unser geistiges
          Eigentum oder das unserer Lizenzgeber. Sie dürfen diese nicht kopieren, modifizieren oder
          verbreiten, außer wie ausdrücklich erlaubt.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>13. Änderung der AGB</h2>
        <p>
          Wir können diese AGB jederzeit ändern. Wesentliche Änderungen werden 30 Tage im Voraus per
          E-Mail mitgeteilt. Die Nutzung nach Benachrichtigung gilt als Zustimmung zu den neuen
          Bedingungen.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>14. Anwendbares Recht</h2>
        <p>
          Diese AGB unterliegen den Gesetzen der Bundesrepublik Deutschland. Gerichtsstand ist Berlin,
          soweit nicht zwingend ein anderer Gerichtsstand vorgeschrieben ist.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>15. Kontakt</h2>
        <p>
          Wenn Sie Fragen zu diesen AGB haben, kontaktieren Sie uns unter:
        </p>
        <p>
          <strong>E-Mail:</strong> legal@maios.de
          <br />
          <strong>Adresse:</strong> AscopharmGmbH, Musterstraße 123, 12345 Berlin
        </p>
      </section>

      <div
        style={{
          marginTop: 40,
          padding: 20,
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          borderRadius: 12,
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        Letzter Stand: Juli 2026. Diese AGB können jederzeit aktualisiert werden.
      </div>
    </div>
  );
}
