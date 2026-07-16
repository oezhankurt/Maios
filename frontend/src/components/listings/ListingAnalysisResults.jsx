export default function ListingAnalysisResults({ data }) {
  if (!data || !data.competitors) return null;

  const { main, competitors, comparison, strengths, weaknesses } = data;

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="stat-label">Preis Vergleich</div>
          <div style={{ fontSize: 13, marginBottom: 12 }}>
            <div>
              Dein: <strong>€{comparison.price.main.toFixed(2)}</strong>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              Ø: €{comparison.price.avg} (€{comparison.price.min}-€{comparison.price.max})
            </div>
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Bewertungen</div>
          <div style={{ fontSize: 13, marginBottom: 12 }}>
            <div>
              Dein: <strong>{comparison.reviews.main}</strong>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              Ø: {comparison.reviews.avg} ({comparison.reviews.min}-{comparison.reviews.max})
            </div>
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Rating</div>
          <div style={{ fontSize: 13, marginBottom: 12 }}>
            <div>
              Dein: <strong>{comparison.rating.main}★</strong>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              Ø: {comparison.rating.avg}★ ({comparison.rating.min}-{comparison.rating.max}★)
            </div>
          </div>
        </div>
      </div>

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {strengths.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--success)' }}>✓ Stärken</div>
              <ul style={{ paddingLeft: 16, fontSize: 13 }}>
                {strengths.map((s, i) => (
                  <li key={i} style={{ marginBottom: 6, color: 'var(--text-muted)' }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--warning)' }}>⚠ Schwächen</div>
              <ul style={{ paddingLeft: 16, fontSize: 13 }}>
                {weaknesses.map((w, i) => (
                  <li key={i} style={{ marginBottom: 6, color: 'var(--text-muted)' }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Wettbewerber-Details ({competitors.length})</div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>ASIN</th>
                <th>Titel</th>
                <th>Preis</th>
                <th>Bewertungen</th>
                <th>Rating</th>
                <th>Bilder</th>
                <th>Varianten</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp) => (
                <tr key={comp.asin}>
                  <td style={{ fontWeight: 600, fontSize: 12, color: 'var(--primary)' }}>{comp.asin}</td>
                  <td style={{ fontSize: 12, maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {comp.title}
                  </td>
                  <td>€{comp.price}</td>
                  <td>{comp.reviews}</td>
                  <td>{comp.rating}★</td>
                  <td>{comp.images}</td>
                  <td>{comp.variants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
