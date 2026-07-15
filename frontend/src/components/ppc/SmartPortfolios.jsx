import { useState } from 'react';
import { PPCAPI } from '../../api/api';
import { currency, percent } from '../../utils/format';

const EMPTY = {
  name: '', targetAcos: 15, dailyBudget: 100,
  campaignTypes: ['sp'], staEnabled: false, pboEnabled: false,
};
const TYPES = [
  { v: 'sp', l: 'Sponsored Products' },
  { v: 'sb', l: 'Sponsored Brands' },
  { v: 'sd', l: 'Sponsored Display' },
];

export default function SmartPortfolios({ portfolios, onChange }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleType = (v) =>
    setForm({
      ...form,
      campaignTypes: form.campaignTypes.includes(v)
        ? form.campaignTypes.filter((t) => t !== v)
        : [...form.campaignTypes, v],
    });

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await PPCAPI.createPortfolio({
        ...form,
        targetAcos: Number(form.targetAcos),
        dailyBudget: Number(form.dailyBudget),
      });
      setShowModal(false);
      setForm(EMPTY);
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Smart Portfolio löschen?')) return;
    await PPCAPI.deletePortfolio(id);
    onChange();
  };

  const optimize = async () => {
    setOptimizing(true);
    try {
      await PPCAPI.optimizePortfolios();
      onChange();
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="card">
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>Smart Portfolios</div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm" onClick={optimize} disabled={optimizing}>
            {optimizing ? 'Optimiere…' : '⚡ Alle optimieren'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Smart Portfolio
          </button>
        </div>
      </div>

      {portfolios.length === 0 ? (
        <div className="empty" style={{ padding: 24 }}>
          Noch keine Smart Portfolios. Lege eins mit Ziel-ACoS an.
        </div>
      ) : (
        <div className="grid grid-3">
          {portfolios.map((p) => (
            <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
              <div className="row between">
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                <button
                  className="btn btn-sm btn-danger"
                  style={{ padding: '2px 8px' }}
                  onClick={() => remove(p.id)}
                >
                  ✕
                </button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-info">Ziel-ACoS {percent(p.targetAcos)}</span>
                <span className="badge badge-muted">{currency(p.dailyBudget)}/Tag</span>
              </div>
              <div className="row between mt-2" style={{ fontSize: 13 }}>
                <span className="text-muted">{p.campaignCount} Kampagnen</span>
                <span className="row" style={{ gap: 6 }}>
                  {p.staEnabled && <span className="badge badge-success" style={{ fontSize: 10 }}>STA</span>}
                  {p.pboEnabled && <span className="badge badge-success" style={{ fontSize: 10 }}>PBO</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Neues Smart Portfolio</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={create}>
              <div className="field">
                <label>Name</label>
                <input className="input" value={form.name} onChange={set('name')} required />
              </div>
              <div className="row" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Ziel-ACoS %</label>
                  <input className="input" type="number" step="0.1" value={form.targetAcos} onChange={set('targetAcos')} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Tagesbudget</label>
                  <input className="input" type="number" step="0.01" value={form.dailyBudget} onChange={set('dailyBudget')} />
                </div>
              </div>
              <div className="field">
                <label>Kampagnentypen</label>
                <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                  {TYPES.map((t) => (
                    <label key={t.v} className="row" style={{ gap: 6, fontSize: 13 }}>
                      <input type="checkbox" checked={form.campaignTypes.includes(t.v)} onChange={() => toggleType(t.v)} />
                      {t.l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="row" style={{ gap: 20 }}>
                <label className="row" style={{ gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={form.staEnabled} onChange={(e) => setForm({ ...form, staEnabled: e.target.checked })} />
                  STA (Search Term Automation)
                </label>
                <label className="row" style={{ gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={form.pboEnabled} onChange={(e) => setForm({ ...form, pboEnabled: e.target.checked })} />
                  PBO (Product Bid Opt.)
                </label>
              </div>
              <div className="row between mt-2">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" disabled={saving}>{saving ? 'Speichern…' : 'Erstellen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
