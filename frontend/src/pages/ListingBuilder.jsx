import { useState, useEffect } from 'react';
import { ListingBuilderAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import ListingTable from '../components/listings/ListingTable.jsx';

export default function ListingBuilder() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Alle Listings');

  useEffect(() => {
    const load = async () => {
      try {
        const [m, l] = await Promise.all([
          ListingBuilderAPI.meta(),
          ListingBuilderAPI.list({ status: statusFilter === 'Alle Listings' ? null : statusFilter }),
        ]);
        setMeta(m);
        setListings(l);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter]);

  if (loading) return <Loading label="Listings werden geladen..." />;

  return (
    <div>
      <div className="page-header">
        <h1>Listing Builder</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Erstelle, bearbeite und optimiere deine Produktlisten</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <button
              className={`chip ${statusFilter === 'Alle Listings' ? 'chip-active' : ''}`}
              onClick={() => setStatusFilter('Alle Listings')}
            >
              Alle Listings ({meta.totalListings})
            </button>
            {meta.statuses.map((status) => (
              <button
                key={status}
                className={`chip ${statusFilter === status ? 'chip-active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>✓ Synchronisiert: {meta.synced}</span>
            <span>⚠️ Fehler: {meta.errors}</span>
          </div>
        </div>

        <div className="table-wrap">
          <ListingTable listings={listings} />
        </div>
      </div>
    </div>
  );
}
