import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthAPI } from '../api/api';
import './Settings.css';

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
        <h1>Einstellungen</h1>
      </div>

      {message && <div className="error-banner" style={{ borderColor: 'var(--success)', color: 'var(--success)', background: 'rgba(34,197,94,0.12)' }}>{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title">Abonnement & Billing</div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700 }}>Professional Plan</span>
              <span style={{ marginLeft: 12, color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>
                ✓ Aktiv
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              €99/Monat • Automatische Verlängerung
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
              Nächste Abrechnung: 15. August 2026
            </p>
          </div>
          <button className="btn btn-primary">Plan verwalten</button>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Konto</div>
          <div className="field">
            <label>Benutzername</label>
            <input className="input" value={user?.username || ''} disabled />
          </div>
          <div className="field">
            <label>E-Mail</label>
            <input className="input" value={user?.email || ''} disabled />
          </div>
          <div className="field">
            <label>Status</label>
            <span className="badge badge-success">{user?.status === 'active' ? 'Aktiv' : 'Inaktiv'}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Einstellungen</div>
          <div className="field">
            <label>Währung</label>
            <select className="select" value={prefs.currency} onChange={setP('currency')}>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="field">
            <label>Zeitzone</label>
            <select className="select" value={prefs.timezone} onChange={setP('timezone')}>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
          <div className="field">
            <label>Sprache</label>
            <select className="select" value={prefs.language} onChange={setP('language')}>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <p className="text-muted" style={{ fontSize: 12 }}>
            Anzeigeeinstellungen werden lokal in dieser Sitzung angewendet.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, maxWidth: 640 }}>
        <div className="card-title">Amazon-Verbindung</div>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Verbinde deine Amazon SP-API / Advertising API-Anmeldedaten, um Live-Verkaufs- und PPC-Daten zu synchronisieren.
          {user?.amazonSellerId && (
            <span className="badge badge-success" style={{ marginLeft: 8 }}>
              Verbunden: {user.amazonSellerId}
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
            {connecting ? 'Verbindung wird hergestellt…' : 'Amazon verbinden'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, marginBottom: 20 }}>Verfügbare Pläne</h2>
        <div className="grid grid-3">
          {[
            { name: 'Starter', price: '€29', features: ['Bis zu 5 Produkte', 'Black Box Research', 'Basis Keyword Tools', 'Email Support'] },
            { name: 'Professional', price: '€99', features: ['Unbegrenzte Produkte', 'Alle Research Tools', 'Cerebro Reverse-ASIN', 'Smart Portfolios', 'Priority Support'], active: true },
            { name: 'Enterprise', price: 'Kontakt', features: ['Custom Setup', 'Dedicated Account Manager', 'API Zugang', 'White Label Option'] },
          ].map((plan) => (
            <div key={plan.name} className="card" style={{ position: 'relative', borderColor: plan.active ? 'var(--primary)' : 'var(--border)' }}>
              {plan.active && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--success)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  Aktuell
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 16 }}>
                {plan.price}
                {plan.price !== 'Kontakt' && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/Monat</span>}
              </div>
              <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
                {plan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              <button className={`btn ${plan.active ? '' : 'btn-primary'}`} style={{ width: '100%' }}>
                {plan.active ? 'Aktueller Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
