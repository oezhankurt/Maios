import { useEffect, useState } from 'react';
import { PPCAPI } from '../../api/api';
import { currency, number, percent } from '../../utils/format';

function Kpi({ label, value, accent }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="card-title" style={{ margin: 0, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent || 'var(--text)', marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

/**
 * Adference-style "Zeitvergleich" KPI panel: the headline advertising metrics
 * for the account over a rolling window.
 */
export default function PPCKpis({ ccy = 'EUR' }) {
  const [k, setK] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    PPCAPI.overview({ days }).then(setK).catch(() => setK(null));
  }, [days]);

  if (!k) return null;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>Werbung — Zeitvergleich</div>
        <select className="select" style={{ width: 130 }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>7 Tage</option>
          <option value={30}>30 Tage</option>
          <option value={90}>90 Tage</option>
        </select>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <Kpi label="ACoS" value={percent(k.acos)} accent="#f59e0b" />
        <Kpi label="ROAS" value={`${k.roas}x`} accent="#38bdf8" />
        <Kpi label="TACoS" value={percent(k.tacos)} accent="#8b5cf6" />
        <Kpi label="Werbeausgaben" value={currency(k.adSpend, ccy)} accent="#ef4444" />
        <Kpi label="Ad-Umsätze" value={currency(k.adSales, ccy)} accent="#22c55e" />
        <Kpi label="Organische Umsätze" value={currency(k.organicSales, ccy)} accent="#22c55e" />
        <Kpi label="Conversions" value={number(k.conversions)} />
        <Kpi label="Impressionen" value={number(k.impressions)} />
        <Kpi label="Klicks" value={number(k.clicks)} />
        <Kpi label="CTR" value={percent(k.ctr, 2)} />
        <Kpi label="CPC" value={currency(k.cpc, ccy)} />
        <Kpi label="CVR" value={percent(k.cvr)} />
      </div>
    </div>
  );
}
