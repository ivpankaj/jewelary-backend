const Notification = require('../models/notifcationModel');
const User = require('../models/userModel');


const sendGlobalNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        const newNotification = new Notification({
            title,
            message,
            isGlobal: true,
        });

        await newNotification.save();

        res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create notification' });
    }
};

const sendNotificationToUsers = async (req, res) => {
    try {
        const { userIds, title, message } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'User IDs are required' });
        }

        const newNotification = new Notification({
            title,
            message,
            isGlobal: false,
        });

        await newNotification.save();

        for (const userId of userIds) {
            await User.updateOne(
                { _id: userId },
                {
                    $push: {
                        notifications: {
                            notificationId: newNotification._id,
                            isRead: false,
                        },
                    },
                }
            );
        }

        res.status(201).json({ message: 'Notification sent to specified users', notification: newNotification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send notification', error: error.message });
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate('offerId');
        res.status(200).json({data:notifications});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

const getSingleNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch notification', error: error.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user
        const { notificationId } = req.params;

        const user = await User.findById(userId);
        console.log("User:", user);

        const notification = user.notifications.find(n => n.notificationId.toString() === notificationId);

        if (notification) {
            notification.isRead = true;
            notification.readAt = new Date();
            await user.save();
            res.status(200).json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found for this user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};


module.exports = { sendGlobalNotification, markNotificationAsRead, getAllNotifications, getSingleNotification, sendNotificationToUsers };