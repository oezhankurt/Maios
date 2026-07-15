import { useEffect, useState } from 'react';
import { KeywordAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import { currency, number } from '../../utils/format';

const TIER_BADGE = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };
const TIER_LABEL = { easy: 'leicht', medium: 'mittel', hard: 'schwer' };

function oppColor(v) {
  if (v >= 70) return '#22c55e';
  if (v >= 45) return '#f59e0b';
  return '#ef4444';
}

function Opportunity({ value }) {
  return (
    <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
      <div style={{ width: 46, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: oppColor(value) }} />
      </div>
      <strong style={{ color: oppColor(value), width: 24, textAlign: 'right' }}>{value}</strong>
    </div>
  );
}

function TrendCell({ trend }) {
  if (trend === 'improving') return <span className="text-success">▲ steigt</span>;
  if (trend === 'declining') return <span className="text-danger">▼ fällt</span>;
  if (trend === 'stable') return <span className="text-muted">— stabil</span>;
  return <span className="text-muted">—</span>;
}

/**
 * Keyword Master — the keyword workspace: research ideas (with opportunity
 * scoring + bulk-track) and a master table of tracked keywords enriched with
 * rank, trend, difficulty and opportunity.
 */
export default function KeywordMaster({ product, onSelectKeyword }) {
  const [master, setMaster] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [seed, setSeed] = useState(product?.title || '');
  const [researching, setResearching] = useState(false);
  const [tierFilter, setTierFilter] = useState('all');
  const [busy, setBusy] = useState(false);

  const loadMaster = () => {
    if (!product) return;
    KeywordAPI.master(product.id).then(setMaster).catch(() => setMaster([]));
  };

  useEffect(() => {
    setSeed(product?.title || '');
    setIdeas([]);
    loadMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const research = async (e) => {
    e.preventDefault();
    setResearching(true);
    try {
      const data = await KeywordAPI.research({ productTitle: seed, category: product?.category });
      const tracked = new Set(master.map((m) => m.keyword.toLowerCase()));
      setIdeas(data.filter((d) => !tracked.has(d.keyword.toLowerCase())));
    } finally {
      setResearching(false);
    }
  };

  const trackOne = async (row) => {
    await KeywordAPI.bulkCreate({ productId: product.id, keywords: [row] });
    setIdeas((prev) => prev.filter((i) => i.keyword !== row.keyword));
    loadMaster();
  };

  const trackTopOpportunities = async () => {
    const top = ideas.filter((i) => i.opportunity >= 60);
    if (top.length === 0) return;
    setBusy(true);
    try {
      await KeywordAPI.bulkCreate({ productId: product.id, keywords: top });
      const names = new Set(top.map((t) => t.keyword));
      setIdeas((prev) => prev.filter((i) => !names.has(i.keyword)));
      loadMaster();
    } finally {
      setBusy(false);
    }
  };

  const removeKw = async (id) => {
    await KeywordAPI.remove(id);
    loadMaster();
  };

  if (!product) return <div className="card empty">Wähle ein Produkt, um den Keyword Master zu nutzen.</div>;

  const filtered = tierFilter === 'all' ? master : master.filter((m) => m.difficultyTier === tierFilter);

  const tierBadge = (t) => <span className={`badge ${TIER_BADGE[t]}`}>{TIER_LABEL[t]}</span>;

  const masterCols = [
    {
      key: 'keyword', label: 'Keyword',
      render: (r) => (
        <button
          onClick={() => onSelectKeyword && onSelectKeyword(r.id)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontWeight: 600 }}
        >
          {r.keyword}
        </button>
      ),
    },
    { key: 'searchVolume', label: 'Volumen', align: 'right', render: (r) => number(r.searchVolume) },
    { key: 'cpc', label: 'CPC', align: 'right', render: (r) => currency(r.cpc) },
    { key: 'difficultyTier', label: 'Schwierigkeit', render: (r) => tierBadge(r.difficultyTier) },
    { key: 'rank', label: 'Rang', align: 'right', render: (r) => (r.rank != null ? `#${r.rank}` : '—') },
    { key: 'trend', label: 'Trend', render: (r) => <TrendCell trend={r.trend} /> },
    { key: 'opportunity', label: 'Chance', align: 'right', render: (r) => <Opportunity value={r.opportunity} /> },
    { key: 'x', label: '', align: 'right', render: (r) => <button className="btn btn-sm btn-danger" style={{ padding: '2px 8px' }} onClick={() => removeKw(r.id)}>✕</button> },
  ];

  const ideaCols = [
    { key: 'keyword', label: 'Keyword-Idee' },
    { key: 'searchVolume', label: 'Volumen', align: 'right', render: (r) => number(r.searchVolume) },
    { key: 'cpc', label: 'CPC', align: 'right', render: (r) => currency(r.cpc) },
    { key: 'difficultyTier', label: 'Schwierigkeit', render: (r) => tierBadge(r.difficultyTier) },
    { key: 'opportunity', label: 'Chance', align: 'right', render: (r) => <Opportunity value={r.opportunity} /> },
    { key: 'add', label: '', align: 'right', render: (r) => <button className="btn btn-sm btn-primary" onClick={() => trackOne(r)}>+ Track</button> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Research / ideas */}
      <div className="card">
        <div className="card-title">Keyword-Recherche</div>
        <form onSubmit={research} className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: ideas.length ? 14 : 0 }}>
          <input className="input" style={{ flex: 2, minWidth: 220 }} value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Seed / Produkt-Titel" required />
          <button className="btn btn-primary" disabled={researching}>{researching ? 'Suche…' : 'Ideen finden'}</button>
          {ideas.length > 0 && (
            <button type="button" className="btn" onClick={trackTopOpportunities} disabled={busy}>
              ⭐ Top-Chancen tracken ({ideas.filter((i) => i.opportunity >= 60).length})
            </button>
          )}
        </form>
        {ideas.length > 0 && <Table columns={ideaCols} rows={ideas} keyField="keyword" />}
      </div>

      {/* Master table */}
      <div className="card">
        <div className="row between mb-2">
          <div className="card-title" style={{ margin: 0 }}>Keyword Master — {master.length} getrackt</div>
          <select className="select" style={{ width: 160 }} value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
            <option value="all">Alle Schwierigkeiten</option>
            <option value="easy">Nur leicht</option>
            <option value="medium">Nur mittel</option>
            <option value="hard">Nur schwer</option>
          </select>
        </div>
        <Table columns={masterCols} rows={filtered} empty="Noch keine Keywords getrackt — finde oben Ideen." />
      </div>
    </div>
  );
}
