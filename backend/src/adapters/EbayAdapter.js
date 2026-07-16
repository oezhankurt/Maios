const BasePlatformAdapter = require('./BasePlatformAdapter');

class EbayAdapter extends BasePlatformAdapter {
  constructor() {
    super();
    this.platformName = 'ebay';

    this.fields = {
      title: {
        type: 'string',
        label: 'Auktionstitel',
        placeholder: 'Titel für eBay Auktion',
        required: true,
      },
      description: {
        type: 'string',
        label: 'Artikelbeschreibung',
        required: true,
      },
      category: {
        type: 'string',
        label: 'eBay Kategorie-ID',
        required: true,
      },
      price: {
        type: 'number',
        label: 'Startpreis (EUR)',
        required: true,
      },
      quantity: {
        type: 'number',
        label: 'Menge',
        default: 1,
      },
      condition: {
        type: 'select',
        label: 'Zustand',
        options: ['new', 'used', 'refurbished'],
        default: 'new',
      },
      listingType: {
        type: 'select',
        label: 'Angebotstyp',
        options: ['auction', 'fixedPrice'],
        default: 'fixedPrice',
      },
      images: {
        type: 'array',
        label: 'Bilder (URLs)',
        maxItems: 12,
      },
      sku: {
        type: 'string',
        label: 'SKU/Artikel-Nr.',
        required: false,
      },
      shippingCost: {
        type: 'number',
        label: 'Versandkosten (EUR)',
        default: 0,
      },
    };

    this.validationRules = {
      title: {
        required: true,
        maxLength: 80,
        minLength: 5,
      },
      description: {
        required: true,
        maxLength: 4000,
      },
      category: {
        required: true,
      },
      price: {
        required: true,
      },
      images: {
        minItems: 1,
        maxItems: 12,
      },
    };
  }

  transform(universalData) {
    const transformed = {
      title: this.formatTitle(universalData.title || universalData.name),
      description: this.formatDescription(universalData.description),
      category: universalData.ebayCategory || universalData.category,
      price: this.formatPrice(universalData.price),
      quantity: universalData.quantity || 1,
      condition: universalData.condition || 'new',
      listingType: universalData.listingType || 'fixedPrice',
      images: universalData.images || [],
      shippingCost: universalData.shippingCost || 0,
    };

    if (universalData.sku) {
      transformed.sku = universalData.sku;
    }

    const validation = this.validate(transformed);
    if (!validation.isValid) {
      throw new Error(`eBay Validierung fehlgeschlagen: ${validation.errors.join('; ')}`);
    }

    return transformed;
  }

  formatTitle(title) {
    if (!title) return '';
    // eBay erlaubt 80 Zeichen
    return title.substring(0, 80).trim();
  }

  formatDescription(description) {
    if (!description) return '';
    // eBay erlaubt bis zu 4000 Zeichen
    return description.substring(0, 4000).trim();
  }

  formatPrice(price) {
    if (!price) return 0;
    return parseFloat(price).toFixed(2);
  }

  getPublishPayload(transformedData) {
    return {
      platform: 'ebay',
      listing: {
        ...transformedData,
        publishedAt: new Date(),
      },
    };
  }
}

module.exports = EbayAdapter;
