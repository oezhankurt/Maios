import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import '../pages/AmazonListingBuilder.css';

export default function AmazonListingBuilder() {
  const [activeTab, setActiveTab] = useState('basic');
  const [listing, setListing] = useState({
    sku: '',
    title: '',
    price: '',
    currency: 'EUR',
    stock: 0,
    category: '',
    bulletPoints: ['', '', '', '', ''],
    description: '',
    keywords: [],
    images: [],
    attributes: {},
    weight: '',
    weightUnit: 'kg',
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    eanUpc: '',
    originCountry: 'DE',
    certifications: [],
  });
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listingId, setListingId] = useState(null);
  const { error: showError, success: showSuccess } = useToast();

  // Load listing if in edit mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      loadListing(id);
    }
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

  const handleValidate = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/amazon-listings/${listingId}/validate`);
      setValidation(res.data.data);
      if (res.data.data.valid) {
        showSuccess('Listing ist valid!');
      }
    } catch (err) {
      showError('Validierungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!listingId) {
      showError('Bitte speichern Sie das Listing zuerst');
      return;
    }
    try {
      setLoading(true);
      await handleValidate();
      if (validation?.valid) {
        await api.post(`/amazon-listings/${listingId}/publish`);
        showSuccess('Listing veröffentlicht!');
      }
    } catch (err) {
      showError('Fehler beim Veröffentlichen');
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

  const updateAttribute = (key, value) => {
    setListing(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: value }
    }));
  };

  return (
    <div className="amazon-listing-builder">
      <div className="builder-header">
        <h1>🚀 Amazon Listing Builder Pro</h1>
        <div className="header-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
          >
            💾 Speichern
          </button>
          {listingId && (
            <>
              <button
                onClick={handleValidate}
                disabled={loading}
                className="btn btn-secondary"
              >
                ✓ Validieren
              </button>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="btn btn-success"
              >
                🚀 Veröffentlichen
              </button>
            </>
          )}
        </div>
      </div>

      {validation && !validation.valid && (
        <div className="validation-errors">
          <h3>⚠️ Validierungsfehler:</h3>
          <ul>
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="builder-tabs">
        <button
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          📝 Basis
        </button>
        <button
          className={`tab ${activeTab === 'descriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('descriptions')}
        >
          📄 Beschreibungen
        </button>
        <button
          className={`tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          🖼️ Bilder
        </button>
        <button
          className={`tab ${activeTab === 'attributes' ? 'active' : ''}`}
          onClick={() => setActiveTab('attributes')}
        >
          ⚙️ Attribute
        </button>
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          📦 Details
        </button>
      </div>

      <div className="builder-content">
        {activeTab === 'basic' && (
          <div className="tab-content">
            <h2>Basis-Informationen</h2>
            <div className="form-row">
              <div className="form-group">
                <label>SKU *</label>
                <input
                  type="text"
                  value={listing.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="z.B. PROD-12345"
                />
              </div>
              <div className="form-group">
                <label>ASIN</label>
                <input
                  type="text"
                  value={listing.asin || ''}
                  onChange={(e) => updateField('asin', e.target.value)}
                  placeholder="Amazon ASIN"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Produkttitel * (max 200 Zeichen)</label>
              <textarea
                value={listing.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Geben Sie einen aussagekräftigen Produkttitel ein"
                maxLength={200}
              />
              <span className="char-count">{listing.title.length}/200</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kategorie *</label>
                <select
                  value={listing.category}
                  onChange={(e) => updateField('category', e.target.value)}
                >
                  <option value="">Kategorie wählen</option>
                  <option value="electronics">Elektronik</option>
                  <option value="home">Haushalt</option>
                  <option value="sports">Sport & Freizeit</option>
                  <option value="beauty">Beauty</option>
                  <option value="books">Bücher</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unterkategorie</label>
                <input
                  type="text"
                  value={listing.subcategory || ''}
                  onChange={(e) => updateField('subcategory', e.target.value)}
                  placeholder="Unterkategorie"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preis * (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={listing.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Lagerbestand *</label>
                <input
                  type="number"
                  value={listing.stock}
                  onChange={(e) => updateField('stock', parseInt(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'descriptions' && (
          <div className="tab-content">
            <h2>Beschreibungen & Keywords</h2>

            <div className="form-group">
              <label>Bullet Points * (5 Stück, max 500 Zeichen pro Punkt)</label>
              {listing.bulletPoints.map((bp, i) => (
                <div key={i} className="bullet-point">
                  <span className="bullet-number">•</span>
                  <textarea
                    value={bp}
                    onChange={(e) => updateBulletPoint(i, e.target.value)}
                    placeholder={`Bullet Point ${i + 1}`}
                    maxLength={500}
                  />
                  <span className="char-count">{bp.length}/500</span>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Langbeschreibung (max 2000 Zeichen)</label>
              <textarea
                value={listing.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Detaillierte Produktbeschreibung"
                maxLength={2000}
                rows={8}
              />
              <span className="char-count">{listing.description.length}/2000</span>
            </div>

            <div className="form-group">
              <label>Suchbegriffe / Keywords</label>
              <textarea
                value={listing.keywords.join(', ')}
                onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()))}
                placeholder="Geben Sie Keywords durch Komma getrennt ein"
                rows={4}
              />
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="tab-content">
            <h2>Bilder & Media</h2>
            <div className="image-manager">
              <div className="image-upload">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    showSuccess(`${files.length} Bilder ausgewählt - Upload folgt bald`);
                  }}
                />
                <p>Bilder hier ablegen oder klicken zum Upload</p>
              </div>

              <div className="images-preview">
                <h3>Hochgeladene Bilder</h3>
                {listing.images.length === 0 ? (
                  <p className="empty">Keine Bilder hochgeladen</p>
                ) : (
                  <div className="images-grid">
                    {listing.images.map((img, i) => (
                      <div key={i} className="image-item">
                        <img src={img} alt={`Bild ${i + 1}`} />
                        <span className="image-number">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="tab-content">
            <h2>Produkt-Attribute</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Marke</label>
                <input
                  type="text"
                  value={listing.attributes.brand || ''}
                  onChange={(e) => updateAttribute('brand', e.target.value)}
                  placeholder="Markenname"
                />
              </div>
              <div className="form-group">
                <label>Farbe</label>
                <input
                  type="text"
                  value={listing.attributes.color || ''}
                  onChange={(e) => updateAttribute('color', e.target.value)}
                  placeholder="z.B. Schwarz, Rot, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Größe</label>
                <input
                  type="text"
                  value={listing.attributes.size || ''}
                  onChange={(e) => updateAttribute('size', e.target.value)}
                  placeholder="z.B. M, L, XL oder Abmessungen"
                />
              </div>
              <div className="form-group">
                <label>Material</label>
                <input
                  type="text"
                  value={listing.attributes.material || ''}
                  onChange={(e) => updateAttribute('material', e.target.value)}
                  placeholder="z.B. Baumwolle, Kunststoff, etc."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="tab-content">
            <h2>Weitere Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Gewicht</label>
                <input
                  type="number"
                  step="0.01"
                  value={listing.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Einheit</label>
                <select
                  value={listing.weightUnit}
                  onChange={(e) => updateField('weightUnit', e.target.value)}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Länge (cm)</label>
                <input
                  type="number"
                  value={listing.dimensions.length}
                  onChange={(e) => updateField('dimensions', {
                    ...listing.dimensions,
                    length: parseFloat(e.target.value)
                  })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Breite (cm)</label>
                <input
                  type="number"
                  value={listing.dimensions.width}
                  onChange={(e) => updateField('dimensions', {
                    ...listing.dimensions,
                    width: parseFloat(e.target.value)
                  })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Höhe (cm)</label>
                <input
                  type="number"
                  value={listing.dimensions.height}
                  onChange={(e) => updateField('dimensions', {
                    ...listing.dimensions,
                    height: parseFloat(e.target.value)
                  })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>EAN/UPC</label>
                <input
                  type="text"
                  value={listing.eanUpc}
                  onChange={(e) => updateField('eanUpc', e.target.value)}
                  placeholder="Europäische Artikelnummer"
                />
              </div>
              <div className="form-group">
                <label>Herkunftsland</label>
                <input
                  type="text"
                  value={listing.originCountry}
                  onChange={(e) => updateField('originCountry', e.target.value)}
                  placeholder="z.B. DE, CN, etc."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
