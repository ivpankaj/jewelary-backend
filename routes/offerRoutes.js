const express = require('express');
const { createOffer, getAllOffers, getOfferById, deleteOffer, updateOffer, applyOfferToProduct, getProductsWithOffers } = require('../controllers/offerController');
const { protect, publicApiAccess, isAdmin } = require('../middleware/authMiddleware')

const router = express.Router();


// Admin
router.post('/admin/offers', protect, isAdmin, createOffer);
router.put('/admin/update/offers/:id', protect, isAdmin, updateOffer);
router.delete('/admin/delete/offers/:id', protect, isAdmin, deleteOffer);
router.post('/admin/offers/apply', protect, isAdmin, applyOfferToProduct)
router.get('/admin/offers/get', protect, isAdmin, getProductsWithOffers);


// Public
router.get('/get/offers', publicApiAccess, getAllOffers);
router.get('/offers/:id', publicApiAccess, getOfferById);

module.exports = router;