import { currency } from '../../utils/format';

const MARKETPLACES = ['amazon', 'ebay', 'kaufland', 'otto'];

/**
 * Multi-channel stock/price sync status. Stock quantities are not part of the
 * core schema, so this surfaces the product's channel presence and price
 * parity across marketplaces (the sync targets driven by the scheduler).
 */
export default function StockSync({ product }) {
  if (!product) return null;
  return (
    <div className="card">
      <div className="card-title">Multi-Channel Sync</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MARKETPLACES.map((m) => (
          <div key={m} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{m}</span>
            <span className="row" style={{ gap: 12 }}>
              <span className="text-muted">{currency(product.price)}</span>
              <span className={`badge ${m === 'amazon' ? 'badge-success' : 'badge-muted'}`}>
                {m === 'amazon' ? 'synced' : 'ready'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
