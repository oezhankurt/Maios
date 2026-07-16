export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">Maios</div>
          <p className="footer-desc">Amazon Seller Analytics Plattform</p>
        </div>

        <div className="footer-section">
          <div className="footer-title">Rechtliches</div>
          <ul className="footer-links">
            <li>
              <a href="/impressum">Impressum</a>
            </li>
            <li>
              <a href="/privacy">Datenschutz</a>
            </li>
            <li>
              <a href="/terms">AGB</a>
            </li>
            <li>
              <a href="/faq">FAQ</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <div className="footer-title">Support</div>
          <ul className="footer-links">
            <li>
              <a href="mailto:support@maios.de">support@maios.de</a>
            </li>
            <li>
              <a href="mailto:info@maios.de">info@maios.de</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <div className="footer-title">Verbindungen</div>
          <ul className="footer-links">
            <li>
              <a href="#" title="Twitter">
                𝕏
              </a>
            </li>
            <li>
              <a href="#" title="LinkedIn">
                in
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 AscopharmGmbH. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}
