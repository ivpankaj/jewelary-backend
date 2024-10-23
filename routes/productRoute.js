const express = require('express');
const router = express.Router();
const multer = require("multer")
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require("path")
const { createProduct, getProductById, deleteProduct, updateProduct, getAllProducts, getProductsByCategory, deleteProductPicture, getMostSellingProducts, trackProductView, getPopularProducts, checkStock, calcuLatePandL, createProductTest, deleteProductAws } = require('../controllers/productController');
const { protect, getIpAddress, publicApiAccess, isAdmin } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary.js');
const { giveRating, getTopRatedProducts } = require('../controllers/ratingController.js');
const { getCounts, getallsearch } = require('../controllers/allDataController.js');
const fileUpload = require('express-fileupload');


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products',
        public_id: (req, file) => {
            const fileNameWithoutExt = path.parse(file.originalname).name;
            return Date.now() + '-' + fileNameWithoutExt;
        },
        resource_type: 'image',
    },
});

const upload = multer({ storage: storage }).array('pictures', 10);



// Admin
router.post('/admin/create', protect, isAdmin, fileUpload(), createProduct);
// router.post('/test', fileUpload(), createProductTest)
// router.delete('/test', deleteProductAws)
router.delete('/admin/delete/:id', protect, isAdmin, deleteProduct);
router.delete('/admin/delete/:productId/image/:pictureIndex', protect, isAdmin, deleteProductPicture);
router.put('/admin/product/update/:id', protect, isAdmin, fileUpload(), updateProduct);
// All Data Counts
router.get('/admin/getdata', protect, isAdmin, getCounts)
router.get('/getallsearch', getallsearch);
// Stocks
router.get('/admin/check-stock', protect, isAdmin, checkStock);
router.get('/admin/profit&loss', protect, isAdmin, calcuLatePandL);



// Public
router.get('/product/getall', publicApiAccess, getAllProducts);
router.get('/product/get/:id', publicApiAccess, getIpAddress, getProductById);
router.get('/product/get/mostsellingproduct', publicApiAccess, getIpAddress, getMostSellingProducts);
router.get('/product/category/:category', publicApiAccess, getProductsByCategory);
router.get("/most-selling", getMostSellingProducts);

// With Login
router.post('/product/rate', protect, publicApiAccess, giveRating);
router.get('/product/rate/:id', publicApiAccess, getProductById);
router.get("/product/toprated", publicApiAccess, getTopRatedProducts);
router.get('/product/popular/:productId', publicApiAccess, trackProductView);
router.get('/product/getpopularproduct', publicApiAccess, getPopularProducts);

module.exports = router;