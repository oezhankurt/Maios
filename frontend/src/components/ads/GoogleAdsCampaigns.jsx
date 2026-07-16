export default function GoogleAdsCampaigns({ campaigns, selectedId, onSelect }) {
  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Kampagnen-Übersicht</div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Kampagne</th>
              <th>Typ</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Ausgegeben</th>
              <th>Impressionen</th>
              <th>Klicks</th>
              <th>CTR</th>
              <th>Avg CPC</th>
              <th>Konversionen</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr
                key={camp.id}
                onClick={() => onSelect(camp.id)}
                style={{
                  backgroundColor: selectedId === camp.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{camp.name}</td>
                <td style={{ fontSize: 12 }}>{camp.type}</td>
                <td>
                  <span className={`badge badge-${camp.status === 'Aktiv' ? 'success' : 'muted'}`}>
                    {camp.status}
                  </span>
                </td>
                <td>€{camp.budget}</td>
                <td style={{ fontWeight: 600 }}>€{camp.spent}</td>
                <td>{camp.impressions.toLocaleString()}</td>
                <td>{camp.clicks.toLocaleString()}</td>
                <td>{camp.ctr}%</td>
                <td>€{camp.avgCpc}</td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>{camp.conversions}</td>
                <td style={{ color: 'var(--info)', fontWeight: 600 }}>{camp.roas}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
