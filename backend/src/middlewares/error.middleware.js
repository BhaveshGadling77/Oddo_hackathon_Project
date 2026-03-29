const logger = require('../utils/logger');

/**
 * Global error-handling middleware.
 * Must be registered LAST in the Express app (after all routes).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, {
    stack: err.stack,
    user: req.user?.id,
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large' });
  }

  // MySQL duplicate-entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry — record already exists' });
  }

  // JWT errors forwarded manually
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  // Validation errors (express-validator shape)
  if (err.type === 'validation') {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: err.errors });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ success: false, message });
};

module.exports = { errorHandler };