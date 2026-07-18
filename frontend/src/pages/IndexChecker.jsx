import { useState } from 'react';
import { IndexCheckerAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import IndexResults from '../components/listings/IndexResults.jsx';
import './IndexChecker.css';

export default function IndexChecker() {
  const [asin, setAsin] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    if (!asin.trim()) return;

    setLoading(true);
    try {
      const keywords = keywordInput
        .split(/[\r\n,;]+/)
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 200);

      const result = await IndexCheckerAPI.batch({ asin: asin.trim(), keywords });
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Index Checker</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Prüfe Keyword-Rankings für deine ASINs</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={check}>
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
            <label>Keywords (bis zu 200)</label>
            <textarea
              className="input"
              style={{ minHeight: 120, resize: 'vertical' }}
              placeholder="Ein Keyword pro Zeile oder durch Komma getrennt"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" disabled={loading || !asin.trim()}>
            {loading ? 'Prüfe Keywords...' : 'Keywords prüfen'}
          </button>
        </form>
      </div>

      {loading ? <Loading label="Prüfe Index..." /> : data && <IndexResults data={data} />}
    </div>
  );
}
