export default function GoogleAdsBudget({ budget }) {
  if (!budget) return <div className="empty">Kein Budget verfügbar</div>;

  const utilisationRate = ((budget.allocated / budget.totalBudget) * 100).toFixed(1);

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="stat-label">Gesamtbudget</div>
          <div className="stat-value">€{budget.totalBudget}</div>
        </div>
        <div className="card">
          <div className="stat-label">Zugeordnet</div>
          <div className="stat-value">€{budget.allocated}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{utilisationRate}%</div>
        </div>
        <div className="card">
          <div className="stat-label">Verfügbar</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>€{budget.available}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Budget-Verteilung nach Kampagne</div>
        <div style={{ display: 'grid', gap: 16 }}>
          {budget.campaigns.map((camp, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{camp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>€{camp.budget} • ROAS {camp.roas}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 600 }}>{camp.allocation}</div>
              </div>
              <div style={{ height: 12, backgroundColor: 'var(--bg)', borderRadius: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                    width: camp.allocation,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Optimierungsempfehlungen</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {budget.recommendations.map((rec, idx) => (
            <div
              key={idx}
              style={{
                padding: 12,
                backgroundColor: 'var(--bg)',
                borderRadius: 8,
                borderLeft: '3px solid var(--primary)',
                fontSize: 13,
              }}
            >
              💡 {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
