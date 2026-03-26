const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");

const addScore = asyncHandler(async (req, res) => {
  const value = Number(req.body.value);
  if (!Number.isInteger(value) || value < 1 || value > 45) {
    return res.status(400).json({ success: false, message: "Score must be an integer between 1 and 45" });
  }

  const db = getDB();
  const [existingScores] = await db.query(
    "SELECT id FROM scores WHERE user_id = ? ORDER BY created_at ASC",
    [req.user.id]
  );
  if (existingScores.length >= 5) {
    await db.query("DELETE FROM scores WHERE id = ?", [existingScores[0].id]);
  }

  const [insertResult] = await db.query("INSERT INTO scores (user_id, value) VALUES (?, ?)", [req.user.id, value]);
  const [newScoreRows] = await db.query("SELECT id, user_id, value, created_at AS createdAt FROM scores WHERE id = ?", [insertResult.insertId]);
  const [latestScores] = await db.query(
    "SELECT id, user_id, value, created_at AS createdAt FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
    [req.user.id]
  );

  res.status(201).json({
    success: true,
    message: "Score added successfully",
    score: newScoreRows[0],
    scores: latestScores
  });
});

const getMyScores = asyncHandler(async (req, res) => {
  const db = getDB();
  const [scores] = await db.query(
    "SELECT id, user_id, value, created_at AS createdAt FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
    [req.user.id]
  );
  res.json({ success: true, scores });
});

const deleteMyScore = asyncHandler(async (req, res) => {
  const db = getDB();
  const [result] = await db.query("DELETE FROM scores WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ success: false, message: "Score not found" });
  }
  res.json({ success: true, message: "Score deleted" });
});

const adminGetAllScores = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.query;
  const emailFilter = email ? String(email).trim() : "";

  const [scores] = await db.query(
    `
      SELECT
        s.id,
        s.value,
        s.created_at AS createdAt,
        u.id AS userId,
        u.name,
        u.email
      FROM scores s
      INNER JOIN users u ON s.user_id = u.id
      ${emailFilter ? "WHERE u.email LIKE ? " : ""}
      ORDER BY s.created_at DESC
    `,
    emailFilter ? [`%${emailFilter}%`] : []
  );
  const shaped = scores.map((s) => ({
    id: s.id,
    value: s.value,
    createdAt: s.createdAt,
    user: { id: s.userId, name: s.name, email: s.email }
  }));
  res.json({ success: true, scores: shaped });
});

const adminUpdateScore = asyncHandler(async (req, res) => {
  const value = Number(req.body.value);
  if (!Number.isInteger(value) || value < 1 || value > 45) {
    return res.status(400).json({ success: false, message: "Score must be an integer between 1 and 45" });
  }

  const db = getDB();
  const [result] = await db.query("UPDATE scores SET value = ? WHERE id = ?", [value, req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ success: false, message: "Score not found" });
  }
  const [rows] = await db.query("SELECT id, user_id, value, created_at AS createdAt FROM scores WHERE id = ?", [req.params.id]);
  const updated = rows[0];

  res.json({ success: true, message: "Score updated", score: updated });
});

module.exports = { addScore, getMyScores, deleteMyScore, adminGetAllScores, adminUpdateScore };
