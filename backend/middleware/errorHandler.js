// middleware/errorHandler.js

/**
 * 404 Not Found Handler
 * Catches all requests that don't match any routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  });
};

/**
 * Global Error Handler
 * Catches all errors passed via next(error)
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = { notFoundHandler, globalErrorHandler };