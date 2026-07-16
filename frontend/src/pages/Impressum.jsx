export default function Impressum() {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', lineHeight: 1.8 }}>
      <h1 style={{ marginBottom: 30, fontSize: 28 }}>Impressum</h1>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Angaben gemäß § 5 TMG</h2>
        <p>
          <strong>Maios – Amazon Seller Analytics</strong>
          <br />
          [DEINE UG HIER EINTRAGEN]
          <br />
          [STRASZE UND HAUSNUMMER]
          <br />
          [POSTLEITZAHL STADT]
          <br />
          Deutschland
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Kontaktinformationen</h2>
        <p>
          <strong>Telefon:</strong> [DEINE TELEFONNUMMER]
          <br />
          <strong>E-Mail:</strong> [DEINE EMAIL]
          <br />
          <strong>Support:</strong> support@maios.de
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Geschäftsführung</h2>
        <p>Geschäftsführer/in: [DEIN NAME]</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Handelsregister</h2>
        <p>
          <strong>Amtsgericht:</strong> [DEIN AMTSGERICHT]
          <br />
          <strong>Handelsregister-Nr.:</strong> [DEINE HRB NUMMER]
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Umsatzsteuer-Identifikationsnummer</h2>
        <p>Umsatzsteuer-ID: [DEINE USTID]</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Unabhängigkeit</h2>
        <p>
          Maios ist ein eigenständiges Produkt und steht in keiner Verbindung zu anderen Unternehmen
          oder Organisationen. Es wird unabhängig entwickelt und betrieben.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Haftungsausschluss</h2>
        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)' }}>Haftung für Inhalte</h3>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
          nach den allgemeinen Gesetzen verantwortlich.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Haftung für Links
        </h3>
        <p>
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich.
        </p>

        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-muted)', marginTop: 12 }}>
          Rechtsverletzungen
        </h3>
        <p>
          Falls Sie in unserem Angebot Rechtsverletzungen bemerken, bitten wir um einen entsprechenden
          Hinweis. Wir werden die beanstandeten Inhalte umgehend entfernen.
        </p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Datenschutz</h2>
        <p>
          Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich.
          Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder
          E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, auf Basis Ihrer Einwilligung.
          Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben. Bitte
          beachten Sie unsere <a href="/privacy" style={{ color: 'var(--primary)' }}>Datenschutzerklärung</a>.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text)' }}>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
          der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung
          des Autors oder Schöpfers. Downloads und Kopien dieser Seite sind nur für den privaten,
          nicht kommerziellen Gebrauch gestattet.
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
        Letzter Stand: Juli 2026. Wir behalten uns das Recht vor, diese Informationen jederzeit zu
        ändern.
      </div>
    </div>
  );
}
