const express = require('express');
const { addToCart, removeFromCart, updateCartItem, clearCart, checkout, getCartItems } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


// Routes for cart operations
router.post('/cart/add', protect, addToCart);
router.delete('/cart/remove/:productId', protect, removeFromCart);
router.post('/cart/update', protect, updateCartItem);
router.post('/cart/clear', protect, clearCart);
router.post('/cart/checkout', protect, checkout);
router.post('/cart/get', protect, getCartItems)
module.exports = router;
