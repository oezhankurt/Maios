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
    .content { color: #333; line-height: 1.6; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #5558e3; }
    .footer { border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
    .code { background: #f0f0f0; padding: 15px; border-radius: 4px; font-family: monospace; text-align: center; font-size: 18px; letter-spacing: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Maios</h1>
    </div>

    <div class="content">
      <p>Hallo ${data.username || data.email},</p>

      <p>vielen Dank für deine Registrierung bei Maios! Um dein Konto zu aktivieren, bestätige bitte deine E-Mail-Adresse.</p>

      <p style="text-align: center;">
        <a href="${data.verifyUrl}" class="button">E-Mail bestätigen</a>
      </p>

      <p>Oder verwende diesen Verifikationscode:</p>
      <div class="code">${data.token.substring(0, 8).toUpperCase()}</div>

      <p style="font-size: 14px; color: #666;">
        Wenn du dieses Konto nicht erstellt hast, ignoriere diese E-Mail.
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
