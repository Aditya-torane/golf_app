const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");
const parseJsonColumn = require("../utils/parseJsonColumn");

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

const getDashboardData = asyncHandler(async (req, res) => {
  const db = getDB();
  const [[subscriptionRows], [scores], [charityRows], [drawRows]] = await Promise.all([
    db.query("SELECT id, plan, status, start_date, expiry_date FROM subscriptions WHERE user_id = ? LIMIT 1", [req.user.id]),
    db.query("SELECT id, value, created_at AS createdAt FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", [req.user.id]),
    db.query(
      `SELECT c.id, c.name, c.description, c.donation_percentage AS donationPercentage
       FROM user_charities uc
       INNER JOIN charities c ON uc.charity_id = c.id
       WHERE uc.user_id = ?
       LIMIT 1`,
      [req.user.id]
    ),
    db.query("SELECT id, draw_date, numbers_json FROM draws ORDER BY id DESC LIMIT 1")
  ]);
  const subscription = subscriptionRows[0] || null;
  const selectedCharity = charityRows[0] ? { charity: charityRows[0] } : null;
  const latestDraw = drawRows[0]
    ? { id: drawRows[0].id, drawDate: drawRows[0].draw_date, numbers: parseJsonColumn(drawRows[0].numbers_json, []) }
    : null;

  let myWin = null;
  if (latestDraw) {
    const [winnerRows] = await db.query(
      "SELECT matched_count AS matchedCount, prize, matched_numbers_json FROM draw_winners WHERE draw_id = ? AND user_id = ? LIMIT 1",
      [latestDraw.id, req.user.id]
    );
    if (winnerRows.length) {
      myWin = {
        matchedCount: winnerRows[0].matchedCount,
        prize: winnerRows[0].prize,
        matchedNumbers: parseJsonColumn(winnerRows[0].matched_numbers_json, [])
      };
    }
  }

  res.json({
    success: true,
    dashboard: {
      user: req.user,
      subscription,
      scores,
      selectedCharity,
      latestDraw,
      myWin
    }
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const db = getDB();
  const { email } = req.query;
  const emailFilter = email ? String(email).trim() : "";

  const [users] = await db.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at AS createdAt,
        s.plan,
        s.status,
        s.expiry_date AS expiryDate
      FROM users u
      LEFT JOIN subscriptions s ON s.user_id = u.id
      ${emailFilter ? "WHERE u.email LIKE ? " : ""}
      ORDER BY u.created_at DESC
    `,
    emailFilter ? [`%${emailFilter}%`] : []
  );

  res.json({ success: true, users });
});

module.exports = { getProfile, getDashboardData, getAllUsers };
