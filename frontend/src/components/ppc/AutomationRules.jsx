import { useEffect, useState } from 'react';
import { PPCAPI } from '../../api/api';

const EMPTY = { name: '', logic: 'all', targetPortfolioId: '', conditions: [{ field: '', operator: '', value: '' }] };

function conditionSummary(c, fieldsMeta, opsMeta) {
  const f = fieldsMeta.find((x) => x.value === c.field);
  const type = f?.type || 'number';
  const op = (opsMeta[type] || []).find((o) => o.value === c.operator);
  return `${f?.label || c.field} ${op?.label || c.operator} ${c.value}`;
}

export default function AutomationRules({ rules, portfolios, onChange }) {
  const [meta, setMeta] = useState({ fields: [], operators: {} });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [runMsg, setRunMsg] = useState(null);

  useEffect(() => {
    PPCAPI.ruleFields().then(setMeta).catch(() => {});
  }, []);

  const fieldType = (fieldValue) => meta.fields.find((f) => f.value === fieldValue)?.type || 'number';
  const fieldOptions = (fieldValue) => meta.fields.find((f) => f.value === fieldValue)?.options || [];

  const setCond = (i, key, value) => {
    const conditions = form.conditions.map((c, idx) => {
      if (idx !== i) return c;
      const next = { ...c, [key]: value };
      if (key === 'field') { next.operator = ''; next.value = ''; } // reset when field changes
      return next;
    });
    setForm({ ...form, conditions });
  };
  const addCond = () => setForm({ ...form, conditions: [...form.conditions, { field: '', operator: '', value: '' }] });
  const removeCond = (i) => setForm({ ...form, conditions: form.conditions.filter((_, idx) => idx !== i) });

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await PPCAPI.createRule({
        name: form.name,
        logic: form.logic,
        targetPortfolioId: form.targetPortfolioId,
        conditions: form.conditions.filter((c) => c.field && c.operator && c.value !== ''),
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
    if (!window.confirm('Automation löschen?')) return;
    await PPCAPI.deleteRule(id);
    onChange();
  };

  const toggleActive = async (r) => {
    await PPCAPI.updateRule(r.id, { active: !r.active });
    onChange();
  };

  const runNow = async () => {
    setRunning(true);
    setRunMsg(null);
    try {
      const res = await PPCAPI.runRules();
      setRunMsg(`Automatik gelaufen: ${res.count} Kampagne(n) verschoben.`);
      onChange();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card">
      <div className="row between mb-2">
        <div className="card-title" style={{ margin: 0 }}>Automation (Campaign Mover)</div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm" onClick={runNow} disabled={running}>
            {running ? 'Läuft…' : '▶ Jetzt ausführen'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setShowModal(true); }}>
            + Automation
          </button>
        </div>
      </div>

      {runMsg && <div className="badge badge-success" style={{ marginBottom: 10 }}>{runMsg}</div>}

      {rules.length === 0 ? (
        <div className="empty" style={{ padding: 24 }}>
          Noch keine Regeln. Erstelle eine, um Kampagnen automatisch in ein Smart Portfolio zu verschieben.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rules.map((r) => (
            <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
              <div className="row between">
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    className={`badge ${r.active ? 'badge-success' : 'badge-muted'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => toggleActive(r)}
                  >
                    {r.active ? 'aktiv' : 'pausiert'}
                  </button>
                  <button className="btn btn-sm btn-danger" style={{ padding: '2px 8px' }} onClick={() => remove(r.id)}>✕</button>
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                WENN {r.logic === 'any' ? 'eine' : 'alle'}: {(r.conditions || []).map((c) => conditionSummary(c, meta.fields, meta.operators)).join(r.logic === 'any' ? '  ODER  ' : '  UND  ')}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                → <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{r.targetPortfolio?.name || 'Portfolio'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <h2>Automation erstellen</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={create}>
              <div className="field">
                <label>Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="field">
                <label>Bedingungen — trifft zu, wenn
                  <select
                    className="select"
                    style={{ display: 'inline-block', width: 'auto', margin: '0 6px', padding: '2px 6px' }}
                    value={form.logic}
                    onChange={(e) => setForm({ ...form, logic: e.target.value })}
                  >
                    <option value="all">ALLE</option>
                    <option value="any">EINE</option>
                  </select>
                  zutreffen:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.conditions.map((c, i) => (
                    <div key={i} className="row" style={{ gap: 8 }}>
                      <select className="select" value={c.field} onChange={(e) => setCond(i, 'field', e.target.value)} required>
                        <option value="">Feld…</option>
                        {meta.fields.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <select className="select" style={{ maxWidth: 130 }} value={c.operator} onChange={(e) => setCond(i, 'operator', e.target.value)} required disabled={!c.field}>
                        <option value="">Op…</option>
                        {(meta.operators[fieldType(c.field)] || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      {fieldType(c.field) === 'enum' ? (
                        <select className="select" style={{ maxWidth: 130 }} value={c.value} onChange={(e) => setCond(i, 'value', e.target.value)} required>
                          <option value="">Wert…</option>
                          {fieldOptions(c.field).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input className="input" style={{ maxWidth: 130 }} placeholder="Wert" value={c.value} onChange={(e) => setCond(i, 'value', e.target.value)} required />
                      )}
                      <button type="button" className="btn btn-sm" onClick={() => removeCond(i)} disabled={form.conditions.length === 1}>🗑</button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-sm mt-2" onClick={addCond}>+ Bedingung hinzufügen</button>
              </div>

              <div className="field">
                <label>Ziel Smart Portfolio</label>
                <select className="select" value={form.targetPortfolioId} onChange={(e) => setForm({ ...form, targetPortfolioId: e.target.value })} required>
                  <option value="">Portfolio wählen…</option>
                  {portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="row between mt-2">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" disabled={saving || portfolios.length === 0}>{saving ? 'Speichern…' : 'Erstellen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
