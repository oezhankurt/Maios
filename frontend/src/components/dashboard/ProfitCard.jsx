import { currency, number } from '../../utils/format';

export default function ProfitCard({ label, profit, revenue, units, ccy = 'EUR', accent = 'var(--primary)' }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="card-title">{label}</div>
      <div className="stat-value" style={{ color: accent }}>
        {currency(profit, ccy)}
      </div>
      <div className="row between mt-2" style={{ fontSize: 13 }}>
        <span className="text-muted">Revenue {currency(revenue, ccy)}</span>
        <span className="text-muted">{number(units)} units</span>
      </div>
    </div>
  );
}
