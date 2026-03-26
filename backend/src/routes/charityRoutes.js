const express = require("express");
const {
  getCharities,
  createCharity,
  updateCharity,
  deleteCharity,
  selectCharity,
  getMyCharity
} = require("../controllers/charityController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCharities);
router.post("/select", protect, selectCharity);
router.get("/me/selection", protect, getMyCharity);

router.post("/", protect, adminOnly, createCharity);
router.put("/:id", protect, adminOnly, updateCharity);
router.delete("/:id", protect, adminOnly, deleteCharity);

module.exports = router;
