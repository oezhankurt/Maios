const BasePlatformAdapter = require('./BasePlatformAdapter');

class OttoAdapter extends BasePlatformAdapter {
  constructor() {
    super();
    this.platformName = 'otto';

    this.fields = {
      title: {
        type: 'string',
        label: 'Produkttitel',
        placeholder: 'Titel für Otto',
        required: true,
      },
      description: {
        type: 'string',
        label: 'Produktbeschreibung',
        required: true,
      },
      price: {
        type: 'number',
        label: 'Preis (EUR)',
        required: true,
      },
      sku: {
        type: 'string',
        label: 'SKU/Artikel-Nr.',
        required: true,
      },
      quantity: {
        type: 'number',
        label: 'Lagerbestand',
        default: 1,
      },
      category: {
        type: 'string',
        label: 'Kategorie',
        required: true,
      },
      attributes: {
        type: 'object',
        label: 'Produktattribute',
        required: false,
      },
      images: {
        type: 'array',
        label: 'Bilder (URLs)',
        maxItems: 15,
      },
      brand: {
        type: 'string',
        label: 'Marke',
        required: false,
      },
      weight: {
        type: 'number',
        label: 'Gewicht (kg)',
        required: false,
      },
      dimensions: {
        type: 'object',
        label: 'Abmessungen (L x B x H cm)',
        properties: {
          length: 'number',
          width: 'number',
          height: 'number',
        },
      },
    };

    this.validationRules = {
      title: {
        required: true,
        maxLength: 70,
        minLength: 5,
      },
      description: {
        required: true,
        maxLength: 2500,
      },
      price: {
        required: true,
      },
      sku: {
        required: true,
      },
      quantity: {
        required: true,
      },
      category: {
        required: true,
      },
      images: {
        minItems: 1,
        maxItems: 15,
      },
    };
  }

  transform(universalData) {
    const transformed = {
      title: this.formatTitle(universalData.title || universalData.name),
      description: this.formatDescription(universalData.description),
      price: this.formatPrice(universalData.price),
      sku: universalData.sku,
      quantity: universalData.quantity || 1,
      category: universalData.ottoCategory || universalData.category,
      images: universalData.images || [],
    };

    if (universalData.brand) {
      transformed.brand = universalData.brand;
    }

    if (universalData.weight) {
      transformed.weight = universalData.weight;
    }

    if (universalData.dimensions) {
      transformed.dimensions = universalData.dimensions;
    }

    // Zusätzliche Otto-Attribute
    if (universalData.attributes) {
      transformed.attributes = universalData.attributes;
    }

    const validation = this.validate(transformed);
    if (!validation.isValid) {
      throw new Error(`Otto Validierung fehlgeschlagen: ${validation.errors.join('; ')}`);
    }

    return transformed;
  }

  formatTitle(title) {
    if (!title) return '';
    // Otto erlaubt 70 Zeichen
    return title.substring(0, 70).trim();
  }

  formatDescription(description) {
    if (!description) return '';
    // Otto erlaubt bis zu 2500 Zeichen
    return description.substring(0, 2500).trim();
  }

  formatPrice(price) {
    if (!price) return 0;
    return parseFloat(price).toFixed(2);
  }

  getPublishPayload(transformedData) {
    return {
      platform: 'otto',
      listing: {
        ...transformedData,
        publishedAt: new Date(),
      },
    };
  }
}

module.exports = OttoAdapter;
