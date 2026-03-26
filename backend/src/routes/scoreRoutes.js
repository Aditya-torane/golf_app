const express = require("express");
const {
  addScore,
  getMyScores,
  deleteMyScore,
  adminGetAllScores,
  adminUpdateScore
} = require("../controllers/scoreController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { requireActiveSubscription } = require("../middleware/subscriptionMiddleware");

const router = express.Router();

router.post("/", protect, requireActiveSubscription, addScore);
router.get("/me", protect, getMyScores);
router.delete("/:id", protect, deleteMyScore);

router.get("/", protect, adminOnly, adminGetAllScores);
router.put("/:id", protect, adminOnly, adminUpdateScore);

module.exports = router;
