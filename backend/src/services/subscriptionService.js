const { getDB } = require("../config/database");

function buildExpiryDate(plan, startDate) {
  const expiry = new Date(startDate);
  if (plan === "monthly") {
    expiry.setMonth(expiry.getMonth() + 1);
  } else {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  return expiry;
}

/**
 * Activates/updates the subscription for a user.
 * Reused by both the direct subscription endpoint and the payment checkout flow.
 */
async function activateSubscription({ userId, plan }) {
  const db = getDB();

  const startDate = new Date();
  const expiryDate = buildExpiryDate(plan, startDate);

  await db.query(
    `INSERT INTO subscriptions (user_id, plan, status, start_date, expiry_date)
     VALUES (?, ?, 'active', ?, ?)
     ON DUPLICATE KEY UPDATE
       plan = VALUES(plan),
       status = 'active',
       start_date = VALUES(start_date),
       expiry_date = VALUES(expiry_date)`,
    [userId, plan, startDate, expiryDate]
  );

  const [rows] = await db.query(
    "SELECT id, user_id, plan, status, start_date, expiry_date FROM subscriptions WHERE user_id = ? LIMIT 1",
    [userId]
  );

  return rows[0];
}

module.exports = { activateSubscription };

