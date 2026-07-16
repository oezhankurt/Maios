export default function BingAdsDashboard({ campaigns }) {
  if (!campaigns || campaigns.length === 0) return <div className="empty">Keine Kampagnen</div>;

  const totalSpent = campaigns.reduce((sum, c) => sum + parseFloat(c.spent), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgRoas = (campaigns.reduce((sum, c) => sum + parseFloat(c.roas), 0) / campaigns.length).toFixed(2);

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="stat-label">Aktive Kampagnen</div>
          <div className="stat-value">{campaigns.filter((c) => c.status === 'Aktiv').length}</div>
        </div>
        <div className="card">
          <div className="stat-label">Gesamtausgaben</div>
          <div className="stat-value">€{totalSpent.toFixed(0)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Konversionen</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{totalConversions}</div>
        </div>
        <div className="card">
          <div className="stat-label">Ø ROAS</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{avgRoas}x</div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Bing Ads Kampagnen</div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Kampagne</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Ausgegeben</th>
                <th>Klicks</th>
                <th>Impressionen</th>
                <th>Konversionen</th>
                <th>CTR</th>
                <th>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id}>
                  <td style={{ fontWeight: 500 }}>{camp.name}</td>
                  <td>
                    <span className={`badge badge-${camp.status === 'Aktiv' ? 'success' : 'muted'}`}>
                      {camp.status}
                    </span>
                  </td>
                  <td>€{camp.budget}</td>
                  <td style={{ fontWeight: 600 }}>€{camp.spent}</td>
                  <td>{camp.clicks.toLocaleString()}</td>
                  <td>{camp.impressions.toLocaleString()}</td>
                  <td style={{ color: 'var(--success)' }}>{camp.conversions}</td>
                  <td>{camp.ctr}%</td>
                  <td style={{ color: 'var(--info)', fontWeight: 600 }}>{camp.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
