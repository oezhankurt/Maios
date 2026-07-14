import { useEffect, useState } from 'react';
import { ProductAPI } from '../api/api';
import ProductList from '../components/listings/ProductList.jsx';
import PriceOptimizer from '../components/listings/PriceOptimizer.jsx';
import CompetitorComparison from '../components/listings/CompetitorComparison.jsx';
import StockSync from '../components/listings/StockSync.jsx';
import Loading from '../components/layout/Loading.jsx';

const EMPTY = { title: '', asin: '', ean: '', category: '', price: 0, costPerUnit: 0, status: 'active' };

export default function Listings() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    const data = await ProductAPI.list();
    setProducts(data);
    setSelected((prev) => data.find((p) => p.id === prev?.id) || data[0] || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title || '',
      asin: product.asin || '',
      ean: product.ean || '',
      category: product.category || '',
      price: product.price || 0,
      costPerUnit: product.costPerUnit || 0,
      status: product.status || 'active',
    });
    setError(null);
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { ...form, price: Number(form.price), costPerUnit: Number(form.costPerUnit) };
    try {
      if (editing) await ProductAPI.update(editing.id, payload);
      else await ProductAPI.create(payload);
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product and all its data?')) return;
    await ProductAPI.remove(id);
    load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <Loading label="Loading listings…" />;

  return (
    <div>
      <div className="page-header">
        <h1>Listings</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ProductList
          products={products}
          selectedId={selected?.id}
          onSelect={setSelected}
          onEdit={openEdit}
          onDelete={remove}
        />
      </div>

      {selected && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <PriceOptimizer product={selected} onApply={load} />
            <StockSync product={selected} />
          </div>
          <CompetitorComparison product={selected} />
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={save}>
              <div className="field">
                <label>Title</label>
                <input className="input" value={form.title} onChange={set('title')} required />
              </div>
              <div className="row" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>ASIN</label>
                  <input className="input" value={form.asin} onChange={set('asin')} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>EAN</label>
                  <input className="input" value={form.ean} onChange={set('ean')} />
                </div>
              </div>
              <div className="field">
                <label>Category</label>
                <input className="input" value={form.category} onChange={set('category')} />
              </div>
              <div className="row" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Price</label>
                  <input className="input" type="number" step="0.01" value={form.price} onChange={set('price')} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Cost / Unit</label>
                  <input className="input" type="number" step="0.01" value={form.costPerUnit} onChange={set('costPerUnit')} />
                </div>
              </div>
              <div className="field">
                <label>Status</label>
                <select className="select" value={form.status} onChange={set('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="row between mt-2">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
