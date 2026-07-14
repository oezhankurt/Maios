/**
 * Operational error carrying an HTTP status code. The centralized error
 * handler distinguishes these (expected, client-facing) from unexpected
 * programmer errors.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, details) {
    return new ApiError(400, msg || 'Bad request', details);
  }

  static unauthorized(msg) {
    return new ApiError(401, msg || 'Unauthorized');
  }

  static forbidden(msg) {
    return new ApiError(403, msg || 'Forbidden');
  }

  static notFound(msg) {
    return new ApiError(404, msg || 'Resource not found');
  }

  static conflict(msg) {
    return new ApiError(409, msg || 'Conflict');
  }
}

module.exports = ApiError;
