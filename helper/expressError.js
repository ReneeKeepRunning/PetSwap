class ExpressError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Capture stack trace (optional but useful)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ExpressError;
