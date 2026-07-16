import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('Kein Token vorhanden');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Verifizierung fehlgeschlagen');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>
          Ma<span style={{ color: 'var(--primary)' }}>ios</span>
        </h1>
        <p className="auth-sub">E-Mail-Verifizierung</p>

        {loading && <div className="info-banner">Verifizierung läuft...</div>}

        {message && <div className="success-banner">{message}</div>}

        {error && <div className="error-banner">{error}</div>}

        {!loading && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>
              {error ? (
                <>
                  <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    Zur Anmeldung
                  </a>
                </>
              ) : (
                'Sie werden weitergeleitet...'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
