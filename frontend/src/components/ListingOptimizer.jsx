import { useState } from 'react';
import { api } from '../api/api';
import { useToast } from '../hooks/useToast';

export default function ListingOptimizer({ listingData, platform, onUpdate }) {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [optimizationReport, setOptimizationReport] = useState(null);
  const [showOptimizer, setShowOptimizer] = useState(false);

  const generateKeywords = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/optimize/keywords', {
        productName: listingData.name,
        description: listingData.description,
      });

      onUpdate({
        ...listingData,
        keywords: res.data.data.keywords,
      });

      showSuccess(`${res.data.data.count} Keywords generiert`);
    } catch (err) {
      showError('Fehler beim Generieren von Keywords');
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizedTitle = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/optimize/generate-title', {
        productName: listingData.name,
        keywords: listingData.keywords,
        maxLength: platform === 'ebay' ? 80 : platform === 'kaufland' ? 60 : 125,
      });

      onUpdate({
        ...listingData,
        title: res.data.data.title,
      });

      showSuccess('Titel optimiert');
    } catch (err) {
      showError('Fehler beim Optimieren des Titels');
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizedDescription = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/optimize/generate-description', {
        productName: listingData.name,
        keywords: listingData.keywords,
        originalDescription: listingData.description,
      });

      onUpdate({
        ...listingData,
        description: res.data.data.description,
      });

      showSuccess('Beschreibung optimiert');
    } catch (err) {
      showError('Fehler beim Optimieren der Beschreibung');
    } finally {
      setLoading(false);
    }
  };

  const getOptimizationReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/optimize/report', {
        listingData,
        platform,
      });

      setOptimizationReport(res.data.data);
    } catch (err) {
      showError('Fehler beim Erstellen des Reports');
    } finally {
      setLoading(false);
    }
  };

  const optimizeAll = async () => {
    setLoading(true);
    try {
      // 1. Keywords generieren
      const keywordRes = await api.post('/ai/optimize/keywords', {
        productName: listingData.name,
        description: listingData.description,
      });

      const updatedData = {
        ...listingData,
        keywords: keywordRes.data.data.keywords,
      };

      // 2. Titel optimieren
      const titleRes = await api.post('/ai/optimize/generate-title', {
        productName: updatedData.name,
        keywords: updatedData.keywords,
        maxLength: platform === 'ebay' ? 80 : platform === 'kaufland' ? 60 : 125,
      });

      updatedData.title = titleRes.data.data.title;

      // 3. Beschreibung optimieren
      const descRes = await api.post('/ai/optimize/generate-description', {
        productName: updatedData.name,
        keywords: updatedData.keywords,
        originalDescription: updatedData.description,
      });

      updatedData.description = descRes.data.data.description;

      // 4. Report generieren
      const reportRes = await api.post('/ai/optimize/report', {
        listingData: updatedData,
        platform,
      });

      onUpdate(updatedData);
      setOptimizationReport(reportRes.data.data);
      showSuccess('Listing vollständig optimiert!');
    } catch (err) {
      showError('Fehler beim Optimieren des Listings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Optimizer Toggle Button */}
      <button
        onClick={() => setShowOptimizer(!showOptimizer)}
        style={{
          padding: '10px 16px',
          background: '#10b981',
          border: 'none',
          borderRadius: '6px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '15px',
        }}
      >
        🤖 {showOptimizer ? 'Optimizer ausblenden' : 'AI Optimizer öffnen'}
      </button>

      {showOptimizer && (
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#fff' }}>
            ✨ AI Listing Optimizer
          </h3>

          {/* Quick Action Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              marginBottom: '15px',
            }}
          >
            <button
              onClick={generateKeywords}
              disabled={loading}
              style={{
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '4px',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              🔍 Keywords generieren
            </button>

            <button
              onClick={generateOptimizedTitle}
              disabled={loading}
              style={{
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '4px',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              📝 Titel optimieren
            </button>

            <button
              onClick={generateOptimizedDescription}
              disabled={loading}
              style={{
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '4px',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              📄 Beschreibung optimieren
            </button>

            <button
              onClick={getOptimizationReport}
              disabled={loading}
              style={{
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '4px',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              📊 Report erstellen
            </button>
          </div>

          {/* All-in-One Button */}
          <button
            onClick={optimizeAll}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              color: '#059669',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '⏳ Wird optimiert...' : '⚡ Alles auf einmal optimieren'}
          </button>
        </div>
      )}

      {/* Optimization Report */}
      {optimizationReport && (
        <div
          style={{
            background: '#1a2347',
            border: '1px solid #2d3e5f',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '13px', color: '#93c5fd' }}>📊 Optimierungs-Report</h4>
            <button
              onClick={() => setOptimizationReport(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b94a8',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Score */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#8b94a8' }}>Optimierungs-Score:</span>
              <div
                style={{
                  flex: 1,
                  height: '8px',
                  background: '#0a0e27',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: optimizationReport.score >= 80 ? '#10b981' : optimizationReport.score >= 60 ? '#f59e0b' : '#dc2626',
                    width: `${optimizationReport.score}%`,
                  }}
                />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                {optimizationReport.percentage}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#8b94a8' }}>
              Qualität: {optimizationReport.quality}
            </span>
          </div>

          {/* Recommendations */}
          {optimizationReport.recommendations && optimizationReport.recommendations.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#93c5fd' }}>
                Empfehlungen ({optimizationReport.issueCount}):
              </h5>
              <div
                style={{
                  background: '#0a0e27',
                  borderRadius: '4px',
                  padding: '10px',
                  fontSize: '12px',
                  maxHeight: '150px',
                  overflow: 'auto',
                }}
              >
                {optimizationReport.recommendations.map((rec, i) => (
                  <div key={i} style={{ color: '#fca5a5', marginBottom: i < optimizationReport.recommendations.length - 1 ? '6px' : 0 }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
