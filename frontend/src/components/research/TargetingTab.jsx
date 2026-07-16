import { useState } from 'react';
import { ResearchAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import RangeFilter from './RangeFilter.jsx';
import PIndex from './PIndex.jsx';
import { currency, number } from '../../utils/format';

/**
 * Produkt-Targeting — given one or more ASINs, find related products to target
 * with Sponsored Products (Black Box "Produkt-Targeting" tab).
 */
export default function TargetingTab({ targetSources }) {
  const [asins, setAsins] = useState('');
  const [source, setSource] = useState(targetSources[0]?.id || 'amazon_suggested');
  const [price, setPrice] = useState({});
  const [reviews, setReviews] = useState({});
  const [rating, setRating] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ResearchAPI.targeting({
        asins, source,
        filters: {
          priceMin: price.min, priceMax: price.max,
          reviewsMin: reviews.min, reviewsMax: reviews.max,
          ratingMin: rating.min, ratingMax: rating.max,
        },
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
          <div className="text-muted" style={{ fontSize: 12 }}>{r.asin} · {r.category}</div>
        </div>
      ),
    },
    { key: 'source', label: 'Quelle', render: (r) => <span className="badge badge-info">{r.source}</span> },
    { key: 'pIndex', label: 'P-Index', align: 'right', render: (r) => <PIndex value={r.pIndex} /> },
    { key: 'price', label: 'Preis', align: 'right', render: (r) => currency(r.price) },
    { key: 'asinSales', label: 'ASIN-Verkauf', align: 'right', render: (r) => number(r.asinSales) },
    { key: 'asinRevenue', label: 'ASIN-Umsatz', align: 'right', render: (r) => currency(r.asinRevenue) },
    { key: 'reviews', label: 'Rezensionen', align: 'right', render: (r) => number(r.reviews) },
    { key: 'rating', label: 'Bewertung', align: 'right', render: (r) => `★ ${r.rating}` },
    { key: 'bsr', label: 'BSR', align: 'right', render: (r) => `#${number(r.bsr)}` },
  ];

  return (
    <div>
      <form onSubmit={search} className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Produkt-Targeting</div>
        <div className="field">
          <label>ASINs (durch Komma getrennt)</label>
          <input className="input" value={asins} onChange={(e) => setAsins(e.target.value)} placeholder="z.B. B0ABCD1234, B0EFGH5678" />
        </div>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ minWidth: 220, margin: 0 }}>
            <label>Quelle</label>
            <select className="select" value={source} onChange={(e) => setSource(e.target.value)}>
              {targetSources.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <RangeFilter label="Preis (€)" value={price} onChange={setPrice} step="0.01" />
          <RangeFilter label="Rezensionen" value={reviews} onChange={setReviews} />
          <RangeFilter label="Ø Bewertung (★)" value={rating} onChange={setRating} step="0.1" />
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Suche…' : '🔍 Suche'}</button>
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
          Leer lassen für ein Demo-Beispiel. Findet verwandte Produkte, die du mit Sponsored Products anvisieren kannst.
        </div>
      </form>

      {result && (
        <div className="card">
          <div className="card-title">
            {result.products.length} verwandte Produkte · Quelle: {result.source}
          </div>
          <Table columns={columns} rows={result.products} keyField="asin" empty="Keine verwandten Produkte." />
        </div>
      )}
    </div>
  );
}
