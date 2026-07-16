import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useToast } from '../hooks/useToast';
import ListingOptimizer from '../components/ListingOptimizer';

export default function UnifiedListingCreator() {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [platformConfigs, setPlatformConfigs] = useState({});
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    amazon: false,
    ebay: false,
    kaufland: false,
    otto: false,
  });

  const [listingData, setListingData] = useState({
    name: '',
    title: '',
    description: '',
    price: '',
    quantity: 1,
    sku: '',
    ean: '',
    asin: '',
    category: '',
    images: [],
    keywords: [],
    bulletPoints: [],
  });

  const [currentTab, setCurrentTab] = useState('input');
  const [previews, setPreviews] = useState({});
  const [validations, setValidations] = useState({});

  useEffect(() => {
    loadPlatformConfigs();
  }, []);

  const loadPlatformConfigs = async () => {
    try {
      const res = await api.get('/listings/multi-platform/platforms');
      setPlatformConfigs(res.data.data.platformConfigs);
    } catch (err) {
      showError('Fehler beim Laden der Plattform-Konfigurationen');
    }
  };

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setListingData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value,
    }));
  };

  const handleArrayInputChange = (fieldName, index, value) => {
    setListingData((prev) => {
      const updated = [...prev[fieldName]];
      updated[index] = value;
      return { ...prev, [fieldName]: updated };
    });
  };

  const addArrayField = (fieldName) => {
    setListingData((prev) => ({
      ...prev,
      [fieldName]: [...prev[fieldName], ''],
    }));
  };

  const removeArrayField = (fieldName, index) => {
    setListingData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const generatePreview = async () => {
    const platforms = Object.keys(selectedPlatforms).filter((p) => selectedPlatforms[p]);

    if (platforms.length === 0) {
      showError('Bitte wähle mindestens eine Plattform aus');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/listings/multi-platform/preview/multi', {
        platforms,
        listingData,
      });

      setPreviews(res.data.data.previews);
      setValidations(res.data.data);
      setCurrentTab('preview');
      showSuccess('Vorschau generiert');
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Fehler bei der Vorschau');
    } finally {
      setLoading(false);
    }
  };

  const saveListing = async () => {
    if (!listingData.name || !listingData.price) {
      showError('Produktname und Preis sind erforderlich');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/listings', {
        listingData: {
          name: listingData.name,
          description: listingData.description,
          price: listingData.price,
          sku: listingData.sku,
          ean: listingData.ean,
          asin: listingData.asin,
          keywords: listingData.keywords,
          bulletPoints: listingData.bulletPoints,
          images: listingData.images,
        },
      });

      showSuccess('Listing gespeichert!');
      // Reset form
      setListingData({
        name: '',
        title: '',
        description: '',
        price: '',
        quantity: 1,
        sku: '',
        ean: '',
        asin: '',
        category: '',
        images: [],
        keywords: [],
        bulletPoints: [],
      });
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const platformColors = {
    amazon: '#FF9900',
    ebay: '#E53238',
    kaufland: '#1CB30E',
    otto: '#009640',
  };

  const platformEmojis = {
    amazon: '📦',
    ebay: '🔨',
    kaufland: '🛒',
    otto: '🏬',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📋 Unified Listing Creator</h1>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #2d3e5f',
        }}
      >
        <button
          onClick={() => setCurrentTab('input')}
          style={{
            padding: '10px 20px',
            background: currentTab === 'input' ? '#6366f1' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'input' ? '2px solid #6366f1' : 'none',
            color: currentTab === 'input' ? '#6366f1' : '#8b94a8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          ✏️ Eingabe
        </button>
        <button
          onClick={() => setCurrentTab('preview')}
          style={{
            padding: '10px 20px',
            background: currentTab === 'preview' ? '#6366f1' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'preview' ? '2px solid #6366f1' : 'none',
            color: currentTab === 'preview' ? '#6366f1' : '#8b94a8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          👁️ Vorschau
        </button>
      </div>

      {/* Input Tab */}
      {currentTab === 'input' && (
        <div>
          {/* Platform Selector */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#6366f1' }}>
              Zielplattformen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {Object.entries(selectedPlatforms).map(([platform, selected]) => (
                <label
                  key={platform}
                  style={{
                    padding: '15px',
                    background: selected ? `${platformColors[platform]}20` : '#1a2347',
                    border: `2px solid ${selected ? platformColors[platform] : '#2d3e5f'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handlePlatformToggle(platform)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>
                    {platformEmojis[platform]} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Optimizer */}
          {Object.values(selectedPlatforms).some((p) => p) && (
            <div style={{ marginBottom: '30px' }}>
              <ListingOptimizer
                listingData={listingData}
                platform={Object.keys(selectedPlatforms).find((p) => selectedPlatforms[p])}
                onUpdate={setListingData}
              />
            </div>
          )}

          {/* Central Input Form */}
          <div style={{ background: '#1a2347', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#6366f1' }}>Produktinformationen</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {/* Produktname */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8b94a8' }}>
                  Produktname *
                </label>
                <input
                  type="text"
                  name="name"
                  value={listingData.name}
                  onChange={handleInputChange}
                  placeholder="z.B. Omega-3 Fischöl Kapseln"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0a0e27',
                    border: '1px solid #2d3e5f',
                    borderRadius: '6px',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Preis */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8b94a8' }}>
                  Preis (EUR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={listingData.price}
                  onChange={handleInputChange}
                  placeholder="19.99"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0a0e27',
                    border: '1px solid #2d3e5f',
                    borderRadius: '6px',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* SKU */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8b94a8' }}>
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={listingData.sku}
                  onChange={handleInputChange}
                  placeholder="SKU123"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0a0e27',
                    border: '1px solid #2d3e5f',
                    borderRadius: '6px',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* EAN */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8b94a8' }}>
                  EAN/Barcode
                </label>
                <input
                  type="text"
                  name="ean"
                  value={listingData.ean}
                  onChange={handleInputChange}
                  placeholder="1234567890123"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0a0e27',
                    border: '1px solid #2d3e5f',
                    borderRadius: '6px',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* ASIN */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8b94a8' }}>
                  ASIN (Amazon)
                </label>
                <input
                  type="text"
                  name="asin"
                  value={listingData.asin}
                  onChange={handleInputChange}
                  placeholder="B0XXXXXXXXX"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0a0e27',
                    border: '1px solid #2d3e5f',
                    borderRadius: '6px',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Menge */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8b94a8' }}>
                  Lagerbestand
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={listingData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0a0e27',
                    border: '1px solid #2d3e5f',
                    borderRadius: '6px',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Beschreibung */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8b94a8' }}>
                Produktbeschreibung *
              </label>
              <textarea
                name="description"
                value={listingData.description}
                onChange={handleInputChange}
                placeholder="Ausführliche Produktbeschreibung..."
                rows="5"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#0a0e27',
                  border: '1px solid #2d3e5f',
                  borderRadius: '6px',
                  color: '#fff',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Bullet Points (Amazon) */}
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', color: '#8b94a8', fontWeight: '500' }}>Stichpunkte</label>
                <button
                  onClick={() => addArrayField('bulletPoints')}
                  style={{
                    padding: '6px 12px',
                    background: '#6366f1',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  + Hinzufügen
                </button>
              </div>
              {listingData.bulletPoints.map((point, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleArrayInputChange('bulletPoints', index, e.target.value)}
                    placeholder={`Stichpunkt ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#0a0e27',
                      border: '1px solid #2d3e5f',
                      borderRadius: '4px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={() => removeArrayField('bulletPoints', index)}
                    style={{
                      padding: '8px 12px',
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
                </div>
              ))}
            </div>

            {/* Keywords */}
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', color: '#8b94a8', fontWeight: '500' }}>Keywords</label>
                <button
                  onClick={() => addArrayField('keywords')}
                  style={{
                    padding: '6px 12px',
                    background: '#6366f1',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  + Hinzufügen
                </button>
              </div>
              {listingData.keywords.map((keyword, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => handleArrayInputChange('keywords', index, e.target.value)}
                    placeholder={`Keyword ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#0a0e27',
                      border: '1px solid #2d3e5f',
                      borderRadius: '4px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={() => removeArrayField('keywords', index)}
                    style={{
                      padding: '8px 12px',
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
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={saveListing}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '⏳ Wird gespeichert...' : '💾 Listing speichern'}
            </button>

            <button
              onClick={generatePreview}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#6366f1',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '⏳ Wird generiert...' : '👁️ Vorschau generieren'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {currentTab === 'preview' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {Object.entries(previews).map(([platform, data]) => (
              <div
                key={platform}
                style={{
                  background: '#1a2347',
                  border: data.isValid ? '1px solid #10b981' : '1px solid #dc2626',
                  borderRadius: '8px',
                  padding: '15px',
                  borderLeft: `4px solid ${platformColors[platform]}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{platformEmojis[platform]}</span>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </h3>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      background: data.isValid ? '#10b981' : '#dc2626',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {data.isValid ? '✓ Gültig' : '✗ Fehler'}
                  </span>
                </div>

                {data.errors && data.errors.length > 0 && (
                  <div
                    style={{
                      background: 'rgba(220, 38, 38, 0.1)',
                      border: '1px solid #dc2626',
                      borderRadius: '4px',
                      padding: '10px',
                      marginBottom: '12px',
                      fontSize: '12px',
                    }}
                  >
                    {data.errors.map((err, i) => (
                      <div key={i} style={{ color: '#fca5a5', marginBottom: i < data.errors.length - 1 ? '6px' : 0 }}>
                        ✗ {err}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#8b94a8' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#93c5fd' }}>Titel:</strong>
                    <div style={{ color: '#ccc', marginTop: '4px' }}>{data.listing.title}</div>
                  </div>

                  {data.listing.bulletPoints && data.listing.bulletPoints.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: '#93c5fd' }}>Stichpunkte:</strong>
                      <ul style={{ margin: '6px 0', paddingLeft: '20px', color: '#ccc' }}>
                        {data.listing.bulletPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <strong style={{ color: '#93c5fd' }}>Preis:</strong>
                    <div style={{ color: '#10b981' }}>{data.listing.price} EUR</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
