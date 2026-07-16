import { useState } from 'react';
import { ResearchAPI } from '../../api/api';
import Table from '../layout/Table.jsx';
import RangeFilter from './RangeFilter.jsx';
import PIndex from './PIndex.jsx';
import { currency, number } from '../../utils/format';

const SIZE_TIERS = [{ id: 'small', label: 'Klein' }, { id: 'standard', label: 'Standard' }, { id: 'oversize', label: 'Übergroß' }];
const FULFILLMENTS = ['FBA', 'FBM', 'AMZ'];
const EMPTY = {
  price: {}, revenue: {}, sales: {}, reviews: {}, rating: {}, sellers: {}, bsr: {},
};

function toggle(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function ProductsTab({ categories }) {
  const [f, setF] = useState(EMPTY);
  const [cats, setCats] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [fulfillment, setFulfillment] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const setRange = (k) => (v) => setF((prev) => ({ ...prev, [k]: v }));

  const reset = () => {
    setF(EMPTY); setCats([]); setSizes([]); setFulfillment([]); setRows([]); setSearched(false);
  };

  const search = async () => {
    setLoading(true);
    try {
      const data = await ResearchAPI.products({
        categories: cats, sizeTiers: sizes, fulfillment,
        priceMin: f.price.min, priceMax: f.price.max,
        revenueMin: f.revenue.min, revenueMax: f.revenue.max,
        salesMin: f.sales.min, salesMax: f.sales.max,
        reviewsMin: f.reviews.min, reviewsMax: f.reviews.max,
        ratingMin: f.rating.min, ratingMax: f.rating.max,
        sellersMin: f.sellers.min, sellersMax: f.sellers.max,
        bsrMin: f.bsr.min, bsrMax: f.bsr.max,
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
    { key: 'pIndex', label: 'P-Index', align: 'right', render: (r) => <PIndex value={r.pIndex} /> },
    { key: 'price', label: 'Preis', align: 'right', render: (r) => currency(r.price) },
    { key: 'monthlySales', label: 'Verkäufe/Mt.', align: 'right', render: (r) => number(r.monthlySales) },
    { key: 'monthlyRevenue', label: 'Umsatz/Mt.', align: 'right', render: (r) => currency(r.monthlyRevenue) },
    { key: 'reviews', label: 'Rezensionen', align: 'right', render: (r) => number(r.reviews) },
    { key: 'rating', label: 'Bewertung', align: 'right', render: (r) => `★ ${r.rating}` },
    { key: 'sellers', label: 'Verkäufer', align: 'right' },
    { key: 'bsr', label: 'BSR', align: 'right', render: (r) => `#${number(r.bsr)}` },
    { key: 'sizeLabel', label: 'Größe' },
    { key: 'fulfillment', label: 'Fulfill.' },
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Filter — aktive Produkte finden</div>

        <div className="field" style={{ marginBottom: 12 }}>
          <label>Kategorien</label>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${cats.includes(c) ? 'chip-active' : ''}`}
                onClick={() => setCats((prev) => toggle(prev, c))}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
          <RangeFilter label="Preis (€)" value={f.price} onChange={setRange('price')} step="0.01" />
          <RangeFilter label="Umsatz/Monat (€)" value={f.revenue} onChange={setRange('revenue')} />
          <RangeFilter label="Verkäufe/Monat" value={f.sales} onChange={setRange('sales')} />
          <RangeFilter label="Rezensionen" value={f.reviews} onChange={setRange('reviews')} />
          <RangeFilter label="Bewertung (★)" value={f.rating} onChange={setRange('rating')} step="0.1" />
          <RangeFilter label="Anzahl Verkäufer" value={f.sellers} onChange={setRange('sellers')} />
          <RangeFilter label="Best Seller Rank" value={f.bsr} onChange={setRange('bsr')} />
        </div>

        <div className="row" style={{ gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Größe</label>
            <div className="row" style={{ gap: 8 }}>
              {SIZE_TIERS.map((s) => (
                <button key={s.id} type="button" className={`chip ${sizes.includes(s.id) ? 'chip-active' : ''}`} onClick={() => setSizes((p) => toggle(p, s.id))}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Fulfillment</label>
            <div className="row" style={{ gap: 8 }}>
              {FULFILLMENTS.map((ff) => (
                <button key={ff} type="button" className={`chip ${fulfillment.includes(ff) ? 'chip-active' : ''}`} onClick={() => setFulfillment((p) => toggle(p, ff))}>
                  {ff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row between mt-2" style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={reset}>✕ Filter zurücksetzen</button>
          <button type="button" className="btn btn-primary" onClick={search} disabled={loading}>
            {loading ? 'Suche…' : '🔍 Suche'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row between mb-2">
          <div className="card-title" style={{ margin: 0 }}>
            {rows.length} Produkte gefunden
          </div>
          {rows.length > 0 && <span className="text-muted" style={{ fontSize: 12 }}>Sortiert nach Chance (P-Index)</span>}
        </div>
        <Table
          columns={columns}
          rows={rows}
          keyField="asin"
          empty={searched ? 'Keine Produkte für diese Filter. Weniger einschränken.' : 'Filter setzen und auf „Suche" klicken, um Produktchancen zu finden.'}
        />
      </div>
    </div>
  );
}
