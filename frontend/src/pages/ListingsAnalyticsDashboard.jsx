import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import './ListingsAnalyticsDashboard.css';

export default function ListingsAnalyticsDashboard() {
  const { error: showError } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(() => {
      loadAnalytics();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.get('/listings/analytics');
      setAnalytics(res.data.data);
    } catch (err) {
      showError('Fehler beim Laden der Analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>📊 Listings Analytics</h1>
        <div style={{ textAlign: 'center', color: '#8b94a8', padding: '40px' }}>
          Wird geladen...
        </div>
      </div>
    );
  }

  const StatCard = ({ label, value, color = '#93c5fd' }) => (
    <div
      style={{
        background: '#1a2347',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #2d3e5f',
      }}
    >
      <div style={{ color: '#8b94a8', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );

  const {
    summary,
    platformStats,
    optimizationStats,
    statusDistribution,
    priceAnalysis,
    syncStatus,
  } = analytics;

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Listings Analytics Dashboard</h1>

      {/* Summary Stats */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#93c5fd' }}>Übersicht</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}
        >
          <StatCard label="Gesamt Listings" value={summary.totalListings} />
          <StatCard label="Erfolgsquote" value={`${summary.successRate}%`} color="#10b981" />
        </div>
      </div>

      {/* Optimization Stats */}
      {optimizationStats && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#93c5fd' }}>Optimierung</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            <StatCard label="Durchschnitt Score" value={`${optimizationStats.average}%`} />
            <StatCard label="Höchster Score" value={`${optimizationStats.max}%`} color="#10b981" />
            <StatCard label="Niedrigster Score" value={`${optimizationStats.min}%`} color="#ef4444" />
            <StatCard label="Unoptimiert" value={optimizationStats.unoptimized} color="#f59e0b" />
          </div>

          <div
            style={{
              background: '#1a2347',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #2d3e5f',
              marginTop: '15px',
            }}
          >
            <h4 style={{ margin: '0 0 15px 0', color: '#93c5fd' }}>Score Verteilung</h4>
            <div style={{ display: 'flex', gap: '30px' }}>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>🟢 Excellent (80+)</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                  {optimizationStats.distribution.excellent}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>🟡 Good (60-79)</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {optimizationStats.distribution.good}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>🔴 Needs Work (40-59)</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ec4899' }}>
                  {optimizationStats.distribution.needsWork}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>🔴 Poor (&lt;40)</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                  {optimizationStats.distribution.poor}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Stats */}
      {platformStats && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#93c5fd' }}>Plattformen</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
            }}
          >
            {Object.entries(platformStats).map(([platform, stats]) => (
              <div
                key={platform}
                style={{
                  background: '#1a2347',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #2d3e5f',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 15px 0',
                    textTransform: 'capitalize',
                    color: '#93c5fd',
                  }}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </h4>
                <div style={{ fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#8b94a8' }}>Gesamt:</span>
                    <span style={{ color: '#ccc' }}>{stats.total}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ color: '#8b94a8' }}>Veröffentlicht:</span>
                    <span style={{ color: '#10b981' }}>{stats.published}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ color: '#8b94a8' }}>Fehlgeschlagen:</span>
                    <span style={{ color: '#ef4444' }}>{stats.failed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8b94a8' }}>In Sync:</span>
                    <span style={{ color: '#60a5fa' }}>{stats.inSync}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Distribution */}
      {statusDistribution && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#93c5fd' }}>Status Übersicht</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
            }}
          >
            <StatCard label="✏️ Entwurf" value={statusDistribution.draft} />
            <StatCard label="✓ Veröffentlicht" value={statusDistribution.published} color="#10b981" />
            <StatCard label="📦 Archiviert" value={statusDistribution.archived} color="#6b7280" />
            <StatCard label="⏰ Geplant" value={statusDistribution.scheduled} color="#f59e0b" />
          </div>
        </div>
      )}

      {/* Price Analysis */}
      {priceAnalysis && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#93c5fd' }}>Preis Analyse</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            <StatCard
              label="Durchschnittlicher Preis"
              value={`€ ${priceAnalysis.average}`}
              color="#10b981"
            />
            <StatCard
              label="Tiefster Preis"
              value={`€ ${priceAnalysis.min}`}
              color="#60a5fa"
            />
            <StatCard label="Höchster Preis" value={`€ ${priceAnalysis.max}`} color="#f59e0b" />
          </div>

          <div
            style={{
              background: '#1a2347',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #2d3e5f',
              marginTop: '15px',
            }}
          >
            <h4 style={{ margin: '0 0 15px 0', color: '#93c5fd' }}>Preis Ranges</h4>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>Unter € 10</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {priceAnalysis.priceBrackets.under10}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>€ 10 - 50</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {priceAnalysis.priceBrackets.from10to50}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>€ 50 - 100</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {priceAnalysis.priceBrackets.from50to100}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>€ 100 - 500</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {priceAnalysis.priceBrackets.from100to500}
                </div>
              </div>
              <div>
                <div style={{ color: '#8b94a8', fontSize: '12px' }}>Über € 500</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {priceAnalysis.priceBrackets.over500}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status */}
      {syncStatus && (
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#93c5fd' }}>Sync Status</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
            }}
          >
            <StatCard label="In Sync" value={syncStatus.inSync} color="#10b981" />
            <StatCard label="Out of Sync" value={syncStatus.outOfSync} color="#ef4444" />
            <StatCard label="Needs Review" value={syncStatus.needsReview} color="#f59e0b" />
            <StatCard label="Gesamt" value={syncStatus.total} color="#60a5fa" />
          </div>
        </div>
      )}
    </div>
  );
}
