import { useState } from 'react';
import { ResearchAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import RangeFilter from './RangeFilter.jsx';
import PIndex from './PIndex.jsx';
import { currency, number } from '../../utils/format';

const TIER_BADGE = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };
const TIER_LABEL = { easy: 'leicht', medium: 'mittel', hard: 'schwer' };

export default function KeywordsTab({ categories }) {
  const [seed, setSeed] = useState('');
  const [category, setCategory] = useState('');
  const [volume, setVolume] = useState({});
  const [words, setWords] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ResearchAPI.keywords({
        seed, category,
        volumeMin: volume.min, volumeMax: volume.max,
        wordsMin: words.min, wordsMax: words.max,
      });
      setRows(data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'keyword', label: 'Keyword', render: (r) => <span style={{ fontWeight: 600 }}>{r.keyword}</span> },
    { key: 'searchVolume', label: 'Suchvolumen', align: 'right', render: (r) => number(r.searchVolume) },
    { key: 'cpc', label: 'CPC', align: 'right', render: (r) => currency(r.cpc) },
    { key: 'difficultyTier', label: 'Schwierigkeit', render: (r) => <span className={`badge ${TIER_BADGE[r.difficultyTier]}`}>{TIER_LABEL[r.difficultyTier]}</span> },
    { key: 'opportunity', label: 'Chance', align: 'right', render: (r) => <PIndex value={r.opportunity} /> },
  ];

  return (
    <div>
      <form onSubmit={search} className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Keyword-Recherche</div>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 2, minWidth: 220, margin: 0 }}>
            <label>Seed-Keyword / Produkt</label>
            <input className="input" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="z.B. yoga mat" required />
          </div>
          <div className="field" style={{ minWidth: 180, margin: 0 }}>
            <label>Kategorie (optional)</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Alle</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <RangeFilter label="Suchvolumen" value={volume} onChange={setVolume} />
          <RangeFilter label="Wortanzahl" value={words} onChange={setWords} />
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Suche…' : '🔍 Suche'}</button>
        </div>
      </form>

      <div className="card">
        <div className="card-title">{rows.length} Keywords</div>
        <Table
          columns={columns}
          rows={rows}
          keyField="keyword"
          empty={searched ? 'Keine Keywords für diese Filter.' : 'Seed eingeben und suchen, um Keyword-Chancen zu finden.'}
        />
      </div>
    </div>
  );
}
