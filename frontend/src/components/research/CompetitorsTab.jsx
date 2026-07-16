import { useState } from 'react';
import { ResearchAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import RangeFilter from './RangeFilter.jsx';
import PIndex from './PIndex.jsx';
import { currency, number } from '../../utils/format';

export default function CompetitorsTab() {
  const [asin, setAsin] = useState('');
  const [price, setPrice] = useState({});
  const [reviews, setReviews] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ResearchAPI.competitors({
        asin: asin.trim(),
        filters: { priceMin: price.min, priceMax: price.max, reviewsMin: reviews.min, reviewsMax: reviews.max },
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'title', label: 'Produkt',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.title}</div>
          <div className="text-muted" style={{ fontSize: 12 }}>{r.asin}</div>
        </div>
      ),
    },
    { key: 'pIndex', label: 'P-Index', align: 'right', render: (r) => <PIndex value={r.pIndex} /> },
    { key: 'price', label: 'Preis', align: 'right', render: (r) => currency(r.price) },
    { key: 'monthlySales', label: 'Verkäufe/Mt.', align: 'right', render: (r) => number(r.monthlySales) },
    { key: 'monthlyRevenue', label: 'Umsatz/Mt.', align: 'right', render: (r) => currency(r.monthlyRevenue) },
    { key: 'reviews', label: 'Rezensionen', align: 'right', render: (r) => number(r.reviews) },
    { key: 'rating', label: 'Bewertung', align: 'right', render: (r) => `★ ${r.rating}` },
    { key: 'bsr', label: 'BSR', align: 'right', render: (r) => `#${number(r.bsr)}` },
  ];

  return (
    <div>
      <form onSubmit={search} className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Wettbewerber nach ASIN</div>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 2, minWidth: 220, margin: 0 }}>
            <label>ASIN</label>
            <input className="input" value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="z.B. B0ABCD1234" />
          </div>
          <RangeFilter label="Preis (€)" value={price} onChange={setPrice} step="0.01" />
          <RangeFilter label="Rezensionen" value={reviews} onChange={setReviews} />
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Suche…' : '🔍 Analysieren'}</button>
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
          Leer lassen für ein Demo-Beispiel. Zeigt alle konkurrierenden Angebote in der Kategorie.
        </div>
      </form>

      {result && (
        <div className="card">
          <div className="row between mb-2">
            <div className="card-title" style={{ margin: 0 }}>
              Wettbewerb in „{result.category}" — {result.competitors.length} Angebote
            </div>
          </div>
          <Table columns={columns} rows={result.competitors} keyField="asin" empty="Keine Wettbewerber." />
        </div>
      )}
    </div>
  );
}
