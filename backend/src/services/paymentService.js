const crypto = require("crypto");
const { getDB } = require("../config/database");
const { activateSubscription } = require("./subscriptionService");

function getPlanAmount(plan) {
  // Simulation-only pricing. Move to env/config later if needed.
  if (plan === "monthly") return { amount: 499.0, currency: "INR" };
  if (plan === "yearly") return { amount: 4999.0, currency: "INR" };
  return null;
}

async function checkoutSimulation({ userId, plan, paymentMethod, transactionId }) {
  const pricing = getPlanAmount(plan);
  if (!pricing) {
    const err = new Error("Invalid plan");
    err.statusCode = 400;
    throw err;
  }

  const db = getDB();
  const providerPaymentId =
    typeof transactionId === "string" && transactionId.trim()
      ? String(transactionId).trim()
      : `SIM-${crypto.randomBytes(10).toString("hex")}`;

  const normalizedPaymentMethod =
    typeof paymentMethod === "string" && paymentMethod.trim()
      ? String(paymentMethod).trim()
      : "simulation";

  const [existing] = await db.query(
    "SELECT id FROM payment_transactions WHERE provider_payment_id = ? LIMIT 1",
    [providerPaymentId]
  );
  if (existing.length) {
    const err = new Error("Transaction already exists");
    err.statusCode = 409;
    throw err;
  }

  // 1) Write a successful transaction
  await db.query(
    `INSERT INTO payment_transactions (user_id, plan, amount, currency, provider, payment_method, provider_payment_id, status)
     VALUES (?, ?, ?, ?, 'simulation', ?, ?, 'succeeded')`,
    [userId, plan, pricing.amount, pricing.currency, normalizedPaymentMethod, providerPaymentId]
  );

  const [txRows] = await db.query(
    `SELECT id, user_id, plan, amount, currency, provider, payment_method, provider_payment_id, status, created_at AS createdAt
     FROM payment_transactions
     WHERE user_id = ? AND provider_payment_id = ?`,
    [userId, providerPaymentId]
  );

  const transaction = txRows[0];

  // 2) Activate subscription immediately
  const subscription = await activateSubscription({ userId, plan });

  return { transaction, subscription };
}

module.exports = { checkoutSimulation };

