import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthAPI } from '../api/api';

export default function Settings() {
  const { user, refresh } = useAuthStore();
  const [amazon, setAmazon] = useState({ refreshToken: '', clientId: '', clientSecret: '', sellerId: '' });
  const [prefs, setPrefs] = useState({
    currency: user?.currency || 'EUR',
    timezone: user?.timezone || 'Europe/Berlin',
    language: user?.language || 'en',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    setError(null);
    setMessage(null);
    try {
      await AuthAPI.amazonConnect(amazon);
      setMessage('Amazon account connected successfully.');
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const setA = (k) => (e) => setAmazon({ ...amazon, [k]: e.target.value });
  const setP = (k) => (e) => setPrefs({ ...prefs, [k]: e.target.value });

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {message && <div className="error-banner" style={{ borderColor: 'var(--success)', color: 'var(--success)', background: 'rgba(34,197,94,0.12)' }}>{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Account</div>
          <div className="field">
            <label>Username</label>
            <input className="input" value={user?.username || ''} disabled />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={user?.email || ''} disabled />
          </div>
          <div className="field">
            <label>Status</label>
            <span className="badge badge-success">{user?.status}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Preferences</div>
          <div className="field">
            <label>Currency</label>
            <select className="select" value={prefs.currency} onChange={setP('currency')}>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="field">
            <label>Timezone</label>
            <select className="select" value={prefs.timezone} onChange={setP('timezone')}>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
          <div className="field">
            <label>Language</label>
            <select className="select" value={prefs.language} onChange={setP('language')}>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <p className="text-muted" style={{ fontSize: 12 }}>
            Display preferences are applied locally in this session.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, maxWidth: 640 }}>
        <div className="card-title">Amazon Connection</div>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Connect your Amazon SP-API / Advertising API credentials to sync live sales and PPC data.
          {user?.amazonSellerId && (
            <span className="badge badge-success" style={{ marginLeft: 8 }}>
              Connected: {user.amazonSellerId}
            </span>
          )}
        </p>
        <form onSubmit={connect}>
          <div className="field">
            <label>Refresh Token</label>
            <input className="input" value={amazon.refreshToken} onChange={setA('refreshToken')} required />
          </div>
          <div className="row" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Client ID</label>
              <input className="input" value={amazon.clientId} onChange={setA('clientId')} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Client Secret</label>
              <input className="input" type="password" value={amazon.clientSecret} onChange={setA('clientSecret')} />
            </div>
          </div>
          <div className="field">
            <label>Seller ID</label>
            <input className="input" value={amazon.sellerId} onChange={setA('sellerId')} />
          </div>
          <button className="btn btn-primary" disabled={connecting}>
            {connecting ? 'Connecting…' : 'Connect Amazon'}
          </button>
        </form>
      </div>
    </div>
  );
}
