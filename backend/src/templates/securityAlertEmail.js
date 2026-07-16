module.exports = (data) => `
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
      <p>Hallo ${data.username || data.email},</p>

      <p>wir haben eine verdächtige Aktivität in deinem Maios-Konto erkannt und möchten sicherstellen, dass du diesen Zugriff autorisiert hast.</p>

      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Aktion:</span>
          <span class="detail-value">${data.action || 'Login'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Zeitstempel:</span>
          <span class="detail-value">${data.timestamp || new Date().toLocaleString('de-DE')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">IP-Adresse:</span>
          <span class="detail-value">${data.ipAddress || 'Unbekannt'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ort:</span>
          <span class="detail-value">${data.location || 'Unbekannt'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gerät:</span>
          <span class="detail-value">${data.device || 'Unbekannt'}</span>
        </div>
      </div>

      <p><strong>War das du?</strong></p>
      <p>Wenn diese Aktivität von dir stammt, kannst du diese E-Mail ignorieren. Wenn nicht, solltest du sofort dein Passwort ändern.</p>

      <p style="text-align: center;">
        <a href="${data.accountUrl}" class="button">Zum Sicherheitscenter</a>
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
      <p>&copy; ${new Date().getFullYear()} Maios. Alle Rechte vorbehalten.</p>
      <p>Diese E-Mail wurde an ${data.email} gesendet</p>
      <p>Du erhältst diese E-Mail, um dein Konto zu schützen.</p>
    </div>
  </div>
</body>
</html>
`;
