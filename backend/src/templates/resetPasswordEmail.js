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
      <p>Hallo ${data.username || data.email},</p>

      <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button unten, um dein Passwort zu ändern.</p>

      <p style="text-align: center;">
        <a href="${data.resetUrl}" class="button">Passwort zurücksetzen</a>
      </p>

      <p>Dieser Link ist <strong>24 Stunden gültig</strong>.</p>

      <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Wenn der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
        <p style="margin: 0; word-break: break-all; font-size: 12px; font-family: monospace; color: #333;">${data.resetUrl}</p>
      </div>

      <p style="font-size: 14px;">
        <span class="warning">⚠️ Wichtig:</span> Teile diesen Link mit niemandem. Maios-Mitarbeiter werden dich niemals nach diesem Link fragen.
      </p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Maios. Alle Rechte vorbehalten.</p>
      <p>Diese E-Mail wurde an ${data.email} gesendet</p>
    </div>
  </div>
</body>
</html>
`;
