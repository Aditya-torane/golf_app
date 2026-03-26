const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");

function extractBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.split(" ")[1] : null;
}

/**
 * Protects browser pages by redirecting to login/admin as needed.
 * Unlike `protect` it does not return JSON errors (because these routes render HTML).
 */
const requireUserPage = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) return res.redirect("/login.html");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.redirect("/login.html");
  }

  const db = getDB();
  const [rows] = await db.query(
    "SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1",
    [decoded.id]
  );

  if (!rows.length) return res.redirect("/login.html");

  req.user = rows[0];
  if (req.user.role === "admin") return res.redirect("/admin.html");
  next();
});

const requireAdminPage = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) return res.redirect("/login.html");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.redirect("/login.html");
  }

  const db = getDB();
  const [rows] = await db.query(
    "SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1",
    [decoded.id]
  );

  if (!rows.length) return res.redirect("/login.html");

  req.user = rows[0];
  if (req.user.role !== "admin") return res.redirect("/dashboard.html");
  next();
});

module.exports = { requireUserPage, requireAdminPage };

