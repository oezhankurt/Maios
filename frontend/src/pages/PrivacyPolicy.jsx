import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
      <h1 style={{ marginBottom: 30, fontSize: 28 }}>Datenschutzerklärung</h1>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>1. Datenschutz auf einen Blick</h2>
        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)' }}>Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
          personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten
          sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche
          Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgelisteten
          Datenschutzerklärung.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>2. Erfassung von Daten</h2>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)' }}>
          Wer ist verantwortlich für die Datenerfassung?
        </h3>
        <p>
          Die Datenverarbeitung auf dieser Website erfolgt durch AscopharmGmbH. Kontakt: info@maios.de
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Wie erfassen wir Ihre Daten?
        </h3>
        <p>
          Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierzu gehören
          z. B. Daten, die Sie in ein Kontaktformular eingeben, beim Registrieren eines Benutzerkontos
          oder beim Hochladen von Dokumenten.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Wofür nutzen wir Ihre Daten?
        </h3>
        <p>
          Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
          gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Welche Rechte haben Sie bezüglich Ihrer Daten?
        </h3>
        <p>
          Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck
          Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die
          Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>
          3. Allgemeine Hinweise und Pflichtinformationen
        </h2>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)' }}>Datenschutz</h3>
        <p>
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
          behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
          Datenschutzvorschriften sowie dieser Datenschutzerklärung.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Hinweis zur verantwortlichen Stelle
        </h3>
        <p>
          Verantwortliche Stelle für die Datenverarbeitung ist: AscopharmGmbH, Musterstraße 123,
          12345 Berlin, info@maios.de
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>
          4. Datenerfassung auf unserer Website
        </h2>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)' }}>Server-Log-Dateien</h3>
        <p>
          Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
          Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
        </p>
        <ul style={{ marginLeft: 20, color: 'var(--text-muted)' }}>
          <li>Browsertyp und Browserversion</li>
          <li>Verwendetes Betriebssystem</li>
          <li>Referrer URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Grundlage
          für die Datenverarbeitung bildet Art. 6 Abs. 1 lit. b DSGVO, der die Verarbeitung von Daten
          zur Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen gestattet.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Kontaktformular
        </h3>
        <p>
          Sollten Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
          Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung
          der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Benutzerregistrierung
        </h3>
        <p>
          Bei der Registrierung erfassen wir folgende Daten: E-Mail-Adresse, Benutzername,
          Passworthash, Timezone, Sprache und Währung. Diese werden benötigt, um unser Service
          bereitzustellen. Ihr Passwort wird mit modernen Verschlüsselungsmethoden (bcrypt)
          verschlüsselt.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Login-Sicherheit
        </h3>
        <p>
          Wir protokollieren alle Login- und Logout-Ereignisse inklusive IP-Adresse und Browser-Info.
          Dies dient Ihrer Sicherheit und hilft uns, verdächtige Aktivitäten zu erkennen.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>5. Sicherheit Ihrer Daten</h2>
        <p>
          Wir treffen umfassende technische und organisatorische Sicherheitsmaßnahmen zum Schutz Ihrer
          personenbezogenen Daten:
        </p>
        <ul style={{ marginLeft: 20, color: 'var(--text-muted)' }}>
          <li>SSL/TLS-Verschlüsselung aller Datenübertragungen</li>
          <li>Sichere JWT-Token-basierte Authentifizierung</li>
          <li>Rate-Limiting gegen Brute-Force-Angriffe</li>
          <li>Regelmäßige Sicherheits-Audits</li>
          <li>Verschlüsselte Speicherung von sensiblen Daten</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>
          6. Ihre Rechte gemäß DSGVO
        </h2>
        <p>Sie haben folgende Rechte:</p>
        <ul style={{ marginLeft: 20, color: 'var(--text-muted)' }}>
          <li>
            <strong>Recht auf Auskunft:</strong> Sie können Auskunft über Ihre bei uns gespeicherten
            Daten verlangen.
          </li>
          <li>
            <strong>Recht auf Berichtigung:</strong> Sie können die Berichtigung falscher Daten
            verlangen.
          </li>
          <li>
            <strong>Recht auf Löschung:</strong> Sie können unter bestimmten Voraussetzungen die
            Löschung Ihrer Daten verlangen.
          </li>
          <li>
            <strong>Recht auf Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung
            Ihrer Daten verlangen.
          </li>
          <li>
            <strong>Recht auf Datenportabilität:</strong> Sie können Ihre Daten in einem strukturierten,
            gängigen Format erhalten.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>
          7. Kontakt bei Datenschutzfragen
        </h2>
        <p>
          Sollten Sie Fragen zum Datenschutz haben oder Ihre Rechte ausüben wollen, kontaktieren Sie
          uns bitte unter:
        </p>
        <p>
          <strong>E-Mail:</strong> datenschutz@maios.de
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
        Letzter Stand: Juli 2026. Diese Datenschutzerklärung kann jederzeit aktualisiert werden.
      </div>
    </div>
  );
}
