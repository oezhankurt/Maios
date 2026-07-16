import { useState } from 'react';
import { ListingAnalyzerAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import ListingAnalysisResults from '../components/listings/ListingAnalysisResults.jsx';

export default function ListingAnalyzer() {
  const [mainAsin, setMainAsin] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (e) => {
    e.preventDefault();
    if (!mainAsin.trim()) return;

    setLoading(true);
    try {
      const competitorAsins = competitorInput
        .split(/[\s,;]+/)
        .map((a) => a.trim())
        .filter(Boolean)
        .slice(0, 10);

      const result = await ListingAnalyzerAPI.addCompetitors({
        mainAsin: mainAsin.trim(),
        competitorAsins,
      });
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
        <h1>Listing Analyzer</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Analysiere dein Produkt gegen Wettbewerber</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={analyze}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Gib Haupt-ASIN ein</div>
              <div className="field">
                <label>Haupt-ASIN</label>
                <input
                  className="input"
                  placeholder="z.B. B0F9X766FD"
                  value={mainAsin}
                  onChange={(e) => setMainAsin(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" disabled={loading || !mainAsin.trim()}>
                {loading ? 'Analysiere...' : 'Analysieren'}
              </button>
            </div>

            <div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Bis zu 10 Wettbewerber-ASINs</div>
              <textarea
                className="input"
                style={{ minHeight: 120, resize: 'vertical' }}
                placeholder="Geben Sie bis zu 10 Produkt-ASINs ein (durch Komma oder Zeilenumbruch getrennt)"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      {loading ? <Loading label="Analysiere Listings..." /> : data && <ListingAnalysisResults data={data} />}
    </div>
  );
}
