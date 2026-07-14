import { useEffect, useState } from 'react';
import { PPCAPI } from '../../api/api';
import Chart from '../layout/Chart.jsx';
import { shortDate, currency, percent } from '../../utils/format';

export default function PerformanceMetrics({ campaign }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!campaign) return;
    PPCAPI.performance(campaign.id, { days: 30 })
      .then(setRows)
      .catch(() => setRows([]));
  }, [campaign]);

  if (!campaign) return null;

  const data = rows.map((r) => ({
    label: shortDate(r.performanceDate),
    acos: Number(r.acos),
    roas: Number(r.roas),
    ctr: Number(r.ctr),
    cpc: Number(r.cpc),
    spend: Number(r.spend),
    sales: Number(r.sales),
  }));

  const latest = rows[rows.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {latest && (
        <div className="grid grid-4">
          <Metric label="ACoS" value={percent(latest.acos)} />
          <Metric label="ROAS" value={`${Number(latest.roas).toFixed(2)}x`} />
          <Metric label="CTR" value={percent(latest.ctr, 2)} />
          <Metric label="CPC" value={currency(latest.cpc)} />
        </div>
      )}

      <div className="card">
        <div className="card-title">Spend vs Sales (30 days)</div>
        <Chart
          type="bar"
          data={data}
          xKey="label"
          series={[
            { key: 'spend', name: 'Spend', color: '#ef4444' },
            { key: 'sales', name: 'Sales', color: '#22c55e' },
          ]}
        />
      </div>

      <div className="card">
        <div className="card-title">ACoS & ROAS Trend</div>
        <Chart
          type="line"
          data={data}
          xKey="label"
          series={[
            { key: 'acos', name: 'ACoS %', color: '#f59e0b' },
            { key: 'roas', name: 'ROAS', color: '#38bdf8' },
          ]}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="stat-value" style={{ fontSize: 24 }}>
        {value}
      </div>
    </div>
  );
}
