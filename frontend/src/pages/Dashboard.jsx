import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useAuthStore } from '../store/authStore';
import ProfitCard from '../components/dashboard/ProfitCard.jsx';
import QuickStats from '../components/dashboard/QuickStats.jsx';
import ProfitChart from '../components/dashboard/ProfitChart.jsx';
import AlertsList from '../components/dashboard/AlertsList.jsx';
import TopProducts from '../components/dashboard/TopProducts.jsx';
import Loading from '../components/layout/Loading.jsx';

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

      <div className="grid grid-3 mb-2" style={{ marginBottom: 20 }}>
        <ProfitCard
          label="Today"
          profit={overview?.today?.profit}
          revenue={overview?.today?.revenue}
          units={overview?.today?.units}
          ccy={ccy}
          accent="#22c55e"
        />
        <ProfitCard
          label="This Month"
          profit={overview?.monthly?.profit}
          revenue={overview?.monthly?.revenue}
          units={overview?.monthly?.units}
          ccy={ccy}
          accent="#6366f1"
        />
        <ProfitCard
          label="This Year"
          profit={overview?.yearly?.profit}
          revenue={overview?.yearly?.revenue}
          units={overview?.yearly?.units}
          ccy={ccy}
          accent="#38bdf8"
        />
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
