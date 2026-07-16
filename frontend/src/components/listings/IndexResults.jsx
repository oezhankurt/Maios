export default function IndexResults({ data }) {
  if (!data || !data.results) return null;

  const { asin, total, indexed, onFirstPage, topTen, results } = data;

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="stat-label">Gesamte Keywords</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="card">
          <div className="stat-label">Indiziert</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{indexed}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {Math.round((indexed / total) * 100)}%
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Auf Seite 1</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{onFirstPage}</div>
        </div>
        <div className="card">
          <div className="stat-label">Top 10 (Title)</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{topTen}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Keyword Rankings</div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Indexiert</th>
                <th>Traditioneller Index</th>
                <th>Field-ASIN Index</th>
                <th>Storefront</th>
                <th>Suchvolumen</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 50).map((result, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{result.keyword}</td>
                  <td>
                    {result.indexed ? (
                      <span style={{ color: 'var(--success)' }}>✓</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>–</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{result.tradIndex ? result.tradIndex : '–'}</td>
                  <td style={{ fontWeight: 600 }}>{result.fieldAsin ? result.fieldAsin : '–'}</td>
                  <td style={{ fontWeight: 600 }}>{result.storefront ? result.storefront : '–'}</td>
                  <td style={{ color: 'var(--info)' }}>{result.searchVol || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length > 50 && (
          <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
            Zeige 50 von {results.length} Keywords
          </div>
        )}
      </div>
    </div>
  );
}
