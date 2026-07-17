import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import './Pricing.css';

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('overview');
  const [rules, setRules] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedProduct]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, statsRes, productsRes] = await Promise.all([
        api.get('/repricing', { params: selectedProduct ? { productId: selectedProduct } : {} }),
        api.get('/repricing/stats/overview', { params: selectedProduct ? { productId: selectedProduct } : {} }),
        api.get('/products', { params: { limit: 100 } }),
      ]);

      setRules(rulesRes.data || []);
      setStats(statsRes.data || {});
      setProducts(productsRes.data || []);

      if (selectedProduct) {
        const historyRes = await api.get(`/repricing/${selectedProduct}/history`, { params: { days: 30 } });
        setPriceHistory(historyRes.data || []);
      }
    } catch (err) {
      showError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await api.post('/repricing', {
        productId: selectedProduct,
        name: formData.get('name'),
        strategy: formData.get('strategy'),
        minPrice: parseFloat(formData.get('minPrice')),
        maxPrice: parseFloat(formData.get('maxPrice')),
        config: {
          targetMargin: formData.get('targetMargin'),
          undercutPercent: formData.get('undercutPercent'),
          salesThreshold: formData.get('salesThreshold'),
        },
      });
      showSuccess('Repricing-Regel erstellt!');
      e.target.reset();
      fetchData();
    } catch (err) {
      showError('Fehler beim Erstellen der Regel');
    }
  };

  const handleApplyRule = async (ruleId) => {
    try {
      await api.post(`/repricing/${ruleId}/apply`);
      showSuccess('Regel angewendet!');
      fetchData();
    } catch (err) {
      showError('Fehler beim Anwenden der Regel');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (confirm('Regel wirklich löschen?')) {
      try {
        await api.delete(`/repricing/${ruleId}`);
        showSuccess('Regel gelöscht!');
        fetchData();
      } catch (err) {
        showError('Fehler beim Löschen der Regel');
      }
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>💰 Pricing Intelligence</h1>
        <p>Automatische Preisoptimierung & Repricing</p>
      </div>

      {/* Product Selector */}
      <div className="product-selector">
        <select
          value={selectedProduct || ''}
          onChange={(e) => setSelectedProduct(e.target.value || null)}
          className="product-select"
        >
          <option value="">Alle Produkte</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.productName}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="pricing-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Übersicht
        </button>
        <button
          className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          ⚙️ Repricing-Regeln
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📈 Preishistorie
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="pricing-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Regeln gesamt</div>
              <div className="stat-value">{stats?.totalRules || 0}</div>
            </div>
            <div className="stat-card active">
              <div className="stat-label">Aktiv</div>
              <div className="stat-value">{stats?.activeRules || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Angewandt</div>
              <div className="stat-value">{stats?.totalApplied || 0}</div>
            </div>
          </div>

          <div className="strategies-card">
            <h3>Strategien</h3>
            <div className="strategies-list">
              {stats?.strategies && Object.entries(stats.strategies).map(([strategy, count]) => (
                <div key={strategy} className="strategy-item">
                  <span>{strategy}</span>
                  <span className="badge">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="pricing-rules">
          <div className="rules-form-card">
            <h3>🆕 Neue Repricing-Regel</h3>
            <form onSubmit={handleCreateRule} className="rules-form">
              <div className="form-row">
                <input
                  name="name"
                  placeholder="Regelname"
                  required
                  className="form-input"
                />
                <select name="strategy" required className="form-select">
                  <option value="">Strategie wählen</option>
                  <option value="margin-based">📊 Margin-Basis</option>
                  <option value="competitor-based">🏆 Wettbewerb</option>
                  <option value="sales-based">📈 Verkäufe</option>
                  <option value="time-based">⏰ Tageszeit</option>
                </select>
              </div>

              <div className="form-row">
                <input
                  name="minPrice"
                  type="number"
                  step="0.01"
                  placeholder="Mindestpreis"
                  required
                  className="form-input"
                />
                <input
                  name="maxPrice"
                  type="number"
                  step="0.01"
                  placeholder="Höchstpreis"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <input
                  name="targetMargin"
                  type="number"
                  placeholder="Zielgewinn (%)"
                  className="form-input"
                />
                <input
                  name="undercutPercent"
                  type="number"
                  placeholder="Unterbieten (%)"
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                ✨ Regel erstellen
              </button>
            </form>
          </div>

          <div className="rules-list">
            <h3>📋 Aktive Regeln</h3>
            {rules.length === 0 ? (
              <p className="empty-state">Keine Regeln vorhanden</p>
            ) : (
              rules.map(rule => (
                <div key={rule.id} className="rule-card">
                  <div className="rule-header">
                    <h4>{rule.name}</h4>
                    <span className={`badge ${rule.isActive ? 'active' : 'inactive'}`}>
                      {rule.isActive ? '✓ Aktiv' : '○ Inaktiv'}
                    </span>
                  </div>
                  <div className="rule-details">
                    <div className="detail">
                      <span className="label">Strategie:</span>
                      <span className="value">{rule.strategy}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Preis:</span>
                      <span className="value">€{rule.minPrice} - €{rule.maxPrice}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Angewandt:</span>
                      <span className="value">{rule.appliedCount}x</span>
                    </div>
                  </div>
                  <div className="rule-actions">
                    <button
                      onClick={() => handleApplyRule(rule.id)}
                      className="btn-small btn-success"
                    >
                      ▶ Jetzt anwenden
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="btn-small btn-danger"
                    >
                      🗑 Löschen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="pricing-history">
          <div className="chart-container">
            <h3>📈 Preishistorie (30 Tage)</h3>
            {priceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="createdAt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#667eea"
                    dot={false}
                    name="Dein Preis"
                  />
                  <Line
                    type="monotone"
                    dataKey="competitorPrice"
                    stroke="#f093fb"
                    dot={false}
                    name="Wettbewerber"
                  />
                  <Line
                    type="monotone"
                    dataKey="buyBoxPrice"
                    stroke="#4caf50"
                    dot={false}
                    name="BuyBox"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="empty-state">Keine Daten verfügbar</p>
            )}
          </div>

          <div className="history-table">
            <h3>📊 Preisänderungen</h3>
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Preis</th>
                  <th>Quelle</th>
                  <th>Wettbewerb</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map(entry => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleDateString('de-DE')}</td>
                    <td className="price">€{parseFloat(entry.price).toFixed(2)}</td>
                    <td><span className="badge">{entry.source}</span></td>
                    <td>€{entry.competitorPrice ? parseFloat(entry.competitorPrice).toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
