import { useEffect, useState } from 'react';
import { ProductAPI, ProfitAPI } from '../api/api';
import { useAuthStore } from '../store/authStore';
import ProductPicker from '../components/layout/ProductPicker.jsx';
import Chart from '../components/layout/Chart.jsx';
import Loading from '../components/layout/Loading.jsx';
import ProductDiagnostics from '../components/listings/ProductDiagnostics.jsx';
import { currency, number, percent, shortDate } from '../utils/format';
import './Analytics.css';

export default function Analytics() {
  const ccy = useAuthStore((s) => s.user?.currency || 'EUR');
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(null);
  const [days, setDays] = useState(30);
  const [chart, setChart] = useState([]);
  const [monthly, setMonthly] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductAPI.list().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = { days };
    if (productId) params.productId = productId;
    ProfitAPI.chart(params).then(setChart);

    if (productId) {
      ProfitAPI.monthly(productId).then(setMonthly);
      ProfitAPI.forecast(productId).then(setForecast);
    } else {
      setMonthly(null);
      setForecast(null);
    }
  }, [productId, days]);

  if (loading) return <Loading label="Loading analytics…" />;

  const data = chart.map((d) => ({ ...d, label: shortDate(d.date) }));

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
        <div className="row" style={{ gap: 10 }}>
          <ProductPicker products={products} value={productId} onChange={setProductId} allowAll />
          <select className="select" style={{ width: 130 }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      {productId && (
        <div style={{ marginBottom: 20 }}>
          <ProductDiagnostics productId={productId} ccy={ccy} />
        </div>
      )}

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <Summary label="Total Revenue" value={currency(sum(chart, 'revenue'), ccy)} />
        <Summary label="Total Profit" value={currency(sum(chart, 'profit'), ccy)} accent="var(--success)" />
        <Summary label="Units Sold" value={number(sum(chart, 'units'))} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Revenue & Profit Trend</div>
        <Chart
          type="area"
          data={data}
          xKey="label"
          series={[
            { key: 'revenue', name: 'Revenue', color: '#38bdf8' },
            { key: 'profit', name: 'Profit', color: '#22c55e' },
          ]}
          height={320}
        />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Units Sold</div>
          <Chart type="bar" data={data} xKey="label" series={[{ key: 'units', name: 'Units', color: '#6366f1' }]} />
        </div>

        <div className="card">
          <div className="card-title">Month-to-Date & Forecast</div>
          {productId && monthly ? (
            <div style={{ fontSize: 14 }}>
              <Row label="MTD Revenue" value={currency(monthly.totalRevenue, ccy)} />
              <Row label="MTD Profit" value={currency(monthly.totalProfit, ccy)} />
              <Row label="MTD Margin" value={percent(monthly.profitMargin)} />
              {forecast && (
                <>
                  <Row label="Avg Daily Profit" value={currency(forecast.avgDailyProfit, ccy)} />
                  <Row label="Forecast (month)" value={currency(forecast.forecastMonthProfit, ccy)} accent />
                </>
              )}
            </div>
          ) : (
            <div className="empty">Select a single product to see forecast.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function sum(arr, key) {
  return arr.reduce((s, d) => s + (Number(d[key]) || 0), 0);
}

function Summary({ label, value, accent }) {
  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="stat-value" style={{ color: accent || 'var(--text)' }}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="text-muted">{label}</span>
      <strong style={{ color: accent ? 'var(--primary)' : 'var(--text)' }}>{value}</strong>
    </div>
  );
}
