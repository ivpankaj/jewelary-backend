const express = require('express');
const { protect, publicApiAccess, isAdmin } = require('../middleware/authMiddleware');
const { sendGlobalNotification, markNotificationAsRead, sendNotificationToUsers, getAllNotifications, getSingleNotification } = require('../controllers/notificationController');

const router = express.Router();


// Admin
router.post('/admin/send/notification', protect, isAdmin, sendGlobalNotification)
router.post('/admin/send/notification/users', protect, isAdmin, sendNotificationToUsers)

// Public
router.get('/getallnotification', publicApiAccess, getAllNotifications)
router.get('/getsinglenotification/:id', publicApiAccess, getSingleNotification)
router.put('/notification/markread/:notificationId', protect, publicApiAccess, markNotificationAsRead)

module.exports = router;