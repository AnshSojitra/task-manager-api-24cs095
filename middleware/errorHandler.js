/**
 * Global Error Handling Middleware
 * Catches errors, formats consistent JSON responses, and hides stack traces from clients.
 */
const errorHandler = (err, req, res, next) => {
  // Log error stack internally for server diagnostics
  console.error(`[Server Error] ${err.name || "Error"}: ${err.message}`);

  // Handle client-side parsing errors (e.g., malformed JSON payload from express.json)
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    error: statusCode === 500 ? "An unexpected server error occurred." : err.name,
  });
};

module.exports = errorHandler;