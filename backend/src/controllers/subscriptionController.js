const asyncHandler = require("../utils/asyncHandler");
const { activateSubscription } = require("../services/subscriptionService");
const { getDB } = require("../config/database");

const createOrUpdateSubscription = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ success: false, message: "Plan must be monthly or yearly" });
  }
  const subscription = await activateSubscription({ userId: req.user.id, plan });

  res.json({ success: true, message: "Subscription activated", subscription });
});

const adminActivateSubscription = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const userId = Number(req.params.userId);
  if (!["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ success: false, message: "Plan must be monthly or yearly" });
  }
  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid userId" });
  }

  const subscription = await activateSubscription({ userId, plan });
  res.json({ success: true, message: "Subscription activated", subscription });
});

const adminDeactivateSubscription = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid userId" });
  }

  const db = getDB();

  // If subscription row exists, just mark inactive.
  await db.query(
    `UPDATE subscriptions
     SET status = 'inactive'
     WHERE user_id = ?`,
    [userId]
  );

  // If it didn't exist, insert a minimal inactive record (so admin can still see it).
  await db.query(
    `INSERT INTO subscriptions (user_id, plan, status, start_date, expiry_date)
     VALUES (?, 'monthly', 'inactive', NOW(), NOW())
     ON DUPLICATE KEY UPDATE status = 'inactive'`,
    [userId]
  );

  const [rows] = await db.query(
    "SELECT id, user_id, plan, status, start_date, expiry_date FROM subscriptions WHERE user_id = ? LIMIT 1",
    [userId]
  );

  res.json({ success: true, message: "Subscription deactivated", subscription: rows[0] });
});

const getMySubscription = asyncHandler(async (req, res) => {
  const db = getDB();
  const [rows] = await db.query(
    "SELECT id, user_id, plan, status, start_date, expiry_date FROM subscriptions WHERE user_id = ? LIMIT 1",
    [req.user.id]
  );
  if (!rows.length) {
    return res.status(404).json({ success: false, message: "No subscription found" });
  }
  const subscription = rows[0];

  const now = new Date();
  if (new Date(subscription.expiry_date) < now && subscription.status !== "inactive") {
    await db.query("UPDATE subscriptions SET status = 'inactive' WHERE id = ?", [subscription.id]);
    subscription.status = "inactive";
  }

  res.json({ success: true, subscription });
});

module.exports = { createOrUpdateSubscription, getMySubscription, adminActivateSubscription, adminDeactivateSubscription };
