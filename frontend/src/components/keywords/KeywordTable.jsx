import Table from '../layout/Table.jsx';
import { currency, number } from '../../utils/format';

export default function KeywordTable({ keywords = [], onRemove }) {
  const columns = [
    { key: 'keyword', label: 'Keyword' },
    {
      key: 'keywordType',
      label: 'Type',
      render: (r) => <span className="badge badge-muted">{r.keywordType}</span>,
    },
    { key: 'searchVolume', label: 'Volume', align: 'right', render: (r) => number(r.searchVolume) },
    { key: 'cpc', label: 'CPC', align: 'right', render: (r) => currency(r.cpc) },
    { key: 'difficultyScore', label: 'Difficulty', align: 'right', render: (r) => r.difficultyScore },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) =>
        onRemove ? (
          <button className="btn btn-sm btn-danger" onClick={() => onRemove(r.id)}>
            Delete
          </button>
        ) : null,
    },
  ];

  return (
    <div className="card">
      <div className="card-title">Tracked Keywords</div>
      <Table columns={columns} rows={keywords} empty="No keywords tracked yet" />
    </div>
  );
}
