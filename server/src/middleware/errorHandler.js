export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || "Server error.";

  if (err.code === 11000) {
    status = 409;
    message = "That value already exists (for example, the email is already registered).";
  } else if (err.name === "ValidationError") {
    status = 400;
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID.";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Invalid or expired token. Please log in again.";
  } else if (err.name === "MulterError") {
    status = 400;
  }

  if (status === 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status === 500 && process.env.NODE_ENV === "production" ? "Server error." : message,
  });
}
