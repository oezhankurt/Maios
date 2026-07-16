const Joi = require('joi');

const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'E-Mail muss gültig sein',
      'any.required': 'E-Mail ist erforderlich',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Passwort muss mindestens 8 Zeichen lang sein',
      'any.required': 'Passwort ist erforderlich',
    }),
    username: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Benutzername muss mindestens 2 Zeichen lang sein',
      'string.max': 'Benutzername darf maximal 50 Zeichen lang sein',
      'any.required': 'Benutzername ist erforderlich',
    }),
    timezone: Joi.string().optional(),
    language: Joi.string().optional(),
    currency: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'E-Mail muss gültig sein',
      'any.required': 'E-Mail ist erforderlich',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Passwort ist erforderlich',
    }),
  }),

  sendVerificationEmail: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'E-Mail muss gültig sein',
      'any.required': 'E-Mail ist erforderlich',
    }),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Token ist erforderlich',
    }),
  }),

  sendPasswordReset: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'E-Mail muss gültig sein',
      'any.required': 'E-Mail ist erforderlich',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Token ist erforderlich',
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.min': 'Passwort muss mindestens 8 Zeichen lang sein',
      'any.required': 'Passwort ist erforderlich',
    }),
  }),

  amazonConnect: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh Token erforderlich',
    }),
    clientId: Joi.string().optional(),
    clientSecret: Joi.string().optional(),
    sellerId: Joi.string().optional(),
  }),
};

const productSchemas = {
  create: Joi.object({
    asin: Joi.string().length(10).required().messages({
      'string.length': 'ASIN muss genau 10 Zeichen lang sein',
      'any.required': 'ASIN ist erforderlich',
    }),
    title: Joi.string().max(200).required(),
    category: Joi.string().required(),
  }),

  update: Joi.object({
    title: Joi.string().max(200),
    category: Joi.string(),
    notes: Joi.string(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validierungsfehler',
          details: messages,
        },
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  authSchemas,
  productSchemas,
  validate,
};
