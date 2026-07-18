import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import './ResetPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const token = searchParams.get('token');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      const msg = 'Kein Token vorhanden';
      setError(msg);
      showError(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Passwörter stimmen nicht überein';
      setError(msg);
      showError(msg);
      return;
    }

    if (newPassword.length < 8) {
      const msg = 'Passwort muss mindestens 8 Zeichen lang sein';
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(response.data.message);
      showSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Passwort-Reset fehlgeschlagen';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-wrap">
        <div className="card auth-card">
          <h1>
            Ma<span style={{ color: 'var(--primary)' }}>ios</span>
          </h1>
          <p className="auth-sub">Passwort zurücksetzen</p>
          <div className="error-banner">Kein Token vorhanden. Bitte verwenden Sie den Link aus der E-Mail.</div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Zur Anmeldung
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>
          Ma<span style={{ color: 'var(--primary)' }}>ios</span>
        </h1>
        <p className="auth-sub">Neues Passwort festlegen</p>

        {error && <div className="error-banner">{error}</div>}

        {message && <div className="success-banner">{message}</div>}

        {!message && (
          <form onSubmit={submit}>
            <div className="field">
              <label>Neues Passwort</label>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-light)', marginTop: '5px', display: 'block' }}>
                Mindestens 8 Zeichen, Großbuchstaben, Kleinbuchstaben, Zahlen und Sonderzeichen
              </small>
            </div>
            <div className="field">
              <label>Passwort bestätigen</label>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Wird zurückgesetzt…' : 'Passwort zurücksetzen'}
            </button>
          </form>
        )}

        {message && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Sie werden weitergeleitet...</p>
          </div>
        )}
      </div>
    </div>
  );
}
