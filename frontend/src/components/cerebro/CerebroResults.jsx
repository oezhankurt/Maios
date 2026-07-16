import Table from '../layout/Table.jsx';
import { currency, number } from '../../utils/format';

function Trend({ trend }) {
  if (!trend) return <span className="text-muted">—</span>;
  if (trend.direction === 'up') return <span className="text-success">▲ {trend.pct}%</span>;
  if (trend.direction === 'down') return <span className="text-danger">▼ {Math.abs(trend.pct)}%</span>;
  return <span className="text-muted">— {trend.pct}%</span>;
}

function Stat({ label, value, sub }) {
  return (
    <div>
      <div className="text-muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
      {sub && <div className="text-muted" style={{ fontSize: 11 }}>{sub}</div>}
    </div>
  );
}

const shortAsin = (a) => (a.length > 10 ? `${a.slice(0, 10)}…` : a);

function rankCell(pos) {
  if (pos == null) return <span className="text-muted" title="Rankt nicht — Keyword-Lücke">–</span>;
  const color = pos <= 20 ? '#22c55e' : pos <= 50 ? '#f59e0b' : '#ef4444';
  return <strong style={{ color }}>#{pos}</strong>;
}

/**
 * Shared Cerebro results view: summary, word frequency and the keyword table.
 * In reverse-ASIN mode the table gains one rank column per input ASIN, so
 * keyword gaps (a "–") jump out.
 */
export default function CerebroResults({ data }) {
  if (!data) return null;
  const { summary, keywords, asins } = data;
  if (!keywords || keywords.length === 0) {
    return <div className="card empty">Keine Keywords gefunden. ASIN(s) oder Keyword eingeben und suchen.</div>;
  }
  const d = summary.distribution;

  const baseCols = [
    {
      key: 'keyword', label: 'Keyword-Phrase',
      render: (r) => (
        <span>
          <span style={{ fontWeight: 600 }}>{r.keyword}</span>{' '}
          <span className={`badge ${r.organic ? 'badge-success' : 'badge-info'}`} style={{ fontSize: 10 }}>
            {r.organic ? 'organisch' : 'bezahlt'}
          </span>
        </span>
      ),
    },
    { key: 'searchVolume', label: 'Suchvolumen', align: 'right', render: (r) => number(r.searchVolume) },
    { key: 'cerebroIQ', label: 'Cerebro IQ', align: 'right', render: (r) => number(r.cerebroIQ) },
    { key: 'trend', label: 'Trend', align: 'right', render: (r) => <Trend trend={r.trend} /> },
    {
      key: 'bid', label: 'Vorg. PPC-Gebot', align: 'right',
      render: (r) => (
        <span title={`${currency(r.suggestedBid.min)} – ${currency(r.suggestedBid.max)}`}>
          {currency(r.suggestedBid.value)}
        </span>
      ),
    },
    { key: 'sponsoredAsins', label: 'Gesponserte ASINs', align: 'right', render: (r) => number(r.sponsoredAsins) },
    { key: 'competingProducts', label: 'Konkurr. Produkte', align: 'right', render: (r) => number(r.competingProducts) },
    { key: 'cpr', label: 'CPR', align: 'right', render: (r) => number(r.cpr) },
  ];

  // Reverse-ASIN mode → a rank column per ASIN.
  const asinCols = (asins || []).map((a) => ({
    key: `rank_${a}`,
    label: shortAsin(a),
    align: 'right',
    render: (r) => rankCell(r.ranks ? r.ranks[a] : null),
  }));

  const columns = asins && asins.length ? [...baseCols.slice(0, 1), ...asinCols, ...baseCols.slice(1)] : baseCols;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="row" style={{ gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 200 }}>
            <div className="text-muted" style={{ fontSize: 12 }}>Zusammenfassung der Keyword-Suche</div>
            <div style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 10px' }}>„{summary.phrase}"</div>
            <div className="row" style={{ gap: 24 }}>
              <Stat label="Suchvolumen" value={number(summary.searchVolume)} />
              <Stat label="Cerebro IQ" value={number(summary.cerebroIQ)} />
              <Stat label="CPR" value={number(summary.cpr)} />
            </div>
          </div>

          <div style={{ minWidth: 220 }}>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>Keywordverteilung</div>
            <div className="row" style={{ gap: 20, flexWrap: 'wrap' }}>
              <Stat label="Keywords insgesamt" value={number(d.total)} />
              <Stat label="Organisch" value={number(d.organic)} />
              <Stat label="Bezahlt" value={number(d.paid)} />
              <Stat label="Amazon empfohlen" value={number(d.amazonRecommended)} />
            </div>
          </div>

          <div style={{ minWidth: 160 }}>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>Amazon Suchvol.</div>
            <div className="row" style={{ gap: 20 }}>
              <Stat label="Gesamt" value={number(summary.totalVolume)} />
              <Stat label="Durchschnitt" value={number(summary.averageVolume)} />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>Worthäufigkeit</div>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {summary.wordFrequency.map((w) => (
                <span key={w.word} className="chip" style={{ cursor: 'default' }}>
                  {w.word} <strong style={{ color: 'var(--primary)' }}>{w.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row between mb-2">
          <div className="card-title" style={{ margin: 0 }}>{number(keywords.length)} Keywords</div>
          {asins && asins.length > 0 && (
            <span className="text-muted" style={{ fontSize: 12 }}>„–" = Keyword-Lücke (rankt nicht)</span>
          )}
        </div>
        <Table columns={columns} rows={keywords} keyField="keyword" />
      </div>
    </div>
  );
}
