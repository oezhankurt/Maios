import { useState } from 'react';
import { CerebroAPI } from '../api/api';
import CerebroResults from '../components/cerebro/CerebroResults.jsx';
import Loading from '../components/layout/Loading.jsx';
import './Cerebro.css';

const ASIN_RE = /^B0[A-Z0-9]{8}$/i;

/**
 * Cerebro — reverse-ASIN & keyword expansion (Helium 10 style). "Finden" takes
 * ASINs (see which keywords competitors rank for + gaps) or a keyword;
 * "Analysieren" takes a pasted keyword list.
 */
export default function Cerebro() {
  const [mode, setMode] = useState('find'); // 'find' | 'analyze'
  const [input, setInput] = useState('');
  const [pasted, setPasted] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runFind = async (e) => {
    e.preventDefault();
    const tokens = input.split(/[\s,;]+/).map((t) => t.trim()).filter(Boolean);
    const asins = tokens.filter((t) => ASIN_RE.test(t));
    setLoading(true);
    try {
      const res = asins.length
        ? await CerebroAPI.search({ asins })
        : await CerebroAPI.search({ keyword: input.trim() });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const runAnalyze = async (e) => {
    e.preventDefault();
    const keywords = pasted.split(/\r?\n|,/).map((k) => k.trim()).filter(Boolean);
    setLoading(true);
    try {
      setData(await CerebroAPI.analyze({ keywords }));
    } finally {
      setLoading(false);
    }
  };

  const example = (v) => () => setInput(v);

  return (
    <div>
      <div className="page-header">
        <h1>Cerebro · Reverse-ASIN</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Finde leistungsstarke Keywords nach ASIN oder Keyword · Demo</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row" style={{ gap: 8, marginBottom: 14 }}>
          <button className={`chip ${mode === 'find' ? 'chip-active' : ''}`} onClick={() => setMode('find')}>Schlüsselwörter finden</button>
          <button className={`chip ${mode === 'analyze' ? 'chip-active' : ''}`} onClick={() => setMode('analyze')}>Schlüsselwörter analysieren</button>
        </div>

        {mode === 'find' ? (
          <form onSubmit={runFind}>
            <div className="row" style={{ gap: 10 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Keyword eingeben oder bis zu 10 ASINs (durch Komma) für den Keyword-Vergleich"
              />
              <button className="btn btn-primary" disabled={loading || !input.trim()}>Keywords abrufen</button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: '1fr auto 1fr', gap: 20, marginTop: 16, alignItems: 'center' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>📦 Mit Produkten (ASINs) beginnen</div>
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  Sieh, für welche Keywords Produkte ranken. Bis zu 10 ASINs → Top-Keywords aufdecken und Lücken finden.
                </div>
                <div style={{ fontSize: 13 }}>
                  z.B.{' '}
                  {['B00G5M75UK', 'B00MWENGGM', 'B01MUXL5V8'].map((a, i) => (
                    <span key={a}>
                      <button type="button" className="linklike" onClick={example(a)}>{a}</button>{i < 2 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-muted" style={{ fontWeight: 700 }}>ODER</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>🔑 Mit einem Keyword beginnen</div>
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  Entdecke verwandte, wertvolle Keywords — Suchbegriffe, Suchvolumen und Ideen für Listings & Anzeigen.
                </div>
                <div style={{ fontSize: 13 }}>
                  z.B.{' '}
                  {['magnesium supplement', 'yoga mat', 'cutting board'].map((k, i) => (
                    <span key={k}>
                      <button type="button" className="linklike" onClick={example(k)}>{k}</button>{i < 2 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={runAnalyze}>
            <textarea
              className="input"
              style={{ width: '100%', minHeight: 120, resize: 'vertical' }}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Bis zu 200 Keywords eingeben (eines pro Zeile oder durch Komma getrennt)"
            />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-primary" disabled={loading || !pasted.trim()}>Keywords analysieren</button>
            </div>
          </form>
        )}
      </div>

      {loading ? <Loading label="Cerebro lädt Keywords…" /> : <CerebroResults data={data} />}
    </div>
  );
}
