const express = require('express');
const router = express.Router();
const multer = require("multer")
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require("path")
const { protect, publicApiAccess, isAdmin } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary.js');
const { createBanner, getBanners, getBannerById, updateBanner, deleteBanner } = require('../controllers/bannnerController.js');
const fileUpload = require('express-fileupload');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners',
        public_id: (req, file) => {
            const fileNameWithoutExt = path.parse(file.originalname).name;
            return Date.now() + '-' + fileNameWithoutExt;
        },
        resource_type: 'image',
    },
});

const upload = multer({ storage: storage }).single('banner');


router.post('/admin/createBanner', protect, isAdmin, fileUpload(), createBanner)
router.get('/allbanners', publicApiAccess, getBanners)
router.get('/admin/banner/:id', protect, isAdmin, getBannerById)
router.put('/admin/update/:id', protect, isAdmin, fileUpload(), updateBanner)
router.delete('/admin/banner/delete/:id', protect, isAdmin, deleteBanner)

module.exports = router;