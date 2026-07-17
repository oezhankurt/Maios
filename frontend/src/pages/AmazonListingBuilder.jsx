import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import '../pages/AmazonListingBuilder.css';

const SECTIONS = [
  { id: 'product-type', label: 'Produkttyp', icon: '📦', substeps: 0 },
  { id: 'listing-details', label: 'Listing-Details', icon: '📝', substeps: 0 },
  { id: 'search-terms', label: 'Suchbegriffe', icon: '🔍', substeps: 0 },
  { id: 'bullet-points', label: 'Merkmale', icon: '⭐', substeps: 0 },
  { id: 'description', label: 'Produktbeschreibung', icon: '📄', substeps: 0 },
  { id: 'images', label: 'Bilder & Videos', icon: '🖼️', substeps: 0 },
  { id: 'pricing', label: 'Preis & Bestand', icon: '💰', substeps: 0 },
  { id: 'shipping', label: 'Versand', icon: '📦', substeps: 0 },
];

export default function AmazonListingBuilder() {
  const [activeSection, setActiveSection] = useState('product-type');
  const [listing, setListing] = useState({
    // Product Type
    productType: '',
    category: '',
    subcategory: '',

    // Listing Details
    sku: '',
    asin: '',
    title: '',
    brand: '',
    manufacturer: '',

    // Search Terms
    keywords: [],
    searchTerms: '',

    // Bullet Points
    bulletPoints: ['', '', '', '', ''],

    // Description
    description: '',
    features: {},

    // Images
    images: [],
    mainImage: '',

    // Pricing
    price: '',
    currency: 'EUR',
    listPrice: '',

    // Inventory
    stock: 0,

    // Shipping
    weight: '',
    dimensions: { length: 0, width: 0, height: 0 },
  });

  const [listingId, setListingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) loadListing(id);
  }, []);

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

    const filledBullets = listingData.bulletPoints.filter(bp => bp.trim()).length;
    if (filledBullets < 3) {
      issues.push(`Nur ${filledBullets} von 5 Merkmalen ausgefüllt`);
      score -= 15;
    }

    if (listingData.keywords.length === 0) {
      suggestions.push('Fügen Sie mindestens 5-10 Suchbegriffe hinzu');
      score -= 10;
    } else if (listingData.keywords.length < 5) {
      suggestions.push(`Nur ${listingData.keywords.length} Suchbegriffe - 5-10 werden empfohlen`);
      score -= 5;
    }

    if (!listingData.price) {
      issues.push('Preis ist erforderlich');
      score -= 10;
    }

    const titleLower = (listingData.title || '').toLowerCase();
    const keywordMatches = listingData.keywords.filter(k => titleLower.includes(k.toLowerCase())).length;
    if (keywordMatches === 0 && listingData.keywords.length > 0) {
      suggestions.push('Verwenden Sie ein Haupt-Keyword im Titel');
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

  const getSectionCompletion = (sectionId) => {
    switch(sectionId) {
      case 'product-type':
        return listing.productType && listing.category ? 100 : 0;
      case 'listing-details':
        return listing.sku && listing.title && listing.brand ? 100 : 50;
      case 'search-terms':
        return listing.keywords.length >= 5 ? 100 : (listing.keywords.length > 0 ? 50 : 0);
      case 'bullet-points':
        const filledBullets = listing.bulletPoints.filter(bp => bp.trim()).length;
        return (filledBullets / 5) * 100;
      case 'description':
        return listing.description.length >= 100 ? 100 : (listing.description.length > 0 ? 50 : 0);
      case 'images':
        return listing.images.length > 0 ? 100 : 0;
      case 'pricing':
        return listing.price ? 100 : 0;
      case 'shipping':
        return listing.weight && listing.dimensions.length ? 100 : 0;
      default:
        return 0;
    }
  };

  const FieldScore = ({ value, maxLength, minLength = 0 }) => {
    const fieldScore = calculateFieldScore('field', value, maxLength, minLength);
    const percentage = (value.length / maxLength) * 100;
    return (
      <div className="field-score-container">
        <div className="field-score-info">
          <span className="char-count">{value.length}/{maxLength}</span>
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

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="listing-builder-pro">
      {/* SIDEBAR NAVIGATION */}
      <aside className="builder-sidebar">
        <div className="sidebar-header">
          <h2>📋 Listing-Erstellung</h2>
          <p>Schritt für Schritt</p>
        </div>

        <nav className="sections-nav">
          {SECTIONS.map((section) => {
            const completion = getSectionCompletion(section.id);
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                className={`section-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="section-icon">{section.icon}</div>
                <div className="section-content">
                  <div className="section-label">{section.label}</div>
                  <div className="section-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                    <span className="progress-percent">{Math.round(completion)}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="overall-score">
            <div className="score-label">Gesamt-Score</div>
            <div className="score-value">{aiAnalysis?.score || 0}</div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-save-main"
          >
            💾 Speichern
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="builder-main">
        <div className="builder-header">
          <div className="header-content">
            <h1>{currentSection?.icon} {currentSection?.label}</h1>
            <p>Perfektionieren Sie Ihr Listing nach Amazon-Standards</p>
          </div>
          <div className="preview-mode-toggle">
            <button
              className={`mode-btn ${previewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setPreviewMode('desktop')}
            >
              🖥️ Desktop
            </button>
            <button
              className={`mode-btn ${previewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setPreviewMode('mobile')}
            >
              📱 Mobile
            </button>
          </div>
        </div>

        <div className="builder-container">
          {/* EDITOR PANEL */}
          <div className="editor-area">
            {/* PRODUCT TYPE */}
            {activeSection === 'product-type' && (
              <section className="section-panel">
                <h2>Produkttyp & Kategorie</h2>
                <p className="section-description">Wählen Sie den Produkttyp und die Amazon-Kategorie</p>

                <div className="form-group">
                  <label>Produkttyp *</label>
                  <select value={listing.productType} onChange={(e) => updateField('productType', e.target.value)}>
                    <option value="">Wählen Sie einen Produkttyp</option>
                    <option value="electronics">Elektronik</option>
                    <option value="home">Haushalt & Garten</option>
                    <option value="sports">Sport & Freizeit</option>
                    <option value="beauty">Beauty & Gesundheit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Kategorie *</label>
                  <select value={listing.category} onChange={(e) => updateField('category', e.target.value)}>
                    <option value="">Kategorie wählen</option>
                    <option value="electronics">Elektronik</option>
                    <option value="home">Haushalt & Garten</option>
                    <option value="sports">Sport & Freizeit</option>
                    <option value="beauty">Beauty & Gesundheit</option>
                    <option value="books">Bücher</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Unterkategorie</label>
                  <input
                    type="text"
                    placeholder="z.B. Küchenzubehör"
                    value={listing.subcategory}
                    onChange={(e) => updateField('subcategory', e.target.value)}
                  />
                </div>
              </section>
            )}

            {/* LISTING DETAILS */}
            {activeSection === 'listing-details' && (
              <section className="section-panel">
                <h2>Listing-Details</h2>
                <p className="section-description">Grundlegende Produktinformationen</p>

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
                      value={listing.asin}
                      onChange={(e) => updateField('asin', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group full">
                  <label>Produkttitel * (max 200 Zeichen)</label>
                  <textarea
                    rows={3}
                    maxLength={200}
                    placeholder="Aussagekräftiger Titel mit Hauptkeywords"
                    value={listing.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                  <FieldScore value={listing.title} maxLength={200} minLength={20} />
                </div>

                <div className="form-2col">
                  <div className="form-group">
                    <label>Marke *</label>
                    <input
                      type="text"
                      placeholder="Markennamen eingeben"
                      value={listing.brand}
                      onChange={(e) => updateField('brand', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hersteller</label>
                    <input
                      type="text"
                      placeholder="Herstellernamen eingeben"
                      value={listing.manufacturer}
                      onChange={(e) => updateField('manufacturer', e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* SEARCH TERMS */}
            {activeSection === 'search-terms' && (
              <section className="section-panel">
                <h2>Suchbegriffe & Keywords</h2>
                <p className="section-description">Fügen Sie bis zu 10 relevante Suchbegriffe hinzu (kommagetrennt)</p>

                <div className="form-group full">
                  <label>Suchbegriffe * (max 10, durch Komma getrennt)</label>
                  <textarea
                    rows={4}
                    placeholder="Keyword 1, Keyword 2, Keyword 3..."
                    value={listing.keywords.join(', ')}
                    onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  />
                  <div className="keywords-info">
                    <span>Eingegeben: {listing.keywords.length}/10</span>
                    {listing.keywords.length > 10 && <span className="warning">⚠️ Zu viele Keywords</span>}
                  </div>
                </div>

                {listing.keywords.length > 0 && (
                  <div className="keywords-list">
                    <h3>Ihre Keywords:</h3>
                    <div className="keyword-tags">
                      {listing.keywords.map((kw, i) => (
                        <span key={i} className="keyword-tag">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* BULLET POINTS */}
            {activeSection === 'bullet-points' && (
              <section className="section-panel">
                <h2>Produktmerkmale</h2>
                <p className="section-description">Maximale 5 Merkmale à max. 500 Zeichen</p>

                <div className="bullets-container">
                  {listing.bulletPoints.map((bp, i) => (
                    <div key={i} className="bullet-item">
                      <div className="bullet-header">
                        <span className="bullet-num">Merkmal {i + 1}</span>
                        {bp && <span className="bullet-status">✓ Ausgefüllt</span>}
                      </div>
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder={`Wichtiges Merkmal oder Vorteil (z.B. Material, Größe, Features)`}
                        value={bp}
                        onChange={(e) => updateBulletPoint(i, e.target.value)}
                      />
                      <FieldScore value={bp} maxLength={500} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DESCRIPTION */}
            {activeSection === 'description' && (
              <section className="section-panel">
                <h2>Produktbeschreibung</h2>
                <p className="section-description">Detaillierte Beschreibung (max 2000 Zeichen)</p>

                <div className="form-group full">
                  <label>Langbeschreibung</label>
                  <textarea
                    rows={8}
                    maxLength={2000}
                    placeholder="Detaillierte Produktbeschreibung mit Features, Vorteilen und Anwendungen"
                    value={listing.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                  <FieldScore value={listing.description} maxLength={2000} />
                </div>
              </section>
            )}

            {/* IMAGES */}
            {activeSection === 'images' && (
              <section className="section-panel">
                <h2>Bilder & Videos</h2>
                <p className="section-description">Hauptbild erforderlich, bis zu 10 Zusatzbilder</p>

                <div className="upload-area">
                  <input type="file" multiple accept="image/*" hidden id="image-input" />
                  <label htmlFor="image-input" className="upload-label">
                    <div className="upload-icon">🖼️</div>
                    <p>Bilder hierher ziehen oder klicken</p>
                    <span>JPEG, PNG - Max. 10 MB pro Bild</span>
                  </label>
                </div>

                {listing.images.length > 0 && (
                  <div className="images-preview">
                    <h3>Hochgeladene Bilder ({listing.images.length})</h3>
                    <p className="hint">Erste Position ist Hauptbild</p>
                  </div>
                )}
              </section>
            )}

            {/* PRICING */}
            {activeSection === 'pricing' && (
              <section className="section-panel">
                <h2>Preis & Bestand</h2>
                <p className="section-description">Verkaufspreis und verfügbare Menge</p>

                <div className="form-2col">
                  <div className="form-group">
                    <label>Verkaufspreis * (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={listing.price}
                      onChange={(e) => updateField('price', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>UVP/Listenpreis (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={listing.listPrice}
                      onChange={(e) => updateField('listPrice', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Lagerbestand *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={listing.stock}
                    onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="info-box">
                  <p><strong>💡 Tipp:</strong> Detaillierte Repricing-Regeln finden Sie im Repricing-Tool</p>
                </div>
              </section>
            )}

            {/* SHIPPING */}
            {activeSection === 'shipping' && (
              <section className="section-panel">
                <h2>Versand & Gewicht</h2>
                <p className="section-description">Versandspezifikationen für Amazon</p>

                <div className="form-group">
                  <label>Gewicht (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={listing.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Dimensionen (cm)</label>
                  <div className="form-3col">
                    <input
                      type="number"
                      placeholder="Länge"
                      value={listing.dimensions.length}
                      onChange={(e) => updateField('dimensions', {...listing.dimensions, length: parseFloat(e.target.value)})}
                    />
                    <input
                      type="number"
                      placeholder="Breite"
                      value={listing.dimensions.width}
                      onChange={(e) => updateField('dimensions', {...listing.dimensions, width: parseFloat(e.target.value)})}
                    />
                    <input
                      type="number"
                      placeholder="Höhe"
                      value={listing.dimensions.height}
                      onChange={(e) => updateField('dimensions', {...listing.dimensions, height: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* PREVIEW PANEL */}
          <aside className={`preview-area preview-${previewMode}`}>
            <div className="preview-header">
              <h3>Live-Vorschau</h3>
              <div className="ai-score">
                <span className="score-label">KI-Score</span>
                <span className="score-badge">{aiAnalysis?.score || 0}</span>
              </div>
            </div>

            <div className={`amazon-preview ${previewMode}`}>
              <div className="product-image">
                <div className="image-placeholder">📸 Produktbild</div>
              </div>

              <h2 className="preview-title">{listing.title || 'Ihr Produkttitel wird hier angezeigt...'}</h2>

              <div className="preview-rating">
                <span>⭐⭐⭐⭐⭐</span>
                <span className="rating-count">128 Bewertungen</span>
              </div>

              <div className="preview-price">
                <span className="price-currency">EUR</span>
                <span className="price-value">{listing.price ? parseFloat(listing.price).toFixed(2) : '–'}</span>
                {listing.listPrice && (
                  <span className="list-price">UVP: €{parseFloat(listing.listPrice).toFixed(2)}</span>
                )}
              </div>

              {listing.bulletPoints.some(bp => bp) && (
                <div className="preview-bullets">
                  <h4>Highlights:</h4>
                  {listing.bulletPoints.filter(bp => bp).map((bp, i) => (
                    <div key={i} className="bullet-line">
                      • {bp.substring(0, 100)}{bp.length > 100 ? '...' : ''}
                    </div>
                  ))}
                </div>
              )}

              {listing.description && (
                <div className="preview-description">
                  <h4>Beschreibung:</h4>
                  <p>{listing.description.substring(0, 200)}{listing.description.length > 200 ? '...' : ''}</p>
                </div>
              )}

              <button className="btn-add-to-cart">In den Warenkorb</button>
            </div>

            {/* AI ANALYSIS */}
            {aiAnalysis && (
              <div className="ai-analysis">
                <h3>📊 KI-Analyse</h3>

                <div className="analysis-score">
                  <div className="score-circle">
                    <span className="score-number">{aiAnalysis.score}</span>
                  </div>
                  <div className="score-text">
                    {aiAnalysis.score >= 80 ? '✅ Ausgezeichnet' :
                     aiAnalysis.score >= 60 ? '🟡 Gut' :
                     aiAnalysis.score >= 40 ? '🟠 Befriedigend' :
                     '❌ Verbesserungsbedarf'}
                  </div>
                </div>

                {aiAnalysis.issues.length > 0 && (
                  <div className="analysis-section issues">
                    <h4>⚠️ Kritische Punkte</h4>
                    {aiAnalysis.issues.map((issue, i) => (
                      <div key={i} className="issue-item">{issue}</div>
                    ))}
                  </div>
                )}

                {aiAnalysis.suggestions.length > 0 && (
                  <div className="analysis-section suggestions">
                    <h4>💡 Verbesserungsvorschläge</h4>
                    {aiAnalysis.suggestions.map((sug, i) => (
                      <div key={i} className="suggestion-item">{sug}</div>
                    ))}
                  </div>
                )}

                <div className="analysis-section stats">
                  <h4>📈 Statistiken</h4>
                  <div className="stat-item">
                    <span>Titel-Länge</span>
                    <span>{aiAnalysis.stats.titleLength}/200</span>
                  </div>
                  <div className="stat-item">
                    <span>Merkmale ausgefüllt</span>
                    <span>{aiAnalysis.stats.bulletPoints}/5</span>
                  </div>
                  <div className="stat-item">
                    <span>Suchbegriffe</span>
                    <span>{aiAnalysis.stats.keywords}/10</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
