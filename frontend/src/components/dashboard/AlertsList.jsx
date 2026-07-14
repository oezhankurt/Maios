const SEVERITY_BADGE = {
  info: 'badge-info',
  warning: 'badge-warning',
  critical: 'badge-danger',
};

export default function AlertsList({ alerts = [], onDismiss }) {
  return (
    <div className="card">
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>
          Active Alerts
        </div>
        <span className="badge badge-muted">{alerts.length}</span>
      </div>

      {alerts.length === 0 ? (
        <div className="empty" style={{ padding: 24 }}>
          No active alerts 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map((a) => (
            <div
              key={a.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              <div className="row between">
                <span className={`badge ${SEVERITY_BADGE[a.severity] || 'badge-muted'}`}>
                  {a.severity}
                </span>
                {onDismiss && (
                  <button className="btn btn-sm" onClick={() => onDismiss(a.id)}>
                    Dismiss
                  </button>
                )}
              </div>
              <div style={{ fontWeight: 600, marginTop: 8 }}>{a.title}</div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                {a.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
