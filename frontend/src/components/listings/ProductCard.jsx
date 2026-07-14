import { currency } from '../../utils/format';

const STATUS_BADGE = { active: 'badge-success', inactive: 'badge-warning', archived: 'badge-muted' };

export default function ProductCard({ product, onEdit, onDelete, onSelect, selected }) {
  return (
    <div
      className="card"
      style={{ borderColor: selected ? 'var(--primary)' : 'var(--border)', cursor: 'pointer' }}
      onClick={() => onSelect && onSelect(product)}
    >
      <div className="row between">
        <span style={{ fontWeight: 700 }}>{product.title}</span>
        <span className={`badge ${STATUS_BADGE[product.status] || 'badge-muted'}`}>{product.status}</span>
      </div>
      <div className="text-muted mt-2" style={{ fontSize: 13 }}>
        {product.asin || 'no ASIN'} · {product.category || 'uncategorized'}
      </div>
      <div className="row between mt-2">
        <span>
          Price <strong>{currency(product.price)}</strong>
        </span>
        <span className="text-muted">Cost {currency(product.costPerUnit)}</span>
      </div>
      {(onEdit || onDelete) && (
        <div className="row mt-2" style={{ gap: 8 }}>
          {onEdit && (
            <button
              className="btn btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
