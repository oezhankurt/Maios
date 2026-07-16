const platformManager = require('../adapters/PlatformManager');

class AIOptimizationService {
  async optimizeListingForPlatform(listingData, platform) {
    const validation = platformManager.validateForPlatform(platform, listingData);

    if (!validation.isValid) {
      throw new Error(`Listing validiert nicht für ${platform}: ${validation.errors.join('; ')}`);
    }

    const optimized = { ...listingData };

    switch (platform) {
      case 'amazon':
        return this.optimizeForAmazon(optimized);
      case 'ebay':
        return this.optimizeForEbay(optimized);
      case 'kaufland':
        return this.optimizeForKaufland(optimized);
      case 'otto':
        return this.optimizeForOtto(optimized);
      default:
        return optimized;
    }
  }

  optimizeForAmazon(data) {
    // Titel-Optimierung: Wichtigste Keywords + Brand + Haupt-Features
    const titleParts = [];

    if (data.keywords && data.keywords.length > 0) {
      titleParts.push(data.keywords[0]);
    }

    if (data.name && !titleParts.join('').includes(data.name)) {
      titleParts.push(data.name);
    }

    if (data.keywords && data.keywords.length > 1) {
      titleParts.push(`(${data.keywords[1]})`);
    }

    data.title = titleParts.join(' ').substring(0, 125).trim();

    // Bullet Points: Top 5 Keywords in Stichpunkte integrieren
    if ((!data.bulletPoints || data.bulletPoints.length === 0) && data.keywords) {
      data.bulletPoints = [
        `✓ ${data.keywords[0] || 'Qualitätsprodukt'}`,
        `✓ ${data.keywords[1] || 'Premium-Qualität'}`,
        `✓ ${data.keywords[2] || 'Beste Ergebnisse'}`,
        `✓ ${data.description ? this.truncate(data.description, 250) : 'Hochwertige Materialien'}`,
        `✓ Schnelle Lieferung & Top-Kundensupport`,
      ].filter((p) => p.length > 0);
    }

    return data;
  }

  optimizeForEbay(data) {
    // eBay: Kurzer, prägnanter Titel mit Keywords
    const titleParts = [];

    if (data.keywords && data.keywords.length > 0) {
      titleParts.push(data.keywords[0]);
    }

    if (data.name) {
      titleParts.push(data.name);
    }

    data.title = titleParts.join(' ').substring(0, 80).trim();

    // eBay braucht keine Bullet Points, aber gute Beschreibung
    if (!data.description || data.description.length < 100) {
      data.description = `
${data.name || 'Hochwertiges Produkt'}

Merkmale:
${(data.keywords || []).slice(0, 3).map((kw) => `• ${kw}`).join('\n')}

Zustand: ${data.condition || 'Neu'}
Versand: Schnell & zuverlässig
      `.trim();
    }

    return data;
  }

  optimizeForKaufland(data) {
    // Kaufland: Prägnant, mit Keywords
    const titleParts = [];

    if (data.keywords && data.keywords.length > 0) {
      titleParts.push(data.keywords[0]);
    }

    if (data.name) {
      titleParts.push(data.name);
    }

    data.title = titleParts.join(' - ').substring(0, 60).trim();

    // Kaufland braucht gute Hersteller-Info
    if (!data.manufacturer && data.name) {
      data.manufacturer = this.extractBrand(data.name);
    }

    return data;
  }

  optimizeForOtto(data) {
    // Otto: Strukturiert mit Attributen
    const titleParts = [];

    if (data.keywords && data.keywords.length > 0) {
      titleParts.push(data.keywords[0]);
    }

    if (data.name) {
      titleParts.push(data.name);
    }

    data.title = titleParts.join(' - ').substring(0, 70).trim();

    // Otto liebt Attribute
    if (!data.attributes) {
      data.attributes = {};
    }

    if (data.keywords) {
      data.attributes.keywords = data.keywords.slice(0, 3);
    }

    if (data.name) {
      data.attributes.productName = data.name;
    }

    return data;
  }

