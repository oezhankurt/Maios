const csv = require('csv-parse/sync');
const { randomUUID } = require('crypto');

class CSVImportService {
  static REQUIRED_FIELDS = ['productName', 'basePrice'];
  static OPTIONAL_FIELDS = ['description', 'sku', 'ean', 'asin', 'category', 'images', 'keywords', 'bulletPoints'];
  static ALL_FIELDS = [...this.REQUIRED_FIELDS, ...this.OPTIONAL_FIELDS];

  static parseCSV(fileContent) {
    try {
      const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      return records;
    } catch (error) {
      throw new Error(`CSV Parsing Error: ${error.message}`);
    }
  }

  static validateCSVData(records) {
    const errors = [];
    const validRecords = [];

    records.forEach((record, index) => {
      const rowErrors = this.validateRecord(record, index + 1);
      if (rowErrors.length > 0) {
        errors.push({ row: index + 1, errors: rowErrors });
      } else {
        validRecords.push(record);
      }
    });

    return { validRecords, errors };
  }

  static validateRecord(record, rowNumber) {
    const errors = [];

    // Check required fields
    this.REQUIRED_FIELDS.forEach((field) => {
      if (!record[field] || record[field].toString().trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate productName
    if (record.productName && record.productName.length > 255) {
      errors.push('productName exceeds 255 characters');
    }

    // Validate price
    if (record.basePrice) {
      const price = parseFloat(record.basePrice);
      if (isNaN(price) || price < 0) {
        errors.push('basePrice must be a valid positive number');
      }
    }

    // Validate EAN if provided
    if (record.ean && !/^\d{8,14}$/.test(record.ean.toString())) {
      errors.push('EAN must be 8-14 digits');
    }

    // Validate ASIN if provided
    if (record.asin && !/^[A-Z0-9]{10}$/.test(record.asin.toString())) {
      errors.push('ASIN must be exactly 10 alphanumeric characters');
    }

    return errors;
  }

  static transformRecords(records) {
    return records.map((record) => {
      const listing = {
        id: randomUUID(),
        productName: record.productName.trim(),
        description: record.description ? record.description.trim() : null,
        basePrice: parseFloat(record.basePrice),
        currency: record.currency ? record.currency.trim().toUpperCase() : 'EUR',
        sku: record.sku ? record.sku.trim() : null,
        ean: record.ean ? record.ean.trim() : null,
        asin: record.asin ? record.asin.trim() : null,
        keywords: this.parseJsonField(record.keywords, []),
        bulletPoints: this.parseJsonField(record.bulletPoints, []),
        images: this.parseJsonField(record.images, []),
        status: 'draft',
        publishedPlatforms: {},
        optimizationScore: 0,
        optimizationReport: {},
        metadata: {
          importedAt: new Date().toISOString(),
          importSource: 'csv',
        },
      };
      return listing;
    });
  }

  static parseJsonField(field, defaultValue = []) {
    if (!field || field.toString().trim() === '') {
      return defaultValue;
    }

    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      if (field.toString().includes('|')) {
        return field.toString().split('|').map((item) => item.trim());
      }
      return [field.toString().trim()];
    }
  }

  static getImportTemplate() {
    return `productName,basePrice,description,sku,ean,asin,category,currency,keywords,bulletPoints,images
"Omega 3 Supplement",19.99,"High quality fish oil supplement","SKU123","1234567890123","B123ABCD45","Health & Beauty","EUR","[\"omega 3\",\"fish oil\"]","[\"Rich in EPA/DHA\",\"Sustainably sourced\"]","[\"https://example.com/image1.jpg\"]"`;
  }
}

module.exports = CSVImportService;
