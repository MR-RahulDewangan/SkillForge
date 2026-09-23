const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Only include stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
