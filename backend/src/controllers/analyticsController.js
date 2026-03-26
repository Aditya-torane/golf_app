const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");

const getMyAnalytics = asyncHandler(async (req, res) => {
  const db = getDB();

  const [[subscriptionRows], [paymentsAgg]] = await Promise.all([
    db.query(
      "SELECT id, plan, status, start_date, expiry_date FROM subscriptions WHERE user_id = ? LIMIT 1",
      [req.user.id]
    ),
    db.query(
      `SELECT
         COUNT(*) AS paymentCount,
         COALESCE(SUM(amount), 0) AS revenue
       FROM payment_transactions
       WHERE user_id = ? AND status = 'succeeded'`,
      [req.user.id]
    )
  ]);

  const subscription = subscriptionRows[0] || null;
  res.json({
    success: true,
    analytics: {
      subscription,
      paymentCount: paymentsAgg.paymentCount,
      revenue: paymentsAgg.revenue
    }
  });
});

const getAdminAnalytics = asyncHandler(async (req, res) => {
  const db = getDB();

  const [[usersAgg], [activeSubsAgg], [revenueAgg]] = await Promise.all([
    db.query("SELECT COUNT(*) AS totalUsers FROM users"),
    db.query(
      `SELECT COUNT(*) AS activeSubscriptions
       FROM subscriptions
       WHERE status = 'active' AND expiry_date > NOW()`
    ),
    db.query(
      `SELECT
         COALESCE(SUM(amount), 0) AS revenue,
         COUNT(*) AS succeededPayments
       FROM payment_transactions
       WHERE status = 'succeeded'`
    )
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers: usersAgg.totalUsers,
      activeSubscriptions: activeSubsAgg.activeSubscriptions,
      revenue: revenueAgg.revenue,
      succeededPayments: revenueAgg.succeededPayments
    }
  });
});

module.exports = { getMyAnalytics, getAdminAnalytics };

