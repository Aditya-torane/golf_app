const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getMyAnalytics, getAdminAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/me", protect, getMyAnalytics);
router.get("/admin", protect, adminOnly, getAdminAnalytics);

module.exports = router;

