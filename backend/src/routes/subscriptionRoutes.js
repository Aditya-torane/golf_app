const express = require("express");
const {
  createOrUpdateSubscription,
  getMySubscription,
  adminActivateSubscription,
  adminDeactivateSubscription
} = require("../controllers/subscriptionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrUpdateSubscription);
router.get("/me", protect, getMySubscription);

// Admin endpoints: allow activating/deactivating subscription for any user.
router.post("/admin/:userId", protect, adminOnly, adminActivateSubscription);
router.post("/admin/:userId/deactivate", protect, adminOnly, adminDeactivateSubscription);

module.exports = router;
