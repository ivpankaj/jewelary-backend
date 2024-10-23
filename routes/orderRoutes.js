const express = require('express');
const { createOrder, updateOrder, deleteOrder, getUserOrders } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();


// Order routes
router.post('/orders/create', protect, createOrder);
router.get('/orders/getall',protect, getUserOrders);


module.exports = router;