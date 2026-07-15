import { useEffect, useState } from 'react';
import Table from '../layout/Table.jsx';
import { ChannelAPI } from '../../api/api';

const FALLBACK = [
  { id: 'amazon', label: 'Amazon' }, { id: 'ebay', label: 'eBay' },
  { id: 'kaufland', label: 'Kaufland' }, { id: 'otto', label: 'Otto' },
];

function changeCell(change) {
  if (!change || change.direction === 'new') return <span className="badge badge-muted">new</span>;
  if (change.direction === 'up') return <span className="text-success">▲ {Math.abs(change.delta)}</span>;
  if (change.direction === 'down') return <span className="text-danger">▼ {Math.abs(change.delta)}</span>;
  return <span className="text-muted">—</span>;
}

export default function RankingTracker({ rankings = [], marketplace, onMarketplaceChange, onSelectKeyword }) {
  const [marketplaces, setMarketplaces] = useState(FALLBACK);
  useEffect(() => {
    ChannelAPI.list().then((d) => setMarketplaces(d.marketplaces || FALLBACK)).catch(() => {});
  }, []);

  const columns = [
    {
      key: 'keyword',
      label: 'Keyword',
      render: (r) => (
        <button
          className="btn btn-sm"
          style={{ border: 'none', background: 'none', color: 'var(--primary)', padding: 0 }}
          onClick={() => onSelectKeyword && onSelectKeyword(r.keywordId)}
        >
          {r.keyword}
        </button>
      ),
    },
    {
      key: 'rankingPosition',
      label: 'Position',
      align: 'right',
      render: (r) => (r.rankingPosition != null ? `#${r.rankingPosition}` : '—'),
    },
    { key: 'previousRanking', label: 'Previous', align: 'right', render: (r) => (r.previousRanking != null ? `#${r.previousRanking}` : '—') },
    { key: 'change', label: 'Change', align: 'right', render: (r) => changeCell(r.change) },
  ];

  return (
    <div className="card">
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>
          Ranking Tracker
        </div>
        <select
          className="select"
          style={{ width: 180 }}
          value={marketplace}
          onChange={(e) => onMarketplaceChange(e.target.value)}
        >
          {marketplaces.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <Table columns={columns} rows={rankings} empty="No rankings recorded yet" keyField="keywordId" />
    </div>
  );
}
