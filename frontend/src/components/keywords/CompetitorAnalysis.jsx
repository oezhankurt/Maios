import { number } from '../../utils/format';

/**
 * Compares the highest-volume tracked keywords as a simple competitive gap
 * view. In a full build this would diff against competitor-ranked terms; here
 * it highlights the opportunity keywords (high volume, lower difficulty).
 */
export default function CompetitorAnalysis({ keywords = [] }) {
  const opportunities = [...keywords]
    .filter((k) => k.difficultyScore <= 50)
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 5);

  return (
    <div className="card">
      <div className="card-title">Opportunity Keywords (high volume, low difficulty)</div>
      {opportunities.length === 0 ? (
        <div className="empty" style={{ padding: 20 }}>
          No opportunity keywords yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {opportunities.map((k) => (
            <div key={k.id} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>{k.keyword}</span>
              <span className="row" style={{ gap: 14, fontSize: 13 }}>
                <span className="text-muted">{number(k.searchVolume)} vol</span>
                <span className="badge badge-success">diff {k.difficultyScore}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
