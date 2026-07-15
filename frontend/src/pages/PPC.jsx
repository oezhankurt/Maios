import { useEffect, useState } from 'react';
import { ProductAPI, PPCAPI } from '../api/api';
import CampaignList from '../components/ppc/CampaignList.jsx';
import BidOptimizer from '../components/ppc/BidOptimizer.jsx';
import PerformanceMetrics from '../components/ppc/PerformanceMetrics.jsx';
import SmartPortfolios from '../components/ppc/SmartPortfolios.jsx';
import AutomationRules from '../components/ppc/AutomationRules.jsx';
import Loading from '../components/layout/Loading.jsx';

const EMPTY = { productId: '', campaignName: '', campaignType: 'sp', dailyBudget: 20, targetAcos: 25 };

export default function PPC() {
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    const [prods, camps, pfs, rls] = await Promise.all([
      ProductAPI.list(), PPCAPI.campaigns(), PPCAPI.portfolios(), PPCAPI.rules(),
    ]);
    setProducts(prods);
    setCampaigns(camps);
    setPortfolios(pfs);
    setRules(rls);
    setSelected((prev) => camps.find((c) => c.id === prev?.id) || camps[0] || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await PPCAPI.create({ ...form, dailyBudget: Number(form.dailyBudget), targetAcos: Number(form.targetAcos) });
      setShowModal(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <Loading label="Loading campaigns…" />;

  return (
    <div>
      <div className="page-header">
        <h1>PPC Campaigns</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Campaign
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 20 }}>
        <SmartPortfolios portfolios={portfolios} onChange={load} />
        <AutomationRules rules={rules} portfolios={portfolios} onChange={load} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <CampaignList campaigns={campaigns} selectedId={selected?.id} onSelect={setSelected} />
      </div>

      {selected && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <BidOptimizer campaign={selected} onOptimized={load} />
          <PerformanceMetrics campaign={selected} />
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Campaign</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={create}>
              <div className="field">
                <label>Product</label>
                <select className="select" value={form.productId} onChange={set('productId')} required>
                  <option value="">Select…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Campaign Name</label>
                <input className="input" value={form.campaignName} onChange={set('campaignName')} required />
              </div>
              <div className="field">
                <label>Type</label>
                <select className="select" value={form.campaignType} onChange={set('campaignType')}>
                  <option value="sp">Sponsored Products</option>
                  <option value="sb">Sponsored Brands</option>
                  <option value="sd">Sponsored Display</option>
                </select>
              </div>
              <div className="row" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Daily Budget</label>
                  <input className="input" type="number" step="0.01" value={form.dailyBudget} onChange={set('dailyBudget')} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Target ACoS %</label>
                  <input className="input" type="number" step="0.1" value={form.targetAcos} onChange={set('targetAcos')} />
                </div>
              </div>
              <div className="row between mt-2">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
