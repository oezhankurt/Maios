const BasePlatformAdapter = require('./BasePlatformAdapter');

class KauflandAdapter extends BasePlatformAdapter {
  constructor() {
    super();
    this.platformName = 'kaufland';

    this.fields = {
      title: {
        type: 'string',
        label: 'Produkttitel',
        placeholder: 'Titel für Kaufland',
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
      ean: {
        type: 'string',
        label: 'EAN/Barcode',
        required: true,
      },
      sku: {
        type: 'string',
        label: 'SKU',
        required: false,
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
      manufacturer: {
        type: 'string',
        label: 'Hersteller',
        required: false,
      },
      images: {
        type: 'array',
        label: 'Bilder (URLs)',
        maxItems: 20,
      },
      shippingTime: {
        type: 'string',
        label: 'Lieferzeit (Tage)',
        default: '3',
      },
      condition: {
        type: 'select',
        label: 'Zustand',
        options: ['new', 'used', 'refurbished'],
        default: 'new',
      },
    };

    this.validationRules = {
      title: {
        required: true,
        maxLength: 60,
        minLength: 5,
      },
      description: {
        required: true,
        maxLength: 3000,
      },
      price: {
        required: true,
      },
      ean: {
        required: true,
        pattern: /^\d{8,14}$/,
      },
      quantity: {
        required: true,
      },
      category: {
        required: true,
      },
      images: {
        maxItems: 20,
      },
    };
  }

  transform(universalData) {
    const transformed = {
      title: this.formatTitle(universalData.title || universalData.name),
      description: this.formatDescription(universalData.description),
      price: this.formatPrice(universalData.price),
      ean: universalData.ean,
      quantity: universalData.quantity || 1,
      category: universalData.kauflandCategory || universalData.category,
      images: universalData.images || [],
      condition: universalData.condition || 'new',
      shippingTime: universalData.shippingTime || '3',
    };

    if (universalData.sku) {
      transformed.sku = universalData.sku;
    }

    if (universalData.manufacturer) {
      transformed.manufacturer = universalData.manufacturer;
    }

    const validation = this.validate(transformed);
    if (!validation.isValid) {
      throw new Error(`Kaufland Validierung fehlgeschlagen: ${validation.errors.join('; ')}`);
    }

    return transformed;
  }

  formatTitle(title) {
    if (!title) return '';
    // Kaufland erlaubt 60 Zeichen
    return title.substring(0, 60).trim();
  }

  formatDescription(description) {
    if (!description) return '';
    // Kaufland erlaubt bis zu 3000 Zeichen
    return description.substring(0, 3000).trim();
  }

  formatPrice(price) {
    if (!price) return 0;
    return parseFloat(price).toFixed(2);
  }

  getPublishPayload(transformedData) {
    return {
      platform: 'kaufland',
      listing: {
        ...transformedData,
        publishedAt: new Date(),
      },
    };
  }
}

module.exports = KauflandAdapter;
