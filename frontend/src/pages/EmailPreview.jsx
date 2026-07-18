import { useState } from 'react';
import './EmailPreview.css';

export default function EmailPreview() {
  const [selectedEmail, setSelectedEmail] = useState('verification');

  const renderVerificationEmail = () => (
    <iframe
      srcDoc={`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a2347; margin: 0; font-size: 28px; }
    .content { color: #333; line-height: 1.6; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #5558e3; }
    .code { background: #f0f0f0; padding: 15px; border-radius: 4px; font-family: monospace; text-align: center; font-size: 18px; letter-spacing: 2px; margin: 20px 0; }
    .footer { border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Maios</h1>
    </div>

    <div class="content">
      <p>Hallo testuser,</p>

      <p>vielen Dank für deine Registrierung bei Maios! Um dein Konto zu aktivieren, bestätige bitte deine E-Mail-Adresse.</p>

      <p style="text-align: center;">
        <a href="#" class="button">E-Mail bestätigen</a>
      </p>

      <p>Oder verwende diesen Verifikationscode:</p>
      <div class="code">ABCD1234</div>

      <p style="font-size: 14px; color: #666;">
        Wenn du dieses Konto nicht erstellt hast, ignoriere diese E-Mail.
      </p>
    </div>

    <div class="footer">
      <p>&copy; 2026 Maios. Alle Rechte vorbehalten.</p>
      <p>Diese E-Mail wurde an test@example.com gesendet</p>
    </div>
  </div>
</body>
</html>
      `}
      style={{ width: '100%', minHeight: '600px', border: 'none' }}
      title="Email Verification Preview"
    />
  );

  const renderResetPasswordEmail = () => (
    <iframe
      srcDoc={`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a2347; margin: 0; font-size: 28px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .content { color: #333; line-height: 1.6; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #5558e3; }
    .warning { color: #d97706; font-weight: bold; }
    .footer { border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Passwort zurücksetzen</h1>
    </div>

    <div class="alert">
      <strong>Passwort-Zurücksetzen angefordert</strong>
      <p style="margin: 8px 0 0 0; font-size: 14px;">Wenn du dies nicht angefordert hast, ignoriere diese E-Mail.</p>
    </div>

    <div class="content">
      <p>Hallo testuser,</p>

      <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button unten, um dein Passwort zu ändern.</p>

      <p style="text-align: center;">
        <a href="#" class="button">Passwort zurücksetzen</a>
      </p>

      <p>Dieser Link ist <strong>24 Stunden gültig</strong>.</p>

      <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Wenn der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
        <p style="margin: 0; word-break: break-all; font-size: 12px; font-family: monospace; color: #333;">https://example.com/reset-password?token=xyz</p>
      </div>

      <p style="font-size: 14px;">
        <span class="warning">⚠️ Wichtig:</span> Teile diesen Link mit niemandem. Maios-Mitarbeiter werden dich niemals nach diesem Link fragen.
      </p>
    </div>

    <div class="footer">
      <p>&copy; 2026 Maios. Alle Rechte vorbehalten.</p>
      <p>Diese E-Mail wurde an test@example.com gesendet</p>
    </div>
  </div>
</body>
</html>
      `}
      style={{ width: '100%', minHeight: '600px', border: 'none' }}
      title="Email Reset Password Preview"
    />
  );

  const renderSecurityAlertEmail = () => (
    <iframe
      srcDoc={`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #dc2626; margin: 0; font-size: 28px; }
    .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .content { color: #333; line-height: 1.6; }
    .detail-box { background: #f9fafb; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #e5e7eb; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #374151; }
    .detail-value { color: #6b7280; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #b91c1c; }
    .footer { border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Sicherheitsmitteilung</h1>
    </div>

    <div class="alert">
      <strong>Ungewöhnliche Aktivität erkannt</strong>
      <p style="margin: 8px 0 0 0; font-size: 14px;">Eine verdächtige Anmeldung oder Aktivität wurde in deinem Konto erkannt.</p>
    </div>

    <div class="content">
      <p>Hallo testuser,</p>

      <p>wir haben eine verdächtige Aktivität in deinem Maios-Konto erkannt und möchten sicherstellen, dass du diesen Zugriff autorisiert hast.</p>

      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Aktion:</span>
          <span class="detail-value">Login</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Zeitstempel:</span>
          <span class="detail-value">16.07.2026, 10:30:00</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">IP-Adresse:</span>
          <span class="detail-value">192.168.1.1</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ort:</span>
          <span class="detail-value">Berlin, Deutschland</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gerät:</span>
          <span class="detail-value">Chrome on Windows</span>
        </div>
      </div>

      <p><strong>War das du?</strong></p>
      <p>Wenn diese Aktivität von dir stammt, kannst du diese E-Mail ignorieren. Wenn nicht, solltest du sofort dein Passwort ändern.</p>

      <p style="text-align: center;">
        <a href="#" class="button">Zum Sicherheitscenter</a>
      </p>

      <p style="font-size: 14px; background: #f0f0f0; padding: 15px; border-radius: 4px;">
        <strong>Empfehlungen:</strong>
        <ul style="margin: 10px 0;">
          <li>Ändere dein Passwort, wenn du diesen Zugriff nicht autorisiert hast</li>
          <li>Überprüfe deine aktiven Sitzungen</li>
          <li>Aktiviere Zwei-Faktor-Authentifizierung, falls nicht bereits aktiviert</li>
          <li>Kontaktiere den Support, wenn du dein Konto nicht erkennst</li>
        </ul>
      </p>
    </div>

    <div class="footer">
      <p>&copy; 2026 Maios. Alle Rechte vorbehalten.</p>
      <p>Diese E-Mail wurde an test@example.com gesendet</p>
      <p>Du erhältst diese E-Mail, um dein Konto zu schützen.</p>
    </div>
  </div>
</body>
</html>
      `}
      style={{ width: '100%', minHeight: '600px', border: 'none' }}
      title="Email Security Alert Preview"
    />
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>📧 Email-Vorschau</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedEmail('verification')}
          style={{
            padding: '10px 20px',
            background: selectedEmail === 'verification' ? '#6366f1' : '#2d3e5f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          📧 Verifizierung
        </button>
        <button
          onClick={() => setSelectedEmail('reset')}
          style={{
            padding: '10px 20px',
            background: selectedEmail === 'reset' ? '#6366f1' : '#2d3e5f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          🔐 Passwort-Reset
        </button>
        <button
          onClick={() => setSelectedEmail('security')}
          style={{
            padding: '10px 20px',
            background: selectedEmail === 'security' ? '#6366f1' : '#2d3e5f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          🚨 Sicherheitsalert
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        {selectedEmail === 'verification' && renderVerificationEmail()}
        {selectedEmail === 'reset' && renderResetPasswordEmail()}
        {selectedEmail === 'security' && renderSecurityAlertEmail()}
      </div>
    </div>
  );
}
