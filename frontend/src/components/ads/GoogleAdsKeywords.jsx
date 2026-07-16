import { useState, useEffect } from 'react';
import { GoogleAdsAPI } from '../../api/api';
import Loading from '../layout/Loading.jsx';

export default function GoogleAdsKeywords({ campaignId }) {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await GoogleAdsAPI.getKeywords(campaignId);
        setKeywords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId]);

  if (loading) return <Loading label="Keywords werden geladen..." />;

  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Keywords für {campaignId}</div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Match Type</th>
              <th>Gebot</th>
              <th>Quality</th>
              <th>Status</th>
              <th>Klicks</th>
              <th>Impressionen</th>
              <th>Konversionen</th>
              <th>CTR</th>
              <th>Avg CPC</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>{kw.keyword}</td>
                <td style={{ fontSize: 12 }}>{kw.matchType}</td>
                <td>€{kw.bid}</td>
                <td>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor:
                        kw.quality >= 8
                          ? 'rgba(34, 197, 94, 0.15)'
                          : kw.quality >= 5
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                      color:
                        kw.quality >= 8 ? 'var(--success)' : kw.quality >= 5 ? 'var(--warning)' : 'var(--danger)',
                      fontSize: 12,
                    }}
                  >
                    {kw.quality}/10
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${kw.status === 'Aktiv' ? 'success' : 'muted'}`}>
                    {kw.status}
                  </span>
                </td>
                <td>{kw.clicks}</td>
                <td>{kw.impressions.toLocaleString()}</td>
                <td style={{ color: 'var(--success)' }}>{kw.conversions}</td>
                <td>{kw.ctr}%</td>
                <td>€{kw.avgCpc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
