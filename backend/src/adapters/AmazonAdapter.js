const BasePlatformAdapter = require('./BasePlatformAdapter');

class AmazonAdapter extends BasePlatformAdapter {
  constructor() {
    super();
    this.platformName = 'amazon';

    this.fields = {
      title: {
        type: 'string',
        label: 'Produkttitel',
        placeholder: 'Produktname und wichtigste Merkmale',
        required: true,
      },
      bulletPoints: {
        type: 'array',
        label: 'Stichpunkte',
        maxItems: 5,
        required: true,
      },
      description: {
        type: 'string',
        label: 'Produktbeschreibung',
        required: true,
      },
      keywords: {
        type: 'array',
        label: 'Suchbegriffe',
        maxItems: 5,
        required: true,
      },
      asin: {
        type: 'string',
        label: 'ASIN',
        required: false,
      },
      price: {
        type: 'number',
        label: 'Preis (EUR)',
        required: true,
      },
      currency: {
        type: 'string',
        label: 'Währung',
        default: 'EUR',
      },
      images: {
        type: 'array',
        label: 'Bilder (URLs)',
        maxItems: 10,
      },
      sku: {
        type: 'string',
        label: 'SKU',
        required: false,
      },
    };

    this.validationRules = {
      title: {
        required: true,
        maxLength: 125,
        minLength: 10,
      },
      bulletPoints: {
        required: true,
      },
      description: {
        required: true,
        maxLength: 2000,
      },
      keywords: {
        required: true,
      },
      price: {
        required: true,
      },
      images: {
        minItems: 1,
        maxItems: 10,
      },
    };
  }

  transform(universalData) {
    const transformed = {
      title: this.formatTitle(universalData.title || universalData.name),
      bulletPoints: this.formatBulletPoints(universalData.bulletPoints || []),
      description: this.formatDescription(universalData.description),
      keywords: this.formatKeywords(universalData.keywords || []),
      price: this.formatPrice(universalData.price),
      currency: universalData.currency || 'EUR',
      images: universalData.images || [],
    };

    if (universalData.asin) {
      transformed.asin = universalData.asin;
    }

    if (universalData.sku) {
      transformed.sku = universalData.sku;
    }

    const validation = this.validate(transformed);
    if (!validation.isValid) {
      throw new Error(`Amazon Validierung fehlgeschlagen: ${validation.errors.join('; ')}`);
    }

    return transformed;
  }

  formatTitle(title) {
    if (!title) return '';
    return title.substring(0, 125).trim();
  }

  formatBulletPoints(bulletPoints) {
    return bulletPoints
      .slice(0, 5)
      .map((point) => point.substring(0, 255).trim())
      .filter((point) => point.length > 0);
  }

  formatDescription(description) {
    if (!description) return '';
    return description.substring(0, 2000).trim();
  }

  formatKeywords(keywords) {
    return keywords
      .slice(0, 5)
      .map((kw) => kw.trim())
      .filter((kw) => kw.length > 0);
  }

  formatPrice(price) {
    if (!price) return 0;
    return parseFloat(price).toFixed(2);
  }

  getPublishPayload(transformedData) {
    return {
      platform: 'amazon',
      listing: {
        ...transformedData,
        publishedAt: new Date(),
      },
    };
  }
}

module.exports = AmazonAdapter;
