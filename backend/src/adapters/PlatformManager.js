const AmazonAdapter = require('./AmazonAdapter');
const EbayAdapter = require('./EbayAdapter');
const KauflandAdapter = require('./KauflandAdapter');
const OttoAdapter = require('./OttoAdapter');

class PlatformManager {
  constructor() {
    this.adapters = {
      amazon: new AmazonAdapter(),
      ebay: new EbayAdapter(),
      kaufland: new KauflandAdapter(),
      otto: new OttoAdapter(),
    };
  }

  getAvailablePlatforms() {
    return Object.keys(this.adapters);
  }

  getPlatformConfig(platformName) {
    const adapter = this.adapters[platformName];
    if (!adapter) {
      throw new Error(`Plattform "${platformName}" nicht unterstützt`);
    }
    return adapter.getFieldConfig();
  }

  getAllPlatformConfigs() {
    const configs = {};
    for (const [platform, adapter] of Object.entries(this.adapters)) {
      configs[platform] = adapter.getFieldConfig();
    }
    return configs;
  }

  transformForPlatform(platformName, universalData) {
    const adapter = this.adapters[platformName];
    if (!adapter) {
      throw new Error(`Plattform "${platformName}" nicht unterstützt`);
    }
    return adapter.transform(universalData);
  }

  transformForMultiplePlatforms(platformNames, universalData) {
    const results = {};
    const errors = {};

    for (const platform of platformNames) {
      try {
        results[platform] = this.transformForPlatform(platform, universalData);
      } catch (error) {
        errors[platform] = error.message;
      }
    }

    return {
      success: Object.keys(results),
      failed: Object.keys(errors),
      data: results,
      errors,
    };
  }

  validateForPlatform(platformName, data) {
    const adapter = this.adapters[platformName];
    if (!adapter) {
      throw new Error(`Plattform "${platformName}" nicht unterstützt`);
    }
    return adapter.validate(data);
  }

  validateForMultiplePlatforms(platformNames, data) {
    const results = {};

    for (const platform of platformNames) {
      results[platform] = this.validateForPlatform(platform, data);
    }

    return results;
  }

  getPublishPayload(platformName, transformedData) {
    const adapter = this.adapters[platformName];
    if (!adapter) {
      throw new Error(`Plattform "${platformName}" nicht unterstützt`);
    }
    return adapter.getPublishPayload(transformedData);
  }

  getMultiPlatformPublishPayload(transformedDataMap) {
    const payloads = {};

    for (const [platform, data] of Object.entries(transformedDataMap)) {
      payloads[platform] = this.getPublishPayload(platform, data);
    }

    return payloads;
  }

  // Utility: Extrahiere plattformspezifische Anforderungen
  getPlatformRequirements(platformName) {
    const config = this.getPlatformConfig(platformName);
    const requirements = {
      platform: platformName,
      requiredFields: [],
      optionalFields: [],
      fieldLimits: {},
    };

    for (const [fieldName, rule] of Object.entries(config.validationRules)) {
      if (rule.required) {
        requirements.requiredFields.push(fieldName);
      } else {
        requirements.optionalFields.push(fieldName);
      }

      if (rule.maxLength) {
        requirements.fieldLimits[fieldName] = `Max: ${rule.maxLength} Zeichen`;
      }
    }

    return requirements;
  }
}

module.exports = new PlatformManager();
