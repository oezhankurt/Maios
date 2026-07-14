import Chart from '../layout/Chart.jsx';
import { shortDate } from '../../utils/format';

export default function ProfitChart({ data = [] }) {
  const formatted = data.map((d) => ({ ...d, label: shortDate(d.date) }));
  return (
    <div className="card">
      <div className="card-title">Profit & Revenue — Last 30 Days</div>
      <Chart
        type="area"
        data={formatted}
        xKey="label"
        series={[
          { key: 'revenue', name: 'Revenue', color: '#38bdf8' },
          { key: 'profit', name: 'Profit', color: '#22c55e' },
        ]}
        height={300}
      />
    </div>
  );
}
