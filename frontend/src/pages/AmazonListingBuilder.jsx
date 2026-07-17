import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import '../pages/AmazonListingBuilder.css';

const TABS = [
  { id: 'source', label: 'Source', icon: '📍' },
  { id: 'naming', label: 'Naming', icon: '✏️' },
  { id: 'bullets', label: 'Bullet Points', icon: '•' },
  { id: 'keywords', label: 'Search Terms', icon: '🔍' },
  { id: 'description', label: 'Description', icon: '📝' },
  { id: 'advertising', label: 'Advertising', icon: '📢' },
  { id: 'pricing', label: 'Pricing & Shipping', icon: '💰' },
  { id: 'fulfillment', label: 'Fulfillment', icon: '📦' },
  { id: 'images', label: 'Images', icon: '🖼️' },
  { id: 'compliance', label: 'Compliance', icon: '✓' },
];

export default function AmazonListingBuilder() {
  const [activeTab, setActiveTab] = useState('source');
  const [listing, setListing] = useState({
    asin: '',
    sku: '',
    title: '',
    category: '',
    bulletPoints: ['', '', '', '', ''],
    description: '',
    keywords: [],
    price: '',
    currency: 'EUR',
    stock: 0,
    images: [],
    weight: '',
    dimensions: { length: 0, width: 0, height: 0 },
    attributes: {},
  });
  const [loading, setLoading] = useState(false);
  const [listingId, setListingId] = useState(null);
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) loadListing(id);
  }, []);

  const loadListing = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/amazon-listings/${id}`);
      setListing(res.data.data);
      setListingId(id);
    } catch (err) {
      showError('Fehler beim Laden des Listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (listingId) {
        await api.put(`/amazon-listings/${listingId}`, listing);
        showSuccess('Listing aktualisiert!');
      } else {
        const res = await api.post('/amazon-listings', listing);
        setListingId(res.data.data.id);
        showSuccess('Listing erstellt!');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setListing(prev => ({ ...prev, [field]: value }));
  };

  const updateBulletPoint = (index, value) => {
    setListing(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((bp, i) => i === index ? value : bp)
    }));
  };

  return (
    <div className="amazon-builder">
      <div className="builder-top">
        <div className="builder-title">
          <h1>Amazon Listing Builder Pro</h1>
          <p>Professionelle Amazon Produktlisten erstellen und verwalten</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-save">
          💾 Speichern
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs-scroll">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="content-area">
        {/* SOURCE Tab */}
        {activeTab === 'source' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Quelle & Identifikation</h2>
              <p>Grundlegende Produktinformationen</p>
            </div>
            <div className="form-grid">
              <div className="form-item">
                <label>ASIN</label>
                <input
                  type="text"
                  placeholder="z.B. B08XYZ123ABC"
                  value={listing.asin || ''}
                  onChange={(e) => updateField('asin', e.target.value)}
                />
                <span className="help-text">Amazon Standard Identification Number</span>
              </div>
              <div className="form-item">
                <label>SKU *</label>
                <input
                  type="text"
                  placeholder="z.B. PROD-12345"
                  value={listing.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                />
                <span className="help-text">Eindeutige Produktkennung</span>
              </div>
              <div className="form-item">
                <label>UPC / EAN</label>
                <input
                  type="text"
                  placeholder="z.B. 5901234123457"
                  value={listing.eanUpc || ''}
                  onChange={(e) => updateField('eanUpc', e.target.value)}
                />
                <span className="help-text">Europäische oder Universal Artikelnummer</span>
              </div>
            </div>
          </div>
        )}

        {/* NAMING Tab */}
        {activeTab === 'naming' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Produktbezeichnung</h2>
              <p>Titel und Kategorisierung</p>
            </div>
            <div className="form-grid">
              <div className="form-item full-width">
                <label>Produkttitel * (max 200 Zeichen)</label>
                <textarea
                  rows={2}
                  maxLength={200}
                  placeholder="Aussagekräftiger Produkttitel mit Keywords"
                  value={listing.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
                <div className="char-counter">{listing.title.length}/200</div>
              </div>
              <div className="form-item">
                <label>Kategorie *</label>
                <select
                  value={listing.category}
                  onChange={(e) => updateField('category', e.target.value)}
                >
                  <option value="">Kategorie wählen</option>
                  <option value="electronics">Elektronik</option>
                  <option value="home">Haushalt & Garten</option>
                  <option value="sports">Sport & Freizeit</option>
                  <option value="beauty">Beauty & Gesundheit</option>
                  <option value="books">Bücher & eBooks</option>
                </select>
              </div>
              <div className="form-item">
                <label>Unterkategorie</label>
                <input
                  type="text"
                  placeholder="z.B. Küchenzubehör"
                  value={listing.subcategory || ''}
                  onChange={(e) => updateField('subcategory', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* BULLET POINTS Tab */}
        {activeTab === 'bullets' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Kurzbeschreibung</h2>
              <p>5 Bullet Points à max 500 Zeichen</p>
            </div>
            <div className="bullets-list">
              {listing.bulletPoints.map((bp, i) => (
                <div key={i} className="bullet-item">
                  <div className="bullet-num">{i + 1}</div>
                  <div className="bullet-content">
                    <textarea
                      rows={2}
                      maxLength={500}
                      placeholder={`Bullet Point ${i + 1}: Wichtiges Merkmal oder Vorteil`}
                      value={bp}
                      onChange={(e) => updateBulletPoint(i, e.target.value)}
                    />
                    <div className="char-counter">{bp.length}/500</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KEYWORDS Tab */}
        {activeTab === 'keywords' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Suchbegriffe</h2>
              <p>Keywords für bessere Auffindbarkeit</p>
            </div>
            <div className="form-grid">
              <div className="form-item full-width">
                <label>Suchbegriffe (durch Komma getrennt)</label>
                <textarea
                  rows={4}
                  placeholder="Geben Sie Keywords durch Komma getrennt ein, z.B.: Küche, Besteck, Edelstahl, hochwertiges Besteck"
                  value={listing.keywords.join(', ')}
                  onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                />
                <span className="help-text">Diese werden bei der Suche auf Amazon berücksichtigt</span>
              </div>
            </div>
          </div>
        )}

        {/* DESCRIPTION Tab */}
        {activeTab === 'description' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Langbeschreibung</h2>
              <p>Detaillierte Produktinformationen (max 2000 Zeichen)</p>
            </div>
            <div className="form-grid">
              <div className="form-item full-width">
                <textarea
                  rows={8}
                  maxLength={2000}
                  placeholder="Detaillierte Produktbeschreibung mit Vorteilen, Anwendungen und Merkmalen..."
                  value={listing.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
                <div className="char-counter">{listing.description.length}/2000</div>
              </div>
            </div>
          </div>
        )}

        {/* ADVERTISING Tab */}
        {activeTab === 'advertising' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Werbung</h2>
              <p>Amazon PPC und Werbeinformationen</p>
            </div>
            <div className="coming-soon">
              <div className="empty-state">
                <p>🚀 Kampagnenmanagement folgt in Kürze</p>
              </div>
            </div>
          </div>
        )}

        {/* PRICING & SHIPPING Tab */}
        {activeTab === 'pricing' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Preisgestaltung & Versand</h2>
              <p>Preis und Versandinformationen</p>
            </div>
            <div className="form-grid">
              <div className="form-item">
                <label>Preis *</label>
                <div className="price-input">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={listing.price}
                    onChange={(e) => updateField('price', e.target.value)}
                  />
                  <span className="currency">{listing.currency}</span>
                </div>
              </div>
              <div className="form-item">
                <label>Lagerbestand *</label>
                <input
                  type="number"
                  placeholder="0"
                  value={listing.stock}
                  onChange={(e) => updateField('stock', parseInt(e.target.value))}
                />
              </div>
              <div className="form-item">
                <label>Gewicht</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={listing.weight || ''}
                  onChange={(e) => updateField('weight', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* FULFILLMENT Tab */}
        {activeTab === 'fulfillment' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Erfüllung & Versand</h2>
              <p>Versandoptionen und Lagerung</p>
            </div>
            <div className="form-grid">
              <div className="form-item full-width">
                <label>Versandart</label>
                <select>
                  <option>FBA (Erfüllung durch Amazon)</option>
                  <option>FBM (Erfüllung durch Verkäufer)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* IMAGES Tab */}
        {activeTab === 'images' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Bilder & Medien</h2>
              <p>Produktbilder und Videos</p>
            </div>
            <div className="images-section">
              <div className="upload-area">
                <input type="file" multiple accept="image/*" hidden id="image-input" />
                <label htmlFor="image-input" className="upload-label">
                  <p>📤 Bilder hier ablegen</p>
                  <span>oder klicken zum Upload</span>
                </label>
              </div>
              <div className="images-grid">
                {listing.images.length === 0 ? (
                  <p className="empty">Keine Bilder hochgeladen</p>
                ) : (
                  listing.images.map((img, i) => (
                    <div key={i} className="image-card">
                      <img src={img} alt={`Bild ${i + 1}`} />
                      <span className="image-num">{i + 1}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* COMPLIANCE Tab */}
        {activeTab === 'compliance' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Compliance & Berechtigungen</h2>
              <p>Sicherheit und Einhaltung von Richtlinien</p>
            </div>
            <div className="coming-soon">
              <div className="empty-state">
                <p>🔒 Compliance-Einstellungen folgen in Kürze</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
