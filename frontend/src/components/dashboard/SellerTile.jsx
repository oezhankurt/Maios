import { currency, number } from '../../utils/format';

// A sellerboard-style comparison delta. For most metrics up = good; for
// refunds more is bad, so pass invert to flip the colour.
function Delta({ value, invert = false }) {
  if (value == null) return null;
  const good = invert ? value < 0 : value >= 0;
  const cls = value === 0 ? 'badge-muted' : good ? 'badge-success' : 'badge-danger';
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '';
  return (
    <span className={`badge ${cls}`} style={{ fontSize: 11, padding: '2px 7px' }}>
      {arrow} {Math.abs(value)}%
    </span>
  );
}

function Row({ label, value, delta, invert }) {
  return (
    <div className="row between" style={{ padding: '5px 0', fontSize: 13 }}>
      <span className="text-muted">{label}</span>
      <span className="row" style={{ gap: 8 }}>
        <Delta value={delta} invert={invert} />
        <strong>{value}</strong>
      </span>
    </div>
  );
}

/**
 * One dashboard tile (Heute / Gestern / Monat / Prognose / Letzter Monat).
 * Mirrors sellerboard's tile: Umsatz, Einheiten, Erstattungen, Gewinn — each
 * with a percentage delta versus the comparison period.
 */
export default function SellerTile({ title, subtitle, tile, ccy = 'EUR', accent = 'var(--primary)' }) {
  if (!tile) return null;
  return (
    <div className="card" style={{ borderTop: `3px solid ${accent}`, minWidth: 0 }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      {subtitle && (
        <div className="text-muted" style={{ fontSize: 11, marginBottom: 8 }}>
          {subtitle}
        </div>
      )}
      <Row label="Umsatz" value={currency(tile.revenue, ccy)} delta={tile.delta?.revenue} />
      <Row label="Einheiten" value={number(tile.units)} delta={tile.delta?.units} />
      <Row label="Erstattungen" value={number(tile.refunds)} delta={tile.delta?.refunds} invert />
      <div
        style={{ padding: '8px 0 0', borderTop: '1px solid var(--border)', marginTop: 6 }}
      >
        <div className="row between">
          <span style={{ fontWeight: 600 }}>Gewinn</span>
          <Delta value={tile.delta?.profit} />
        </div>
        <div style={{ color: accent, fontSize: 20, fontWeight: 800, marginTop: 2 }}>
          {currency(tile.profit, ccy)}
        </div>
      </div>
    </div>
  );
}
