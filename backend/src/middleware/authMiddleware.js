const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: token missing" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const db = getDB();
  const [rows] = await db.query(
    "SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ?",
    [decoded.id]
  );
  if (!rows.length) {
    return res.status(401).json({ success: false, message: "Unauthorized: user not found" });
  }

  req.user = rows[0];
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

module.exports = { protect, adminOnly };
