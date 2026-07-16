import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/send-password-reset', { email });
      setMessage(response.data.message);
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Anfrage fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>
          Ma<span style={{ color: 'var(--primary)' }}>ios</span>
        </h1>
        <p className="auth-sub">Passwort zurücksetzen</p>

        {error && <div className="error-banner">{error}</div>}

        {message && <div className="success-banner">{message}</div>}

        {!submitted ? (
          <>
            <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </p>

            <form onSubmit={submit}>
              <div className="field">
                <label>E-Mail-Adresse</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Wird gesendet…' : 'Passwort-Reset anfordern'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>
              Wenn ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie einen Link zum Zurücksetzen des
              Passworts.
            </p>
          </div>
        )}

        <p className="auth-switch">
          <Link to="/login">Zurück zur Anmeldung</Link>
        </p>
      </div>
    </div>
  );
}
