class BasePlatformAdapter {
  constructor() {
    this.platformName = 'base';
    this.fields = {};
    this.validationRules = {};
  }

  validate(data) {
    const errors = [];

    for (const [fieldName, rule] of Object.entries(this.validationRules)) {
      const value = data[fieldName];

      if (rule.required && !value) {
        errors.push(`${fieldName} ist erforderlich`);
        continue;
      }

      if (value) {
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${fieldName} darf maximal ${rule.maxLength} Zeichen lang sein (aktuell: ${value.length})`);
        }

        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${fieldName} muss mindestens ${rule.minLength} Zeichen lang sein`);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${fieldName} hat ein ungültiges Format`);
        }

        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`${fieldName} muss einer dieser Werte sein: ${rule.enum.join(', ')}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  transform(universalData) {
    throw new Error('transform() muss in Subklasse implementiert werden');
  }

  getFieldConfig() {
    return {
      platformName: this.platformName,
      fields: this.fields,
      validationRules: this.validationRules,
    };
  }

  formatTitle(title) {
    return title;
  }

  formatDescription(description) {
    return description;
  }

  formatPrice(price) {
    return price;
  }

  getPublishPayload(transformedData) {
    return transformedData;
  }
}

module.exports = BasePlatformAdapter;
