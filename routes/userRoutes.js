const express = require('express');
const multer = require("multer")
const path = require('path')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { createUser, loginUserCtrl, updatedUser, deleteaUser, getallUser, getaUser, restoreUser, blockUser, unblockUser, addAddress, getAllAddresses, updateAddress, deleteAddress, updatePassword } = require('../controllers/userController');
const { protect, getIpAddress, publicApiAccess, isAdmin } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary.js');


const router = express.Router();


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

const upload = multer({ storage: storage }).single('image');


// Admin
router.post('/admin/login', loginUserCtrl);
router.get('/admin/getuser', protect, isAdmin, getaUser)
router.put('/admin/updatepassword', protect, isAdmin, updatePassword)
router.put('/admin/update', protect, isAdmin, upload, updatedUser);


// Public
router.post('/register', publicApiAccess, createUser);
router.post('/login', publicApiAccess, loginUserCtrl);
router.get('/getalluser', publicApiAccess, getallUser)
router.get('/getuser', protect, getaUser)
router.put('/update', publicApiAccess, protect, upload, updatedUser);
router.put('/restore/:id', protect, restoreUser);
router.delete('/delete/:id', protect, deleteaUser);
router.put('/block/:id', protect, blockUser)
router.put('/unblock/:id', protect, unblockUser)
router.put('/updatepassword', protect, publicApiAccess, updatePassword)

//user address routes
router.post('/add/address', protect, addAddress);
router.get('/get/address', protect, getAllAddresses);
router.put('/address/update', protect, updateAddress);
router.delete('/address/delete', protect, deleteAddress);

module.exports = router;