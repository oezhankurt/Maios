import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useToast } from '../hooks/useToast';
import BulkImportCSV from '../components/BulkImportCSV';
import BulkOperationsPanel from '../components/BulkOperationsPanel';
import SchedulePublishModal from '../components/SchedulePublishModal';

export default function ListingsManager() {
  const { success: showSuccess, error: showError } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedListings, setSelectedListings] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    loadListings();
  }, [filterStatus]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const status = filterStatus === 'all' ? null : filterStatus;
      const res = await api.get('/listings', {
        params: { status, limit: 100 },
      });

      setListings(res.data.data.listings);
    } catch (err) {
      showError('Fehler beim Laden der Listings');
    } finally {
      setLoading(false);
    }
  };

  const publishListing = async (listingId, platforms) => {
    try {
      const res = await api.post(`/listings/${listingId}/publish`, { platforms });
      showSuccess('Listing veröffentlicht');
      loadListings();
    } catch (err) {
      showError('Fehler beim Veröffentlichen');
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Listing wirklich löschen?')) return;

    try {
      await api.delete(`/listings/${listingId}`);
      showSuccess('Listing gelöscht');
      loadListings();
    } catch (err) {
      showError('Fehler beim Löschen');
    }
  };

  const toggleListingSelection = (listingId) => {
    setSelectedListings((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const toggleAllListings = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map((l) => l.id));
    }
  };

  const handleImportSuccess = () => {
    loadListings();
  };

  const statusColors = {
    draft: '#8b94a8',
    published: '#10b981',
    archived: '#6b7280',
    scheduled: '#f59e0b',
  };

  const statusLabels = {
    draft: '✏️ Entwurf',
    published: '✓ Veröffentlicht',
    archived: '📦 Archiviert',
    scheduled: '⏰ Geplant',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📋 Listings Manager</h1>

      {/* Filter and Actions */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {['all', 'draft', 'published', 'archived', 'scheduled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              background: filterStatus === status ? '#6366f1' : '#1a2347',
              border: '1px solid #2d3e5f',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filterStatus === status ? '600' : '500',
            }}
          >
            {status === 'all' ? 'Alle' : statusLabels[status]}
          </button>
        ))}
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            background: '#10b981',
            border: '1px solid #059669',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          📥 CSV Import
        </button>
      </div>

      {/* Listings Table */}
      {listings.length > 0 ? (
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
                <th style={{ padding: '12px', textAlign: 'center', color: '#8b94a8', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedListings.length === listings.length && listings.length > 0}
                    onChange={toggleAllListings}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>Produktname</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>SKU</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>Plattformen</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>Score</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b94a8' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.id}
                  style={{
                    borderBottom: '1px solid #2d3e5f',
                    background: selectedListing?.id === listing.id ? '#2d3e5f' : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedListings.includes(listing.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleListingSelection(listing.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td
                    style={{ padding: '12px', cursor: 'pointer' }}
                    onClick={() => setSelectedListing(listing)}
                  >
                    {listing.productName}
                  </td>
                  <td style={{ padding: '12px', color: '#8b94a8' }}>{listing.sku || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        background: statusColors[listing.status],
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {statusLabels[listing.status]}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {Object.keys(listing.publishedPlatforms || {})
                      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                      .join(', ') || '-'}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteListing(listing.id);
                      }}
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
                      ✕
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
          {loading ? 'Wird geladen...' : 'Keine Listings gefunden'}
        </div>
      )}

      {/* Selected Listing Details */}
      {selectedListing && (
        <div
          style={{
            marginTop: '30px',
            background: '#1a2347',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #2d3e5f',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}
          >
            <h3 style={{ margin: 0, color: '#93c5fd' }}>{selectedListing.productName}</h3>
            <button
              onClick={() => setSelectedListing(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b94a8',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ color: '#8b94a8' }}>SKU:</span>
              <div style={{ color: '#ccc', marginTop: '4px' }}>{selectedListing.sku || '-'}</div>
            </div>
            <div>
              <span style={{ color: '#8b94a8' }}>EAN:</span>
              <div style={{ color: '#ccc', marginTop: '4px' }}>{selectedListing.ean || '-'}</div>
            </div>
            <div>
              <span style={{ color: '#8b94a8' }}>Preis:</span>
              <div style={{ color: '#10b981', marginTop: '4px' }}>
                {selectedListing.basePrice} {selectedListing.currency}
              </div>
            </div>
            <div>
              <span style={{ color: '#8b94a8' }}>Score:</span>
              <div style={{ color: '#ccc', marginTop: '4px' }}>{selectedListing.optimizationScore}%</div>
            </div>
          </div>

          {/* Publish to Platforms */}
          <div
            style={{
              background: '#0a0e27',
              padding: '15px',
              borderRadius: '6px',
              marginTop: '15px',
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#93c5fd' }}>
              Zu Plattformen veröffentlichen:
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['amazon', 'ebay', 'kaufland', 'otto'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => publishListing(selectedListing.id, [platform])}
                  style={{
                    padding: '8px 16px',
                    background: '#6366f1',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setShowScheduleModal(true)}
                style={{
                  padding: '8px 16px',
                  background: '#60a5fa',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                ⏰ Planen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <BulkImportCSV
          onImportSuccess={handleImportSuccess}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedListing && (
        <SchedulePublishModal
          listing={selectedListing}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            loadListings();
          }}
        />
      )}

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        selectedListings={selectedListings}
        onOperationComplete={() => {
          setSelectedListings([]);
          loadListings();
        }}
      />
    </div>
  );
}
