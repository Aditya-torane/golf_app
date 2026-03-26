const asyncHandler = require("../utils/asyncHandler");
const { checkoutSimulation } = require("../services/paymentService");
const { getDB } = require("../config/database");

async function checkout(req, res) {
  const { plan, paymentMethod, transactionId } = req.body;

  if (!["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ success: false, message: "Plan must be monthly or yearly" });
  }

  const allowedMethods = ["UPI", "Card", "NetBanking"];
  let normalizedMethod = null;
  if (paymentMethod != null) {
    const m = String(paymentMethod).trim();
    if (!allowedMethods.includes(m)) {
      return res.status(400).json({ success: false, message: "Invalid paymentMethod" });
    }
    normalizedMethod = m;
  }

  if (transactionId != null && typeof transactionId !== "string") {
    return res.status(400).json({ success: false, message: "transactionId must be a string" });
  }

  const { transaction, subscription } = await checkoutSimulation({
    userId: req.user.id,
    plan,
    paymentMethod: normalizedMethod || paymentMethod,
    transactionId
  });

  res.json({
    success: true,
    message: "Payment successful (simulation)",
    transactionId: transaction?.provider_payment_id,
    transaction,
    subscription
  });
}

const adminGetPayments = asyncHandler(async (req, res) => {
  const { email, status, plan } = req.query;
  const emailFilter = email ? String(email).trim() : "";
  const statusFilter = status ? String(status).trim() : "";
  const planFilter = plan ? String(plan).trim() : "";

  const where = [];
  const values = [];

  if (emailFilter) {
    where.push("u.email LIKE ?");
    values.push(`%${emailFilter}%`);
  }

  if (statusFilter) {
    if (!["succeeded", "failed", "pending"].includes(statusFilter)) {
      return res.status(400).json({ success: false, message: "Invalid status filter" });
    }
    where.push("pt.status = ?");
    values.push(statusFilter);
  }

  if (planFilter && ["monthly", "yearly"].includes(planFilter)) {
    where.push("pt.plan = ?");
    values.push(planFilter);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const db = getDB();
  const [rows] = await db.query(
    `
      SELECT
        pt.provider_payment_id AS transactionId,
        u.name,
        u.email,
        pt.plan,
        pt.amount,
        pt.currency,
        pt.payment_method AS paymentMethod,
        pt.status,
        pt.created_at AS createdAt
      FROM payment_transactions pt
      INNER JOIN users u ON pt.user_id = u.id
      ${whereSql}
      ORDER BY pt.created_at DESC
    `,
    values
  );

  res.json({ success: true, payments: rows });
});

async function getReceipt(req, res) {
  const transactionId = req.params.transactionId;
  if (!transactionId) {
    return res.status(400).json({ success: false, message: "transactionId is required" });
  }

  const db = getDB();
  const [rows] = await db.query(
    `SELECT
       u.name,
       u.email,
       pt.plan,
       pt.amount,
       pt.currency,
       pt.payment_method AS paymentMethod,
       pt.provider_payment_id AS transactionId,
       pt.status,
       pt.created_at AS createdAt
     FROM payment_transactions pt
     INNER JOIN users u ON pt.user_id = u.id
     WHERE pt.user_id = ? AND pt.provider_payment_id = ?
     LIMIT 1`,
    [req.user.id, transactionId]
  );

  if (!rows.length) {
    return res.status(404).json({ success: false, message: "Receipt not found" });
  }

  res.json({
    success: true,
    receipt: rows[0],
    note: "This is a simulated payment"
  });
}

module.exports = {
  checkout: asyncHandler(checkout),
  getReceipt: asyncHandler(getReceipt),
  adminGetPayments
};

