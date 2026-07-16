/** Opportunity ("P-Index") bar, 0-100 — green = strong opportunity. */
function color(v) {
  if (v >= 70) return '#22c55e';
  if (v >= 45) return '#f59e0b';
  return '#ef4444';
}

export default function PIndex({ value }) {
  return (
    <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
      <div style={{ width: 46, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color(value) }} />
      </div>
      <strong style={{ color: color(value), width: 24, textAlign: 'right' }}>{value}</strong>
    </div>
  );
}
