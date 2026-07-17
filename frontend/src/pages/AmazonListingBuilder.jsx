import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';
import '../pages/AmazonListingBuilder.css';

const STEPS = [
  { id: 1, label: 'Produktinformationen', icon: '📦' },
  { id: 2, label: 'Bilder & Videos', icon: '🖼️' },
  { id: 3, label: 'Beschreibung', icon: '📝' },
  { id: 4, label: 'Attribute', icon: '⚙️' },
  { id: 5, label: 'Review & Speichern', icon: '✅' },
];

export default function AmazonListingBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
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
      issues.push(`Nur ${filledBullets} von 5 Bullet Points ausgefüllt`);
      score -= 15;
    }

    if (listingData.keywords.length === 0) {
      suggestions.push('Fügen Sie mindestens 5-10 Keywords hinzu');
      score -= 10;
    } else if (listingData.keywords.length < 5) {
      suggestions.push(`Nur ${listingData.keywords.length} Keywords - 5-10 werden empfohlen`);
      score -= 5;
    }

    if (!listingData.price) {
      issues.push('Preis ist erforderlich');
      score -= 10;
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

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return listing.sku && listing.title && listing.category;
      case 2:
        return listing.images.length > 0;
      case 3:
        return listing.bulletPoints.filter(bp => bp.trim()).length >= 3;
      case 4:
        return listing.price && listing.stock >= 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const FieldScore = ({ value, maxLength, minLength = 0 }) => {
    let status = 'empty';
    let message = 'Erforderlich';

    if (value && value.length > 0) {
      if (value.length < minLength) {
        status = 'warning';
        message = `Zu kurz (min. ${minLength})`;
      } else if (value.length > maxLength) {
        status = 'error';
        message = `Zu lang (max. ${maxLength})`;
      } else if (value.length < maxLength * 0.5) {
        status = 'info';
        message = `${maxLength - value.length} Zeichen frei`;
      } else {
        status = 'good';
        message = `${maxLength - value.length} Zeichen frei`;
      }
    }

    const percentage = (value.length / maxLength) * 100;
    return (
      <div className="field-score-container">
        <div className="field-score-info">
          <span className="char-count">{value.length}/{maxLength}</span>
          <span className={`seo-score status-${status}`}>{message}</span>
        </div>
        <div className="score-bar">
          <div
            className={`score-fill status-${status}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="listing-wizard-container">
      {/* HEADER */}
      <div className="wizard-header">
        <h1>🚀 Amazon Listing Builder Pro</h1>
        <div className="step-indicator">
          <span className="step-number">{currentStep} von {STEPS.length}</span>
          <a href="/" className="close-btn">✕</a>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="wizard-layout">
        {/* LEFT: SIDEBAR */}
        <aside className="wizard-sidebar">
          <h3>Schritte</h3>
          <nav className="steps-nav">
            {STEPS.map((step) => {
              const completed = isStepComplete(step.id);
              const active = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  className={`step-item ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(step.id)}
                  disabled={!completed && step.id > currentStep}
                >
                  <div className="step-checkbox">
                    {completed ? '✓' : step.id}
                  </div>
                  <div className="step-label">{step.label}</div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT: CONTENT */}
        <main className="wizard-content">
          {/* STEP 1: PRODUKTINFORMATIONEN */}
          {currentStep === 1 && (
            <div className="step-panel">
              <h2>Produktinformationen</h2>
              <p className="step-desc">Grundlegende Daten zu Ihrem Produkt</p>

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
                  placeholder="Aussagekräftiger Titel mit Keywords"
                  value={listing.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
                <FieldScore value={listing.title} maxLength={200} minLength={20} />
              </div>

              <div className="form-2col">
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
                  <label>Marke</label>
                  <input
                    type="text"
                    placeholder="Ihre Marke"
                    value={listing.brand || ''}
                    onChange={(e) => updateField('brand', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BILDER & VIDEOS */}
          {currentStep === 2 && (
            <div className="step-panel">
              <h2>Bilder & Videos</h2>
              <p className="step-desc">Hochqualitative Produktbilder für bessere Konversion</p>

              <div className="upload-area">
                <input type="file" multiple accept="image/*" hidden id="image-input" />
                <label htmlFor="image-input" className="upload-label">
                  <p>📤 Bilder hier ablegen</p>
                  <span>oder klicken zum Upload</span>
                </label>
              </div>

              <div className="info-box">
                <p><strong>💡 Tipp:</strong> Mindestens 3 hochwertige Bilder werden empfohlen. Erste Position ist das Hauptbild.</p>
              </div>
            </div>
          )}

          {/* STEP 3: BESCHREIBUNG */}
          {currentStep === 3 && (
            <div className="step-panel">
              <h2>Produktbeschreibung</h2>
              <p className="step-desc">Merkmale, Keywords und Details</p>

              <div className="form-group full">
                <label>Bullet Points * (5 Stück, max 500 Zeichen)</label>
                <div className="bullets-container">
                  {listing.bulletPoints.map((bp, i) => (
                    <div key={i} className="bullet-item">
                      <div className="bullet-header">
                        <span className="bullet-num">Merkmal {i + 1}</span>
                        {bp && <span className="bullet-status">✓</span>}
                      </div>
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder={`Wichtiges Merkmal oder Vorteil`}
                        value={bp}
                        onChange={(e) => updateBulletPoint(i, e.target.value)}
                      />
                      <FieldScore value={bp} maxLength={500} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group full">
                <label>Suchbegriffe / Keywords</label>
                <textarea
                  rows={3}
                  placeholder="Komma-getrennt: Keyword1, Keyword2, Keyword3..."
                  value={listing.keywords.join(', ')}
                  onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                />
                <div className="keywords-info">Eingegeben: {listing.keywords.length}</div>
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

          {/* STEP 4: ATTRIBUTE */}
          {currentStep === 4 && (
            <div className="step-panel">
              <h2>Preis & Bestand</h2>
              <p className="step-desc">Preisgestaltung und Lagerbestände</p>

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
                  <label>Lagerbestand *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={listing.stock}
                    onChange={(e) => updateField('stock', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-2col">
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
                  <label>Höhe (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={listing.dimensions.height}
                    onChange={(e) => updateField('dimensions', {...listing.dimensions, height: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="info-box">
                <p><strong>💡 Tipp:</strong> Detaillierte Repricing-Regeln können Sie später im Repricing-Tool konfigurieren.</p>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SPEICHERN */}
          {currentStep === 5 && (
            <div className="step-panel">
              <h2>Review & Speichern</h2>
              <p className="step-desc">Überprüfen Sie Ihr Listing vor dem Speichern</p>

              <div className="review-section">
                <h3>Zusammenfassung</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Titel:</span>
                    <span className="review-value">{listing.title || '–'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">SKU:</span>
                    <span className="review-value">{listing.sku || '–'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Kategorie:</span>
                    <span className="review-value">{listing.category || '–'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Preis:</span>
                    <span className="review-value">€{parseFloat(listing.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Lagerbestand:</span>
                    <span className="review-value">{listing.stock}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Merkmale:</span>
                    <span className="review-value">{listing.bulletPoints.filter(bp => bp).length}/5</span>
                  </div>
                </div>
              </div>

              {aiAnalysis && (
                <div className="ai-summary">
                  <h3>KI-Analyse Score: {aiAnalysis.score}</h3>
                  {aiAnalysis.issues.length > 0 && (
                    <div className="issues">
                      <h4>⚠️ Kritische Punkte:</h4>
                      {aiAnalysis.issues.map((issue, i) => (
                        <p key={i}>• {issue}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="wizard-actions">
            <button
              className="btn-back"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              ← Zurück
            </button>

            {currentStep < 5 ? (
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
              >
                Weiter →
              </button>
            ) : (
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={loading}
              >
                💾 Speichern
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
