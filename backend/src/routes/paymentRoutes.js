const express = require("express");
const { checkout, getReceipt, adminGetPayments } = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, checkout);
// Backwards compatibility with earlier UI
router.post("/checkout", protect, checkout);
router.get("/receipt/:transactionId", protect, getReceipt);
router.get("/admin", protect, adminOnly, adminGetPayments);

module.exports = router;

