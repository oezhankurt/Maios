export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-center">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <div className="text-muted">{label}</div>
      </div>
    </div>
  );
}
