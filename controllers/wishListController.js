const productModel = require("../models/productModel");
const userModel = require("../models/userModel");

// Add product to wishlist
const addToWishlist = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;
  console.log("pankaj",productId)
  try {
    const user = await userModel.findOne(userId);
    const product = await productModel.findById(productId);
    console.log(user);
    if (!user || !product) {
      return res.status(404).json({ message: "User or product not found" });
    }
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({ message: "Product added to wishlist" });
    } else {
      return res.status(200).json({ message: "Product already in wishlist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    const { userId } = req.user;
  const {  productId } = req.params;
  
  console.log(productId);
  try {
    const user = await userModel.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== productId
    );
    await user.save();
    return res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get wishlist items
const getWishlist = async (req, res) => {
    const { userId } = req.user;
  try {
    const user = await userModel.findOne(userId).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.wishlist);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};