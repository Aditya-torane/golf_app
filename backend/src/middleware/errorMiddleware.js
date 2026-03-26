function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
  }
  if (![400, 401, 403, 404, 409].includes(statusCode) && res.statusCode >= 400) {
    statusCode = res.statusCode;
  }
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error"
  });
}

module.exports = { notFound, errorHandler };
