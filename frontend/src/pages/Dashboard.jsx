import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useAuthStore } from '../store/authStore';
import SellerTile from '../components/dashboard/SellerTile.jsx';
import QuickStats from '../components/dashboard/QuickStats.jsx';
import ProfitChart from '../components/dashboard/ProfitChart.jsx';
import AlertsList from '../components/dashboard/AlertsList.jsx';
import TopProducts from '../components/dashboard/TopProducts.jsx';
import Loading from '../components/layout/Loading.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const { overview, chart, topProducts, alerts, loading, error, loadAll, dismissAlert } =
    useDashboardStore();
  const ccy = useAuthStore((s) => s.user?.currency || 'EUR');

  useEffect(() => {
    loadAll(30);
  }, [loadAll]);

  if (loading && !overview) return <Loading label="Loading dashboard…" />;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Overview</h1>
        <button className="btn" onClick={() => loadAll(30)}>
          ↻ Refresh
        </button>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          marginBottom: 20,
        }}
      >
        <SellerTile title="Heute" tile={overview?.tiles?.today} ccy={ccy} accent="#3b82f6" />
        <SellerTile title="Gestern" tile={overview?.tiles?.yesterday} ccy={ccy} accent="#0ea5e9" />
        <SellerTile title="Aktueller Monat" tile={overview?.tiles?.thisMonth} ccy={ccy} accent="#14b8a6" />
        <SellerTile title="Monat (Prognose)" tile={overview?.tiles?.forecast} ccy={ccy} accent="#8b5cf6" />
        <SellerTile title="Letzter Monat" tile={overview?.tiles?.lastMonth} ccy={ccy} accent="#22c55e" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <QuickStats overview={overview} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 20 }}>
        <ProfitChart data={chart} />
        <AlertsList alerts={alerts} onDismiss={dismissAlert} />
      </div>

      <TopProducts rows={topProducts} ccy={ccy} />
    </div>
  );
}
