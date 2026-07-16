import { useState } from 'react';
import { ScribbleAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import ScribbleEditor from '../components/listings/ScribbleEditor.jsx';

export default function Scribbles() {
  const [asin, setAsin] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedField, setSelectedField] = useState('title');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    if (!asin.trim() || !keywords.trim()) return;

    setLoading(true);
    try {
      const keywordList = keywords
        .split(/[,;\n]+/)
        .map((k) => k.trim())
        .filter(Boolean);

      let result;
      if (selectedField === 'title') {
        result = await ScribbleAPI.optimizeTitle({ asin: asin.trim(), keywords: keywordList });
      } else if (selectedField === 'bullets') {
        result = await ScribbleAPI.optimizeBullets({ asin: asin.trim(), keywords: keywordList });
      } else if (selectedField === 'description') {
        result = await ScribbleAPI.optimizeDescription({ asin: asin.trim(), keywords: keywordList });
      }

      setSuggestions(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Scribbles</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Optimiere deine Listing-Texte mit AI-Vorschlägen</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Einstellungen</div>

            <div className="field">
              <label>ASIN</label>
              <input
                className="input"
                placeholder="z.B. B0F9X766FD"
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Keywords</label>
              <textarea
                className="input"
                style={{ minHeight: 80, resize: 'vertical' }}
                placeholder="Ein Keyword pro Zeile"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Feld optimieren</label>
              <select
                className="select"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
              >
                <option value="title">Titel</option>
                <option value="bullets">Bullet Points</option>
                <option value="description">Beschreibung</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              disabled={loading || !asin.trim() || !keywords.trim()}
              onClick={generateSuggestions}
              style={{ width: '100%' }}
            >
              {loading ? 'Generiere...' : 'Vorschläge generieren'}
            </button>
          </div>
        </div>

        <div>
          {loading ? (
            <Loading label="Generiere Vorschläge..." />
          ) : suggestions ? (
            <ScribbleEditor data={suggestions} />
          ) : (
            <div className="empty">Gib ASIN und Keywords ein, um Vorschläge zu generieren</div>
          )}
        </div>
      </div>
    </div>
  );
}
