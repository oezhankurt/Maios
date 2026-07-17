import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';

export default function TwoFactorSettings() {
  const { success: showSuccess, error: showError } = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('status'); // status, setup, verify, backup
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get('/auth/2fa/status');
      setStatus(res.data.data);
      setLoading(false);
    } catch (err) {
      showError('Fehler beim Laden des 2FA-Status');
      setLoading(false);
    }
  };

  const handleInitiate = async () => {
    try {
      const res = await api.post('/auth/2fa/initiate');
      setQrCode(res.data.data.qrCode);
      setSecret(res.data.data.secret);
      setStep('setup');
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Fehler beim Initialisieren');
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/2fa/enable', {
        secret,
        token: code,
      });
      setBackupCodes(res.data.data.backupCodes);
      setStep('backup');
      await loadStatus();
    } catch (err) {
      showError(err.response?.data?.error?.message || '2FA-Aktivierung fehlgeschlagen');
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/2fa/disable', { password });
      showSuccess('2FA deaktiviert');
      setStep('status');
      setPassword('');
      await loadStatus();
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Fehler beim Deaktivieren');
    }
  };

  const handleRegenerateBackupCodes = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/2fa/regenerate-backup-codes', { password });
      setBackupCodes(res.data.data.backupCodes);
      setPassword('');
      showSuccess('Backup-Codes regeneriert');
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Fehler beim Regenerieren');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Wird geladen...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>🔐 Zwei-Faktor-Authentifizierung</h2>

      {step === 'status' && (
        <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
          {status?.enabled ? (
            <>
              <p style={{ color: '#10b981', fontWeight: 'bold' }}>✓ 2FA ist aktiviert</p>
              <small style={{ color: '#8b94a8' }}>
                Backup-Codes verfügbar: {status.backupCodesRemaining}
              </small>
              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setPassword('');
                    setStep('disable');
                  }}
                >
                  2FA deaktivieren
                </button>
                {status.backupCodesRemaining < 3 && (
                  <button
                    className="btn"
                    style={{ marginLeft: '10px', background: '#f59e0b', color: 'white' }}
                    onClick={() => setStep('regenerate')}
                  >
                    Backup-Codes erneuern
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p style={{ color: '#8b94a8', marginBottom: '20px' }}>
                Aktivieren Sie 2FA, um Ihr Konto zusätzlich zu schützen.
              </p>
              <button className="btn btn-primary" onClick={handleInitiate}>
                2FA aktivieren
              </button>
            </>
          )}
        </div>
      )}

      {step === 'setup' && (
        <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
          <h3>Schritt 1: Authenticator-App scannen</h3>
          <p style={{ color: '#8b94a8', marginBottom: '20px' }}>
            Verwenden Sie Google Authenticator, Microsoft Authenticator oder Authy:
          </p>
          {qrCode && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={qrCode} alt="2FA QR-Code" style={{ maxWidth: '250px' }} />
            </div>
          )}
          <p style={{ color: '#8b94a8', fontSize: '12px', marginBottom: '20px' }}>
            Oder manuell eingeben: <code>{secret}</code>
          </p>

          <h3>Schritt 2: Code eingeben</h3>
          <form onSubmit={handleEnable}>
            <div className="field">
              <label>6-stelliger Code aus der App</label>
              <input
                className="input"
                type="text"
                maxLength="6"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Verifizieren & Aktivieren
            </button>
          </form>
        </div>
      )}

      {step === 'backup' && (
        <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#f59e0b' }}>⚠️ Backup-Codes speichern</h3>
          <p style={{ color: '#8b94a8', marginBottom: '20px' }}>
            Speichern Sie diese Codes an einem sicheren Ort. Sie können diese verwenden, wenn Sie Ihr
            Telefon verlieren:
          </p>
          <div
            style={{
              background: '#0a0e27',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              marginBottom: '20px',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            {backupCodes.map((code, i) => (
              <div key={i} style={{ padding: '5px 0' }}>
                {code}
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={async () => {
              await navigator.clipboard.writeText(backupCodes.join('\n'));
              showSuccess('Codes kopiert');
            }}
          >
            Codes kopieren
          </button>
          <button
            className="btn"
            style={{ width: '100%', marginTop: '10px', background: '#6366f1' }}
            onClick={() => {
              setStep('status');
              setQrCode('');
              setSecret('');
              setCode('');
              setBackupCodes([]);
            }}
          >
            Fertig
          </button>
        </div>
      )}

      {step === 'disable' && (
        <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#f43f5e' }}>2FA deaktivieren?</h3>
          <p style={{ color: '#8b94a8', marginBottom: '20px' }}>
            Geben Sie Ihr Passwort ein, um 2FA zu deaktivieren:
          </p>
          <form onSubmit={handleDisable}>
            <div className="field">
              <label>Passwort</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-danger" style={{ width: '100%' }}>
              Deaktivieren
            </button>
            <button
              className="btn"
              style={{ width: '100%', marginTop: '10px', background: '#6366f1' }}
              onClick={() => {
                setStep('status');
                setPassword('');
              }}
            >
              Abbrechen
            </button>
          </form>
        </div>
      )}

      {step === 'regenerate' && (
        <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
          <h3>Backup-Codes erneuern</h3>
          <p style={{ color: '#8b94a8', marginBottom: '20px' }}>
            Geben Sie Ihr Passwort ein, um neue Backup-Codes zu generieren:
          </p>
          <form onSubmit={handleRegenerateBackupCodes}>
            <div className="field">
              <label>Passwort</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Neue Codes generieren
            </button>
            <button
              className="btn"
              style={{ width: '100%', marginTop: '10px', background: '#6366f1' }}
              onClick={() => {
                setStep('status');
                setPassword('');
              }}
            >
              Abbrechen
            </button>
          </form>
          {backupCodes.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>Neue Codes:</h4>
              <div
                style={{
                  background: '#0a0e27',
                  padding: '15px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                {backupCodes.map((code, i) => (
                  <div key={i} style={{ padding: '5px 0' }}>
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
