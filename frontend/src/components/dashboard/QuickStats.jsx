import { number } from '../../utils/format';

export default function QuickStats({ overview }) {
  const stats = [
    { label: 'Active Products', value: number(overview?.activeProducts || 0), icon: '📦' },
    { label: 'Active Alerts', value: number(overview?.activeAlerts || 0), icon: '🔔' },
    { label: 'Units Today', value: number(overview?.today?.units || 0), icon: '🛒' },
    { label: 'Units This Month', value: number(overview?.monthly?.units || 0), icon: '📅' },
  ];

  return (
    <div className="grid grid-4">
      {stats.map((s) => (
        <div className="card" key={s.label}>
          <div className="row" style={{ gap: 14 }}>
            <div style={{ fontSize: 26 }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
