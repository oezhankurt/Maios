import ProductCard from './ProductCard.jsx';

export default function ProductList({ products = [], selectedId, onSelect, onEdit, onDelete }) {
  if (products.length === 0) {
    return <div className="card empty">No products yet. Add your first product to get started.</div>;
  }
  return (
    <div className="grid grid-3">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          selected={p.id === selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
