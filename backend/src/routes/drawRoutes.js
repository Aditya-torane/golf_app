const express = require("express");
const { runMonthlyDraw, getLatestDraw, getLatestDrawForMe, getMyDrawResults } = require("../controllers/drawController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/run", protect, adminOnly, runMonthlyDraw);
router.get("/latest", protect, getLatestDraw);
router.get("/latest/me", protect, getLatestDrawForMe);
router.get("/me/results", protect, getMyDrawResults);

module.exports = router;