  extractBrand(productName) {
    // Versuche Brand aus Produktnamen zu extrahieren
    const commonBrands = [
      'Samsung',
      'Apple',
      'Sony',
      'LG',
      'Philips',
      'Bosch',
      'Siemens',
      'Electrolux',
    ];

    for (const brand of commonBrands) {
      if (productName.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    return productName.split(' ')[0];
  }

  truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  generateKeywordSuggestions(productName, description) {
    const keywords = [];

    // Extrahiere Schlüsselwörter aus Produktname
    const nameKeywords = productName
      .toLowerCase()
      .split(/[\s\-,]+/)
      .filter((word) => word.length > 3);

    keywords.push(...nameKeywords.slice(0, 3));

    // Extrahiere aus Beschreibung (erste aussagekräftige Wörter)
    if (description) {
      const descKeywords = description
        .toLowerCase()
        .split(/[\s\-,\.]+/)
        .filter(
          (word) =>
            word.length > 4 &&
            !['dieser', 'dieser', 'welche', 'artikel', 'produkt'].includes(word)
        );

      keywords.push(...descKeywords.slice(0, 2));
    }

    // Entferne Duplikate
    return [...new Set(keywords)].slice(0, 5);
  }

  async generateOptimizedTitle(productName, keywords, maxLength = 125) {
    // Einfache Titel-Generierung
    const parts = [];

    // Hauptkeyword zuerst
    if (keywords && keywords.length > 0) {
      parts.push(keywords[0]);
    }

    // Dann Produktname
    if (productName) {
      parts.push(productName);
    }

    // Optional weitere Keywords
    if (keywords && keywords.length > 1) {
      const additionalKeywords = keywords.slice(1, 2).join(', ');
      if (additionalKeywords) {
        parts.push(`(${additionalKeywords})`);
      }
    }

    const title = parts.join(' ').substring(0, maxLength).trim();

    return title;
  }

  async generateOptimizedDescription(productName, keywords, originalDescription) {
    // Struktur: Kurze Einleitung + Keywords + Originalbeschreibung
    const lines = [];

    lines.push(`🎯 ${productName}`);
    lines.push('');

    if (keywords && keywords.length > 0) {
      lines.push('✨ Highlights:');
      keywords.slice(0, 5).forEach((kw) => {
        lines.push(`  • ${kw}`);
      });
      lines.push('');
    }

    if (originalDescription) {
      lines.push(originalDescription);
    }

    return lines.join('\n');
  }

  calculateOptimizationScore(listingData, platform) {
    let score = 0;
    const maxScore = 100;

    // Titel vorhanden? (20 Punkte)
    if (listingData.title && listingData.title.length > 10) {
      score += 20;
    }

    // Beschreibung vorhanden? (25 Punkte)
    if (listingData.description && listingData.description.length > 50) {
      score += 25;
    }

    // Keywords vorhanden? (20 Punkte)
    if (listingData.keywords && listingData.keywords.length >= 3) {
      score += 20;
    }

    // Bilder vorhanden? (15 Punkte)
    if (listingData.images && listingData.images.length >= 1) {
      score += 15;
    }

    // Preis vorhanden? (10 Punkte)
    if (listingData.price && listingData.price > 0) {
      score += 10;
    }

    // Plattform-spezifische Bonuspunkte
    if (platform === 'amazon' && listingData.bulletPoints && listingData.bulletPoints.length >= 3) {
      score += 10;
    }

    return Math.min(score, maxScore);
  }

  getOptimizationRecommendations(listingData, platform) {
    const recommendations = [];

    if (!listingData.title || listingData.title.length < 10) {
      recommendations.push('❌ Titel ist zu kurz oder fehlt');
    }

    if (!listingData.description || listingData.description.length < 50) {
      recommendations.push('❌ Beschreibung ist zu kurz oder fehlt');
    }

    if (!listingData.keywords || listingData.keywords.length < 3) {
      recommendations.push('⚠️ Weniger als 3 Keywords - mehr Keywords erhöhen Sichtbarkeit');
    }

    if (!listingData.images || listingData.images.length === 0) {
      recommendations.push('⚠️ Keine Bilder - Bilder sind wichtig für Conversions');
    }

    if (platform === 'amazon' && (!listingData.bulletPoints || listingData.bulletPoints.length < 3)) {
      recommendations.push('⚠️ Weniger als 3 Bullet Points - Amazon empfiehlt 5 Punkte');
    }

    if (listingData.price && listingData.price < 1) {
      recommendations.push('❌ Preis muss gesetzt sein');
    }

    return recommendations;
  }
}

module.exports = new AIOptimizationService();
