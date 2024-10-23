const express = require("express");
const { deleteRecentView, createOrUpdateRecentView, getRecentViewsByCount } = require("../controllers/recentViewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/recent-view/create", protect, createOrUpdateRecentView);
router.get("/recent-views/get", protect, getRecentViewsByCount);
router.delete("/recent-view/:id", protect, deleteRecentView);

module.exports = router;