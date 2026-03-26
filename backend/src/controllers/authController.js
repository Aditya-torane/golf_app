const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const db = getDB();
  const [exists] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (exists.length) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const safeRole = role === "admin" ? "admin" : "user";
  const [result] = await db.query(
    "INSERT INTO users (`name`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, safeRole]
  );

  const user = { id: result.insertId, name, email, role: safeRole };
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: "Signup successful",
    token,
    user
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  const db = getDB();
  const [rows] = await db.query(
    "SELECT id, `name`, `email`, `password`, `role` FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if (!rows.length) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  const user = rows[0];

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: "Login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});
module.exports = { signup, login };
