import { useState } from 'react';
import { KeywordAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import { currency, number } from '../../utils/format';

export default function KeywordSearch({ product, onAdd }) {
  const [title, setTitle] = useState(product?.title || '');
  const [category, setCategory] = useState(product?.category || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await KeywordAPI.research({ productTitle: title, category });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const difficultyBadge = (score) => {
    if (score > 66) return <span className="badge badge-danger">Hard {score}</span>;
    if (score > 33) return <span className="badge badge-warning">Medium {score}</span>;
    return <span className="badge badge-success">Easy {score}</span>;
  };

  const columns = [
    { key: 'keyword', label: 'Keyword' },
    { key: 'searchVolume', label: 'Volume', align: 'right', render: (r) => number(r.searchVolume) },
    { key: 'cpc', label: 'CPC', align: 'right', render: (r) => currency(r.cpc) },
    { key: 'difficultyScore', label: 'Difficulty', render: (r) => difficultyBadge(r.difficultyScore) },
    {
      key: 'add',
      label: '',
      align: 'right',
      render: (r) =>
        onAdd && product ? (
          <button className="btn btn-sm btn-primary" onClick={() => onAdd(r)}>
            + Track
          </button>
        ) : null,
    },
  ];

  return (
    <div className="card">
      <div className="card-title">Keyword Research</div>
      <form onSubmit={run} className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <input
          className="input"
          style={{ flex: 2, minWidth: 200 }}
          placeholder="Product title / seed phrase"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="input"
          style={{ flex: 1, minWidth: 140 }}
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Research'}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}
      {results.length > 0 && <Table columns={columns} rows={results} keyField="keyword" />}
    </div>
  );
}
