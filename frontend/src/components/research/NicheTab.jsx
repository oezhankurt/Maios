import { useState } from 'react';
import { ResearchAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import RangeFilter from './RangeFilter.jsx';
import { currency, number } from '../../utils/format';

function toggle(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/**
 * Nische — a market segment defined by a keyword phrase, with parent-level vs.
 * child-ASIN sales/revenue splits (Black Box "Nische" tab).
 */
export default function NicheTab({ categories, sizeTiers }) {
  const [phrase, setPhrase] = useState('');
  const [cats, setCats] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [parentRev, setParentRev] = useState({});
  const [asinRev, setAsinRev] = useState({});
  const [price, setPrice] = useState({});
  const [reviews, setReviews] = useState({});
  const [rating, setRating] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ResearchAPI.niche({
        phrase,
        filters: {
          categories: cats, sizeTiers: sizes,
          parentRevMin: parentRev.min, parentRevMax: parentRev.max,
          asinRevMin: asinRev.min, asinRevMax: asinRev.max,
          priceMin: price.min, priceMax: price.max,
          reviewsMin: reviews.min, reviewsMax: reviews.max,
          ratingMin: rating.min, ratingMax: rating.max,
        },
      });
      setRows(data);
      setSearched(true);
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
    { key: 'sellers', label: 'Verkäufer', align: 'right' },
    { key: 'price', label: 'Preis', align: 'right', render: (r) => currency(r.price) },
    { key: 'parentSales', label: 'Verkauf (Eltern)', align: 'right', render: (r) => number(r.parentSales) },
    { key: 'asinSales', label: 'ASIN-Verkauf', align: 'right', render: (r) => number(r.asinSales) },
    { key: 'parentRevenue', label: 'Umsatz (Eltern)', align: 'right', render: (r) => currency(r.parentRevenue) },
    { key: 'asinRevenue', label: 'ASIN-Umsatz', align: 'right', render: (r) => currency(r.asinRevenue) },
    { key: 'bsr', label: 'BSR', align: 'right', render: (r) => `#${number(r.bsr)}` },
    { key: 'rating', label: 'Bewertung', align: 'right', render: (r) => `★ ${r.rating}` },
  ];

  return (
    <div>
      <form onSubmit={search} className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Nische nach Phrase</div>
        <div className="field">
          <label>Phrase</label>
          <input className="input" value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="z.B. bamboo cutting board" required />
        </div>

        <div className="field">
          <label>Kategorien</label>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button key={c} type="button" className={`chip ${cats.includes(c) ? 'chip-active' : ''}`} onClick={() => setCats((p) => toggle(p, c))}>{c}</button>
            ))}
          </div>
        </div>

        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
          <RangeFilter label="Umsatz Elternebene (€)" value={parentRev} onChange={setParentRev} />
          <RangeFilter label="ASIN-Umsatz (€)" value={asinRev} onChange={setAsinRev} />
          <RangeFilter label="Preis (€)" value={price} onChange={setPrice} step="0.01" />
          <RangeFilter label="Bewertungsanzahl" value={reviews} onChange={setReviews} />
          <RangeFilter label="Ø Bewertung (★)" value={rating} onChange={setRating} step="0.1" />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Versandgrößenkategorie</label>
          <div className="row" style={{ gap: 8 }}>
            {sizeTiers.map((s) => (
              <button key={s.id} type="button" className={`chip ${sizes.includes(s.id) ? 'chip-active' : ''}`} onClick={() => setSizes((p) => toggle(p, s.id))}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Suche…' : '🔍 Suche'}</button>
        </div>
      </form>

      <div className="card">
        <div className="card-title">{rows.length} Produkte gefunden</div>
        <Table columns={columns} rows={rows} keyField="asin" empty={searched ? 'Keine Produkte in dieser Nische.' : 'Phrase eingeben und suchen, um ein Marktsegment zu analysieren.'} />
      </div>
    </div>
  );
}
