import { useEffect, useState } from 'react';
import { ProductAPI } from '../../api/api';
import { currency } from '../../utils/format';

export default function PriceOptimizer({ product, onApply }) {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!product) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ProductAPI.priceRecommendation(product.id, { marketplace: 'amazon' });
      setRec(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) return null;

  const apply = async () => {
    await ProductAPI.update(product.id, { price: rec.recommendedPrice });
    if (onApply) onApply();
    load();
  };

  return (
    <div className="card">
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>
          Price Optimizer
        </div>
        <button className="btn btn-sm" onClick={load} disabled={loading}>
          {loading ? '…' : '↻'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {rec && (
        <>
          <div className="row between" style={{ padding: '6px 0' }}>
            <span className="text-muted">Current price</span>
            <span>{currency(rec.currentPrice)}</span>
          </div>
          <div className="row between" style={{ padding: '6px 0' }}>
            <span className="text-muted">Recommended</span>
            <strong style={{ color: 'var(--primary)' }}>{currency(rec.recommendedPrice)}</strong>
          </div>
          <div className="row between" style={{ padding: '6px 0' }}>
            <span className="text-muted">Margin floor</span>
            <span>{currency(rec.floorPrice)}</span>
          </div>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
            {rec.reason}
          </p>
          {rec.action !== 'hold' && (
            <button className="btn btn-primary mt-2" style={{ width: '100%' }} onClick={apply}>
              Apply {currency(rec.recommendedPrice)}
            </button>
          )}
        </>
      )}
    </div>
  );
}
