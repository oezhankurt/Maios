export default function ProductPicker({ products = [], value, onChange, allowAll = false }) {
  return (
    <select className="select" style={{ maxWidth: 320 }} value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      {allowAll && <option value="">All products</option>}
      {!allowAll && !value && <option value="">Select a product…</option>}
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.title}
        </option>
      ))}
    </select>
  );
}
