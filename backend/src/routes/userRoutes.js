const express = require("express");
const { getProfile, getDashboardData, getAllUsers } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getProfile);
router.get("/dashboard", protect, getDashboardData);
router.get("/", protect, adminOnly, getAllUsers);

module.exports = router;
