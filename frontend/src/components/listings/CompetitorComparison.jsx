import { useEffect, useState } from 'react';
import { ProductAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import { currency } from '../../utils/format';

export default function CompetitorComparison({ product }) {
  const [rows, setRows] = useState([]);

  const load = () => {
    if (!product) return;
    ProductAPI.competitors(product.id)
      .then(setRows)
      .catch(() => setRows([]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) return null;

  const myPrice = Number(product.price);
  const columns = [
    {
      key: 'competitorTitle',
      label: 'Competitor',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.competitorTitle || r.competitorAsin}</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {r.marketplace}
          </div>
        </div>
      ),
    },
    { key: 'price', label: 'Their Price', align: 'right', render: (r) => (r.price != null ? currency(r.price) : '—') },
    {
      key: 'diff',
      label: 'vs You',
      align: 'right',
      render: (r) => {
        if (r.price == null) return '—';
        const diff = myPrice - r.price;
        return (
          <span className={diff > 0 ? 'text-danger' : 'text-success'}>
            {diff > 0 ? '+' : ''}
            {currency(diff)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="card">
      <div className="card-title">Competitor Price Comparison (yours: {currency(myPrice)})</div>
      <Table columns={columns} rows={rows} empty="No competitors tracked for this product" />
    </div>
  );
}
