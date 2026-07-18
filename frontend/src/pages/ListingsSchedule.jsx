import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import SchedulePublishModal from '../components/SchedulePublishModal';
import './ListingsSchedule.css';

export default function ListingsSchedule() {
  const { success: showSuccess, error: showError } = useToast();
  const [scheduledListings, setScheduledListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    loadScheduledListings();
    loadStats();

    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadScheduledListings = async () => {
    try {
      const res = await api.get('/listings/schedule/scheduled');
      setScheduledListings(res.data.data.listings);
    } catch (err) {
      showError('Fehler beim Laden geplanter Listings');
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/listings/schedule/stats');
      setStats(res.data.data);
    } catch (err) {
      showError('Fehler beim Laden der Statistiken');
    }
  };

  const unschedule = async (listingId) => {
    if (!window.confirm('Planung wirklich löschen?')) return;

    try {
      await api.post(`/listings/schedule/${listingId}/unschedule`);
      showSuccess('Planung gelöscht');
      loadScheduledListings();
      loadStats();
    } catch (err) {
      showError('Fehler beim Löschen der Planung');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlatformEmojis = (platforms) => {
    const emojis = {
      amazon: '🟠',
      ebay: '🔴',
      kaufland: '🔵',
      otto: '🟢',
    };
    return platforms.map((p) => emojis[p]).join(' ');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>⏰ Geplante Veröffentlichungen</h1>

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              background: '#1a2347',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #2d3e5f',
            }}
          >
            <div style={{ color: '#8b94a8', fontSize: '13px', marginBottom: '8px' }}>
              Gesamt Listings
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#93c5fd' }}>
              {stats.total}
            </div>
          </div>

          <div
            style={{
              background: '#1a2347',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #2d3e5f',
            }}
          >
            <div style={{ color: '#8b94a8', fontSize: '13px', marginBottom: '8px' }}>
              Geplant
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>
              {stats.scheduled}
            </div>
          </div>

          <div
            style={{
              background: '#1a2347',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #2d3e5f',
            }}
          >
            <div style={{ color: '#8b94a8', fontSize: '13px', marginBottom: '8px' }}>
              Veröffentlicht
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.published}
            </div>
          </div>

          <div
            style={{
              background: '#1a2347',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #2d3e5f',
            }}
          >
            <div style={{ color: '#8b94a8', fontSize: '13px', marginBottom: '8px' }}>
              Heute Veröffentlicht
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.totalPublishedToday}
            </div>
          </div>

          <div
            style={{
              background: '#1a2347',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #2d3e5f',
            }}
          >
            <div style={{ color: '#8b94a8', fontSize: '13px', marginBottom: '8px' }}>
              Ø Optimierungsscore
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {stats.averageOptimizationScore}%
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Listings */}
      {scheduledListings.length > 0 ? (
        <div
          style={{
            background: '#1a2347',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #2d3e5f',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr style={{ background: '#0a0e27', borderBottom: '1px solid #2d3e5f' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>
                  Produktname
                </th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>
                  Geplant für
                </th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>
                  Plattformen
                </th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>
                  Score
                </th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {scheduledListings.map((listing) => (
                <tr
                  key={listing.id}
                  style={{
                    borderBottom: '1px solid #2d3e5f',
                  }}
                >
                  <td style={{ padding: '12px' }}>{listing.productName}</td>
                  <td style={{ padding: '12px', color: '#93c5fd' }}>
                    {formatDate(listing.scheduledPublishDate)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {getPlatformEmojis(listing.platforms)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '6px',
                        background: '#0a0e27',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${listing.optimizationScore}%`,
                          height: '100%',
                          background: listing.optimizationScore >= 80 ? '#10b981' : '#f59e0b',
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => unschedule(listing.id)}
                      style={{
                        padding: '4px 8px',
                        background: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ✕ Abbrechen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#8b94a8',
            background: '#1a2347',
            borderRadius: '8px',
          }}
        >
          Keine geplanten Veröffentlichungen
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedListing && (
        <SchedulePublishModal
          listing={selectedListing}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            loadScheduledListings();
            loadStats();
          }}
        />
      )}
    </div>
  );
}
