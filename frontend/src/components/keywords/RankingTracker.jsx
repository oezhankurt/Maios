import Table from '../layout/Table.jsx';

const MARKETPLACES = ['amazon', 'ebay', 'kaufland', 'otto'];

function changeCell(change) {
  if (!change || change.direction === 'new') return <span className="badge badge-muted">new</span>;
  if (change.direction === 'up') return <span className="text-success">▲ {Math.abs(change.delta)}</span>;
  if (change.direction === 'down') return <span className="text-danger">▼ {Math.abs(change.delta)}</span>;
  return <span className="text-muted">—</span>;
}

export default function RankingTracker({ rankings = [], marketplace, onMarketplaceChange, onSelectKeyword }) {
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
          style={{ width: 160 }}
          value={marketplace}
          onChange={(e) => onMarketplaceChange(e.target.value)}
        >
          {MARKETPLACES.map((m) => (
            <option key={m} value={m}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <Table columns={columns} rows={rankings} empty="No rankings recorded yet" keyField="keywordId" />
    </div>
  );
}
