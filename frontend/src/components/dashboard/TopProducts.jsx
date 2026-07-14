import Table from '../layout/Table.jsx';
import { currency, number, percent } from '../../utils/format';

export default function TopProducts({ rows = [], ccy = 'EUR' }) {
  const columns = [
    {
      key: 'title',
      label: 'Product',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.product?.title}</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {r.product?.asin || '—'}
          </div>
        </div>
      ),
    },
    { key: 'revenue', label: 'Revenue', align: 'right', render: (r) => currency(r.revenue, ccy) },
    {
      key: 'profit',
      label: 'Profit',
      align: 'right',
      render: (r) => <span className="text-success">{currency(r.profit, ccy)}</span>,
    },
    { key: 'margin', label: 'Margin', align: 'right', render: (r) => percent(r.margin) },
    { key: 'unitsSold', label: 'Units', align: 'right', render: (r) => number(r.unitsSold) },
  ];

  return (
    <div className="card">
      <div className="card-title">Top Products (30 days)</div>
      <Table columns={columns} rows={rows} empty="No product data yet" keyField="revenue" />
    </div>
  );
}
