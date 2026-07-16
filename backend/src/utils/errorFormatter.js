class ApiErrorResponse {
  constructor(message, statusCode = 400, details = null) {
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    const response = {
      success: false,
      error: {
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
      },
    };

    if (this.details) {
      response.error.details = this.details;
    }

    return response;
  }
}

function formatError(err, req = null) {
  if (err instanceof ApiErrorResponse) {
    return {
      statusCode: err.statusCode,
      body: err.toJSON(),
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return {
      statusCode: 400,
      body: new ApiErrorResponse(
        'Validierungsfehler',
        400,
        err.errors || [err.message]
      ).toJSON(),
    };
  }

  // Database errors
  if (err.name === 'SequelizeError' || err.name === 'SequelizeValidationError') {
    console.error('[DB ERROR]', err);
    return {
      statusCode: 400,
      body: new ApiErrorResponse(
        'Datenbankfehler',
        400,
        process.env.NODE_ENV === 'development' ? err.message : null
      ).toJSON(),
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      body: new ApiErrorResponse('Ungültiger Token', 401).toJSON(),
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      body: new ApiErrorResponse('Token abgelaufen', 401).toJSON(),
    };
  }

  // Generic server error
  console.error('[ERROR]', err);
  return {
    statusCode: 500,
    body: new ApiErrorResponse(
      'Interner Serverfehler',
      500,
      process.env.NODE_ENV === 'development' ? err.message : null
    ).toJSON(),
  };
}

module.exports = {
  ApiErrorResponse,
  formatError,
};
