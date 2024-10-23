const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { addToWishlist, removeFromWishlist, getWishlist } = require("../controllers/wishListController");

const router = express.Router();

router.post("/wishlist/create",protect, addToWishlist);
router.get("/wishlist/get",protect, getWishlist);
router.delete("/wishlist/delete/:productId",protect,removeFromWishlist);

module.exports = router;
