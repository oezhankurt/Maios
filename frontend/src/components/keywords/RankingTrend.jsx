import { useEffect, useState } from 'react';
import { RankingAPI } from '../../api/api';
import Chart from '../layout/Chart.jsx';
import { shortDate } from '../../utils/format';

export default function RankingTrend({ keywordId, marketplace = 'amazon' }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!keywordId) return;
    RankingAPI.trend(keywordId, { marketplace, days: 30 })
      .then(setData)
      .catch(() => setData(null));
  }, [keywordId, marketplace]);

  if (!keywordId) return null;

  const points = (data?.points || []).map((p) => ({
    label: shortDate(p.rankDate),
    position: p.rankingPosition,
  }));

  return (
    <div className="card">
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>
          Ranking Trend (30 days)
        </div>
        {data && (
          <span
            className={`badge ${
              data.label === 'improving'
                ? 'badge-success'
                : data.label === 'declining'
                ? 'badge-danger'
                : 'badge-muted'
            }`}
          >
            {data.label}
          </span>
        )}
      </div>
      {/* Lower position number is better, so invert the Y axis via reversed domain. */}
      <Chart
        type="line"
        data={points}
        xKey="label"
        series={[{ key: 'position', name: 'Rank', color: '#6366f1' }]}
        height={240}
      />
      {data && (
        <div className="row" style={{ gap: 20, marginTop: 10, fontSize: 13 }}>
          <span className="text-muted">Best #{data.best}</span>
          <span className="text-muted">Worst #{data.worst}</span>
          <span className="text-muted">Current #{data.current}</span>
        </div>
      )}
    </div>
  );
}
