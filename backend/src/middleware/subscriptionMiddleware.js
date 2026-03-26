const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");

const requireActiveSubscription = asyncHandler(async (req, res, next) => {
  const db = getDB();
  const [rows] = await db.query(
    "SELECT id, user_id, plan, status, start_date, expiry_date FROM subscriptions WHERE user_id = ? LIMIT 1",
    [req.user.id]
  );

  if (!rows.length) {
    return res.status(403).json({ success: false, message: "Subscription not found" });
  }
  const subscription = rows[0];

  const now = new Date();
  const isExpired = new Date(subscription.expiry_date) < now;
  if (isExpired && subscription.status !== "inactive") {
    await db.query("UPDATE subscriptions SET status = 'inactive' WHERE id = ?", [subscription.id]);
    subscription.status = "inactive";
  }

  if (subscription.status !== "active" || new Date(subscription.expiry_date) < now) {
    return res.status(403).json({ success: false, message: "Active subscription required" });
  }

  req.subscription = subscription;
  next();
});

module.exports = { requireActiveSubscription };
