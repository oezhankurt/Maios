import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import '../pages/AmazonListingBuilder.css';

const TABS = [
  { id: 'basic', label: 'Basis-Info' },
  { id: 'descriptions', label: 'Beschreibungen' },
  { id: 'pricing', label: 'Preisgestaltung' },
  { id: 'images', label: 'Bilder' },
];

export default function AmazonListingBuilder() {
  const [activeTab, setActiveTab] = useState('basic');
  const [activePreviewTab, setActivePreviewTab] = useState('preview');
  const [listing, setListing] = useState({
    sku: '',
    asin: '',
    title: '',
    category: '',
    price: '',
    currency: 'EUR',
    stock: 0,
    bulletPoints: ['', '', '', '', ''],
    description: '',
    keywords: [],
    images: [],
    weight: '',
    dimensions: { length: 0, width: 0, height: 0 },
    attributes: {},
  });
  const [listingId, setListingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) loadListing(id);
  }, []);

  // Trigger AI analysis when listing changes
  useEffect(() => {
    if (listing.title || listing.bulletPoints.some(bp => bp)) {
      analyzeWithAI();
    }
  }, [listing.title, listing.bulletPoints, listing.keywords]);

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

  const analyzeWithAI = async () => {
    try {
      // Simulate AI analysis (in production, call backend API)
      const analysis = generateAIAnalysis(listing);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error('AI Analysis error:', err);
    }
  };

  const calculateFieldScore = (field, value, maxLength, minLength = 0) => {
    let score = 100;
    if (!value || value.length === 0) {
      return { score: 0, status: 'empty', message: 'Erforderlich' };
    }
    if (value.length < minLength) {
      score -= 30;
      return { score, status: 'warning', message: `Zu kurz (min. ${minLength})` };
    }
    if (value.length > maxLength) {
      score -= 20;
      return { score, status: 'error', message: `Zu lang (max. ${maxLength})` };
    }
    if (value.length < maxLength * 0.5) {
      score -= 10;
      return { score, status: 'info', message: `${maxLength - value.length} Zeichen frei` };
    }
    return { score, status: 'good', message: `${maxLength - value.length} Zeichen frei` };
  };

  const generateAIAnalysis = (listingData) => {
    const issues = [];
    const suggestions = [];
    let score = 100;

    // Title analysis
    if (!listingData.title) {
      issues.push('Titel ist erforderlich');
      score -= 20;
    } else if (listingData.title.length < 20) {
      issues.push('Titel ist zu kurz (min. 20 Zeichen)');
      score -= 10;
    } else if (listingData.title.length > 200) {
      issues.push('Titel ist zu lang (max. 200 Zeichen)');
      score -= 10;
    }

    // Bullet points analysis
    const filledBullets = listingData.bulletPoints.filter(bp => bp.trim()).length;
    if (filledBullets < 3) {
      issues.push(`Nur ${filledBullets} von 5 Bullet Points ausgefüllt`);
      score -= 15;
    }

    // Keywords analysis
    if (listingData.keywords.length === 0) {
      suggestions.push('Fügen Sie mindestens 5-10 Keywords hinzu für bessere Sichtbarkeit');
      score -= 10;
    } else if (listingData.keywords.length < 5) {
      suggestions.push(`Nur ${listingData.keywords.length} Keywords - 5-10 werden empfohlen`);
      score -= 5;
    }

    // Price analysis
    if (!listingData.price) {
      issues.push('Preis ist erforderlich');
      score -= 10;
    }

    // Keyword in title check
    const titleLower = (listingData.title || '').toLowerCase();
    const keywordMatches = listingData.keywords.filter(k => titleLower.includes(k.toLowerCase())).length;
    if (keywordMatches === 0 && listingData.keywords.length > 0) {
      suggestions.push('Versuchen Sie, ein Haupt-Keyword in den Titel einzubauen');
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      stats: {
        titleLength: listingData.title.length,
        bulletPoints: filledBullets,
        keywords: listingData.keywords.length,
      },
    };
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

  const FieldScore = ({ value, maxLength, minLength = 0 }) => {
    const fieldScore = calculateFieldScore('field', value, maxLength, minLength);
    const percentage = (value.length / maxLength) * 100;
    return (
      <div className="field-score-container">
        <div className="field-score-info">
          <span className="char-info">{value.length}/{maxLength}</span>
          <span className={`seo-score status-${fieldScore.status}`}>{fieldScore.message}</span>
        </div>
        <div className="score-bar">
          <div
            className={`score-fill status-${fieldScore.status}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="listing-builder-container">
      <div className="builder-header">
        <div className="header-left">
          <h1>🚀 Amazon Listing Builder Pro</h1>
          <p>Erstelle professionelle Amazon-Listings mit Live-Vorschau und KI-Analyse</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-save-main">
          💾 Speichern
        </button>
      </div>

      <div className="builder-layout">
        {/* LEFT SIDE: EDITOR */}
        <div className="editor-panel">
          <div className="tabs-header">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="editor-content">
            {/* BASIC TAB */}
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <h2>Basis-Informationen</h2>
                <div className="form-2col">
                  <div className="form-group">
                    <label>SKU *</label>
                    <input
                      type="text"
                      placeholder="z.B. PROD-12345"
                      value={listing.sku}
                      onChange={(e) => updateField('sku', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>ASIN</label>
                    <input
                      type="text"
                      placeholder="z.B. B08XYZ123ABC"
                      value={listing.asin || ''}
                      onChange={(e) => updateField('asin', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group full">
                  <label>Produkttitel * (max 200 Zeichen)</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    placeholder="Aussagekräftiger Titel mit Keywords"
                    value={listing.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                  <FieldScore value={listing.title} maxLength={200} minLength={20} />
                </div>

                <div className="form-2col">
                  <div className="form-group">
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
                      <option value="books">Bücher</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preis * (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={listing.price}
                      onChange={(e) => updateField('price', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-2col">
                  <div className="form-group">
                    <label>Lagerbestand *</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={listing.stock}
                      onChange={(e) => updateField('stock', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
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

            {/* DESCRIPTIONS TAB */}
            {activeTab === 'descriptions' && (
              <div className="tab-panel">
                <h2>Beschreibungen & Keywords</h2>

                <div className="form-group full">
                  <label>Bullet Points * (5 Stück, max 500 Zeichen)</label>
                  <div className="bullets-container">
                    {listing.bulletPoints.map((bp, i) => (
                      <div key={i} className="bullet-input-group">
                        <span className="bullet-num">{i + 1}.</span>
                        <div style={{ flex: 1 }}>
                          <textarea
                            rows={2}
                            maxLength={500}
                            placeholder={`Wichtiges Merkmal oder Vorteil ${i + 1}`}
                            value={bp}
                            onChange={(e) => updateBulletPoint(i, e.target.value)}
                          />
                          <FieldScore value={bp} maxLength={500} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group full">
                  <label>Suchbegriffe / Keywords</label>
                  <textarea
                    rows={3}
                    placeholder="Geben Sie Keywords durch Komma getrennt ein"
                    value={listing.keywords.join(', ')}
                    onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  />
                </div>

                <div className="form-group full">
                  <label>Langbeschreibung (max 2000 Zeichen)</label>
                  <textarea
                    rows={6}
                    maxLength={2000}
                    placeholder="Detaillierte Produktbeschreibung"
                    value={listing.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                  <FieldScore value={listing.description} maxLength={2000} />
                </div>
              </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
              <div className="tab-panel">
                <h2>Preisgestaltung & Versand</h2>
                <div className="info-box">
                  Preisgestaltung wird separat im <strong>Repricing-Tool</strong> verwaltet
                </div>
              </div>
            )}

            {/* IMAGES TAB */}
            {activeTab === 'images' && (
              <div className="tab-panel">
                <h2>Bilder & Media</h2>
                <div className="upload-area">
                  <input type="file" multiple accept="image/*" hidden id="image-input" />
                  <label htmlFor="image-input" className="upload-label">
                    <p>📤 Bilder hier ablegen</p>
                    <span>oder klicken zum Upload</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: PREVIEW & ANALYSIS */}
        <div className="preview-panel">
          <div className="preview-tabs">
            <button
              className={`preview-tab ${activePreviewTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('preview')}
            >
              👁️ Vorschau
            </button>
            <button
              className={`preview-tab ${activePreviewTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('analysis')}
            >
              🤖 AI-Analyse
            </button>
          </div>

          {/* PREVIEW */}
          <div className="preview-content" style={{ display: activePreviewTab === 'preview' ? 'block' : 'none' }}>
            <div className="amazon-preview">
              <div className="preview-title">{listing.title || 'Produkttitel...'}</div>

              <div className="preview-price">
                <span className="price-label">Preis:</span>
                <span className="price-value">{listing.price ? `€${parseFloat(listing.price).toFixed(2)}` : '–'}</span>
              </div>

              <div className="preview-rating">
                ⭐⭐⭐⭐⭐ 4.5 | 128 Bewertungen
              </div>

              <div className="preview-bullets">
                <h4>Merkmale:</h4>
                {listing.bulletPoints.filter(bp => bp).map((bp, i) => (
                  <div key={i} className="bullet-preview">• {bp.substring(0, 80)}{bp.length > 80 ? '...' : ''}</div>
                ))}
              </div>

              <div className="preview-description">
                <h4>Beschreibung:</h4>
                <p>{listing.description.substring(0, 150)}{listing.description.length > 150 ? '...' : ''}</p>
              </div>

              <button className="btn-add-to-cart">In den Warenkorb</button>
            </div>
          </div>

          {/* AI ANALYSIS */}
          {aiAnalysis && (
            <div className="analysis-content" style={{ display: activePreviewTab === 'analysis' ? 'block' : 'none' }}>
              <div className="score-card">
                <div className="score-circle">
                  <span className="score-number">{aiAnalysis.score}</span>
                  <span className="score-label">Score</span>
                </div>
              </div>

              {aiAnalysis.issues.length > 0 && (
                <div className="issues-box">
                  <h4>⚠️ Probleme</h4>
                  {aiAnalysis.issues.map((issue, i) => (
                    <div key={i} className="issue-item">{issue}</div>
                  ))}
                </div>
              )}

              {aiAnalysis.suggestions.length > 0 && (
                <div className="suggestions-box">
                  <h4>💡 Vorschläge</h4>
                  {aiAnalysis.suggestions.map((sug, i) => (
                    <div key={i} className="suggestion-item">{sug}</div>
                  ))}
                </div>
              )}

              <div className="stats-box">
                <h4>📊 Statistiken</h4>
                <div className="stat-row">
                  <span>Titel-Länge:</span>
                  <span>{aiAnalysis.stats.titleLength}/200</span>
                </div>
                <div className="stat-row">
                  <span>Bullet Points:</span>
                  <span>{aiAnalysis.stats.bulletPoints}/5</span>
                </div>
                <div className="stat-row">
                  <span>Keywords:</span>
                  <span>{aiAnalysis.stats.keywords}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
