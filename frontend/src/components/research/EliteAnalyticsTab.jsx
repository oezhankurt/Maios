import { useState } from 'react';
import { ResearchAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import { currency, number } from '../../utils/format';

function Stat({ label, value, sub }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 150 }}>
      <div className="text-muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{value}</div>
      {sub && <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/**
 * Elite Analytics — segment-level insights for a niche phrase: total revenue,
 * averages, top brands and review distribution (Black Box "Elite Analytics").
 */
export default function EliteAnalyticsTab() {
  const [phrase, setPhrase] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ResearchAPI.analytics({ phrase });
      setReport(data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const maxBucket = report ? Math.max(1, ...report.reviewBuckets.map((b) => b.count)) : 1;

  const brandCols = [
    { key: 'brand', label: 'Marke', render: (r) => <span style={{ fontWeight: 600 }}>{r.brand}</span> },
    { key: 'count', label: 'Produkte', align: 'right' },
    { key: 'revenue', label: 'Segment-Umsatz/Mt.', align: 'right', render: (r) => currency(r.revenue) },
  ];

  return (
    <div>
      <form onSubmit={run} className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Elite Analytics — Segment-Report</div>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 2, minWidth: 240, margin: 0 }}>
            <label>Phrase / Nische</label>
            <input className="input" value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="z.B. yoga mat" required />
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Analysiere…' : '📊 Report erstellen'}</button>
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
          Aggregierte Kennzahlen für das gesamte Marktsegment — Umsatz, Wettbewerb, Marken und Bewertungsverteilung.
        </div>
      </form>

      {report && report.productCount === 0 && (
        <div className="card empty">Kein Segment für „{report.phrase}" gefunden.</div>
      )}

      {report && report.productCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
            <Stat label="Produkte im Segment" value={number(report.productCount)} />
            <Stat label="Segment-Umsatz / Monat" value={currency(report.segmentRevenue)} sub={`${number(report.segmentSales)} Einheiten`} />
            <Stat label="Ø Preis" value={currency(report.avgPrice)} />
            <Stat label="Ø Bewertungsanzahl" value={number(report.avgReviews)} />
            <Stat label="Ø Bewertung" value={`★ ${report.avgRating}`} sub={`${report.goodRated} gut bewertet (≥4,3)`} />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-title">Top-Marken im Segment</div>
              <Table columns={brandCols} rows={report.brands} keyField="brand" empty="—" />
            </div>

            <div className="card">
              <div className="card-title">Bewertungsverteilung</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                {report.reviewBuckets.map((b) => (
                  <div key={b.label} className="row" style={{ gap: 10, alignItems: 'center' }}>
                    <span className="text-muted" style={{ width: 80, fontSize: 13 }}>{b.label}</span>
                    <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${(b.count / maxBucket) * 100}%`, height: '100%', background: 'var(--primary)' }} />
                    </div>
                    <strong style={{ width: 28, textAlign: 'right' }}>{b.count}</strong>
                  </div>
                ))}
              </div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 10 }}>
                Wie viele Rezensionen die Wettbewerber haben — links = leicht anzugreifen.
              </div>
            </div>
          </div>
        </div>
      )}

      {!report && !searched && (
        <div className="card empty">Phrase eingeben und Report erstellen, um Segment-Einblicke zu erhalten.</div>
      )}
    </div>
  );
}
