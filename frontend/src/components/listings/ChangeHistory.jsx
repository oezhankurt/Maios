import { useEffect, useState } from 'react';
import { ProductAPI } from '../../api/api';

const FIELD_LABEL = {
  title: 'Titel', price: 'Preis', bullets: 'Bullet Points',
  description: 'Beschreibung', backendKeywords: 'Backend-Keywords',
};

function trunc(s, n = 60) {
  if (!s) return '—';
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/**
 * Change history for a product — logs listing/price edits so their impact can
 * be reviewed. (Before/after conversion impact activates with live data.)
 */
export default function ChangeHistory({ product, refreshKey }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!product) return;
    ProductAPI.changes(product.id).then(setRows).catch(() => setRows([]));
  }, [product?.id, refreshKey]);

  if (!product) return null;

  return (
    <div className="card">
      <div className="card-title">Änderungs-Historie</div>
      {rows.length === 0 ? (
        <div className="empty" style={{ padding: 18, fontSize: 13 }}>
          Noch keine Änderungen erfasst. Titel/Preis/Bullets-Änderungen werden hier getrackt,
          um Vorher/Nachher zu messen.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, fontSize: 13 }}>
              <div className="row between">
                <span style={{ fontWeight: 600 }}>{FIELD_LABEL[r.field] || r.field}</span>
                <span className="text-muted" style={{ fontSize: 11 }}>
                  {new Date(r.createdAt).toLocaleString('de-DE')}
                </span>
              </div>
              <div className="text-muted" style={{ marginTop: 3 }}>
                <span style={{ textDecoration: 'line-through' }}>{trunc(r.oldValue)}</span>
                {'  →  '}
                <span style={{ color: 'var(--text)' }}>{trunc(r.newValue)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
