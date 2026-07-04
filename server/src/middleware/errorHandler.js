/**
 * Centralised error handler — always returns JSON, never HTML.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Axios/HTTP errors from external APIs
  if (err.response) {
    const status = err.response.status;
    const message =
      status === 401
        ? "Invalid API key"
        : status === 404
        ? "Resource not found"
        : status === 429
        ? "API rate limit exceeded. Please try again later."
        : `External API error (${status})`;
    return res.status(status >= 500 ? 502 : status).json({ success: false, error: message });
  }

  // Request timeout
  if (err.code === "ECONNABORTED") {
    return res.status(504).json({ success: false, error: "External service timed out" });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, error: err.message });
  }

  // Default internal error
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};

module.exports = errorHandler;
