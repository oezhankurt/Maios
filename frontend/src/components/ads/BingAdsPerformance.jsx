import { useState, useEffect } from 'react';
import { BingAdsAPI } from '../../api/api';
import Loading from '../layout/Loading.jsx';

export default function BingAdsPerformance({ campaignId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await BingAdsAPI.getPerformance(campaignId);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId]);

  if (loading) return <Loading label="Performance wird geladen..." />;
  if (!data) return <div className="empty">Keine Daten verfügbar</div>;

  const { summary, comparison, topKeywords } = data;

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="stat-label">Impressionen</div>
          <div className="stat-value">{summary.impressions.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="stat-label">Klicks</div>
          <div className="stat-value">{summary.clicks.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="stat-label">Konversionen</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{summary.conversions}</div>
        </div>
        <div className="card">
          <div className="stat-label">Ausgaben</div>
          <div className="stat-value">€{summary.spend}</div>
        </div>
        <div className="card">
          <div className="stat-label">ROAS</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{summary.roas}x</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Vergleich: Bing vs Google</div>
        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--bg)',
            borderRadius: 8,
            borderLeft: `3px solid ${comparison.verdict.includes('besser') ? 'var(--success)' : 'var(--warning)'}`,
          }}
        >
          <div style={{ fontSize: 13 }}>
            <strong>Bing ROAS:</strong> {comparison.bingAdsRoas}x
            <br />
            <strong>Google ROAS:</strong> {comparison.googleAdsRoas}x
            <br />
            <strong>Verdict:</strong> {comparison.verdict}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top Keywords</div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Konversionen</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {topKeywords.map((kw, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{kw.keyword}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{kw.conversions}</td>
                  <td>{kw.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
