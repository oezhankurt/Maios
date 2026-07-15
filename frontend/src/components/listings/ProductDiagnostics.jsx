import { useEffect, useState } from 'react';
import { ProductAPI } from '../../api/api';
import { currency, number, percent } from '../../utils/format';

const SEV_BADGE = { critical: 'badge-danger', warning: 'badge-warning', info: 'badge-info', ok: 'badge-success' };
const CAT_ICON = {
  inventory: '📦', price: '🏷️', ppc: '🎯', visibility: '🔎', sales: '📉',
  listing: '📝', seo: '🔑', profit: '💰', ok: '✅',
};

function scoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function Signal({ label, value }) {
  return (
    <div className="row between" style={{ padding: '4px 0', fontSize: 13 }}>
      <span className="text-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/**
 * Per-product diagnostic panel: a health score, a one-line headline diagnosis,
 * the key signals, and a prioritised list of concrete recommendations.
 */
export default function ProductDiagnostics({ productId, ccy = 'EUR' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    ProductAPI.analysis(productId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;
  if (loading) return <div className="card"><div className="text-muted">Analysiere Produkt…</div></div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return null;

  const { healthScore, diagnosis, signals: s, recommendations } = data;
  const color = scoreColor(healthScore);

  return (
    <div className="card">
      <div className="row between mb-2" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="card-title" style={{ margin: 0 }}>Produkt-Diagnose</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{diagnosis.headline}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{healthScore}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>Health-Score</div>
        </div>
      </div>

      {/* Signals */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: 14 }}>
        <Signal label="Umsatz (30T)" value={currency(s.revenue30, ccy)} />
        <Signal label="Gewinn (30T)" value={currency(s.profit30, ccy)} />
        <Signal label="Marge" value={percent(s.margin)} />
        <Signal label="Einheiten (30T)" value={number(s.units30)} />
        <Signal label="Trend (7T)" value={s.salesTrendPct != null ? percent(s.salesTrendPct) : '—'} />
        <Signal label="ACoS" value={s.ppcSpend > 0 ? percent(s.acos) : '—'} />
        <Signal label="Retouren" value={percent(s.refundRate)} />
        <Signal label="Lager-Reichweite" value={s.daysCover != null ? `${s.daysCover} T` : '—'} />
      </div>

      {/* Recommendations */}
      <div className="card-title">Empfohlene Maßnahmen</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recommendations.map((r, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div className="row between">
              <span style={{ fontWeight: 600 }}>
                {CAT_ICON[r.category] || '•'} {r.title}
              </span>
              <span className={`badge ${SEV_BADGE[r.severity] || 'badge-muted'}`}>{r.severity}</span>
            </div>
            <div className="text-muted" style={{ fontSize: 13, marginTop: 5 }}>{r.detail}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>→ {r.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
