import { useEffect, useState } from 'react';
import { ProductAPI } from '../../api/api';
import { number } from '../../utils/format';

const SEV = { warning: 'badge-warning', info: 'badge-info' };

function scoreColor(s) {
  if (s >= 75) return '#22c55e';
  if (s >= 50) return '#f59e0b';
  return '#ef4444';
}

/**
 * Listing-Score & Keyword-Gap panel: how well the product's keywords are
 * covered by its listing, and which high-value keywords are missing.
 */
export default function ListingAnalysis({ product }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) return;
    setLoading(true);
    ProductAPI.listingAnalysis(product.id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [product?.id]);

  if (!product) return null;
  if (loading) return <div className="card"><div className="text-muted">Analysiere Listing…</div></div>;
  if (!data) return null;

  const color = scoreColor(data.score);

  return (
    <div className="card">
      <div className="row between mb-2" style={{ alignItems: 'flex-start' }}>
        <div className="card-title" style={{ margin: 0 }}>Listing-Score & Keyword-Gap</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{data.score}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>von 100</div>
        </div>
      </div>

      <div className="row" style={{ gap: 16, fontSize: 13, marginBottom: 12 }}>
        <span className="text-muted">{data.coveredCount}/{data.totalKeywords} Keywords abgedeckt</span>
        <span className="text-muted">Gap: {data.gapCount}</span>
      </div>

      {data.titleGap.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="card-title">Sollten in den Titel</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {data.titleGap.map((g) => (
              <span key={g.keyword} className="badge badge-warning">
                {g.keyword} · {number(g.searchVolume)}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.gap.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="card-title">Fehlende Keywords (nach Volumen)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {data.gap.map((g) => (
              <span key={g.keyword} className="badge badge-muted">
                {g.keyword} · {number(g.searchVolume)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card-title">Empfehlungen</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.recommendations.map((r, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 11px' }}>
            <div className="row between">
              <span style={{ fontWeight: 600 }}>{r.title}</span>
              <span className={`badge ${SEV[r.severity] || 'badge-muted'}`}>{r.severity}</span>
            </div>
            <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{r.detail}</div>
            <div style={{ fontSize: 13, marginTop: 5, color: 'var(--primary)', fontWeight: 600 }}>→ {r.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
