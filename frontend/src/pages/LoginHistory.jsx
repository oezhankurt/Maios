import { useState, useEffect } from 'react';
import { AuthAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import './LoginHistory.css';

export default function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await AuthAPI.getLoginHistory({ limit, offset });
        setHistory(result.history || []);
        setTotal(result.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [offset, limit]);

  const handlePrevious = () => {
    if (offset > 0) setOffset(Math.max(0, offset - limit));
  };

  const handleNext = () => {
    if (offset + limit < total) setOffset(offset + limit);
  };

  if (loading) return <Loading label="Login-Verlauf wird geladen..." />;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const eventLabel = (event) => {
    return event === 'login' ? '🔓 Anmeldung' : '🔒 Abmeldung';
  };

  const eventColor = (event) => {
    return event === 'login' ? 'var(--success)' : 'var(--warning)';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: 20 }}>Login & Logout Verlauf</h1>

      {history.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            Keine Login-Aktivitäten vorhanden
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Datum & Uhrzeit</th>
                    <th>Aktion</th>
                    <th>IP-Adresse</th>
                    <th>Browser / Gerät</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{formatDate(entry.timestamp)}</td>
                      <td>
                        <span style={{ color: eventColor(entry.event), fontWeight: 600 }}>
                          {eventLabel(entry.event)}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                        {entry.ipAddress || '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {entry.userAgent ? extractBrowserInfo(entry.userAgent) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {total > limit && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <button
                onClick={handlePrevious}
                disabled={offset === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  cursor: offset === 0 ? 'not-allowed' : 'pointer',
                  opacity: offset === 0 ? 0.5 : 1,
                }}
              >
                ← Vorherige
              </button>

              <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                {offset + 1}–{Math.min(offset + limit, total)} von {total}
              </span>

              <button
                onClick={handleNext}
                disabled={offset + limit >= total}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  cursor: offset + limit >= total ? 'not-allowed' : 'pointer',
                  opacity: offset + limit >= total ? 0.5 : 1,
                }}
              >
                Nächste →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function extractBrowserInfo(userAgent) {
  if (!userAgent) return '—';
  let browser = 'Unknown';
  let os = 'Unknown';

  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('iPhone')) os = 'iOS';
  else if (userAgent.includes('Android')) os = 'Android';

  return `${browser} / ${os}`;
}
