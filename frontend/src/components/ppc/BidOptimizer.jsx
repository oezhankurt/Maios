import { useState } from 'react';
import { PPCAPI } from '../../api/api';
import { currency, percent } from '../../utils/format';

export default function BidOptimizer({ campaign, onOptimized }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PPCAPI.optimize({ campaignId: campaign.id });
      setResult(data[0]);
      if (onOptimized) onOptimized();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>
          Bid Optimizer
        </div>
        <button className="btn btn-primary btn-sm" onClick={run} disabled={loading}>
          {loading ? 'Optimizing…' : '⚡ Auto-Optimize'}
        </button>
      </div>
      <p className="text-muted" style={{ fontSize: 13 }}>
        Adjusts the daily budget based on the campaign's trailing-7-day ACoS versus its target.
      </p>

      {error && <div className="error-banner mt-2">{error}</div>}

      {result && (
        <div className="mt-2" style={{ fontSize: 14 }}>
          <div className="row between" style={{ padding: '6px 0' }}>
            <span className="text-muted">Action</span>
            <span
              className={`badge ${
                result.action === 'increase'
                  ? 'badge-success'
                  : result.action === 'decrease'
                  ? 'badge-danger'
                  : 'badge-muted'
              }`}
            >
              {result.action}
            </span>
          </div>
          <div className="row between" style={{ padding: '6px 0' }}>
            <span className="text-muted">Actual ACoS</span>
            <span>{percent(result.actualAcos)}</span>
          </div>
          <div className="row between" style={{ padding: '6px 0' }}>
            <span className="text-muted">Budget</span>
            <span>
              {currency(result.previousBudget)} → <strong>{currency(result.newBudget)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
