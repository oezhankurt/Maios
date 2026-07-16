export default function ListingTable({ listings }) {
  return (
    <table className="data">
      <thead>
        <tr>
          <th>Produktname</th>
          <th>Marktplatz</th>
          <th>Version</th>
          <th>Status</th>
          <th>Generierte Bilder</th>
          <th>KPR</th>
          <th>KPS</th>
          <th>Zuletzt aktualisiert</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {listings.map((listing) => (
          <tr key={listing.id}>
            <td style={{ fontWeight: 500, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {listing.title}
            </td>
            <td>{listing.marketplace}</td>
            <td>{listing.version}</td>
            <td>
              <span
                className={`badge badge-${listing.status === 'Synchronisiert' ? 'success' : listing.status === 'Fehler' ? 'danger' : 'info'}`}
              >
                {listing.status}
              </span>
            </td>
            <td>{listing.generatedImages}</td>
            <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{listing.kpr}</td>
            <td style={{ fontWeight: 600, color: 'var(--info)' }}>{listing.kps}</td>
            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{listing.lastUpdated}</td>
            <td>
              <button className="btn btn-sm">Bearbeite</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
