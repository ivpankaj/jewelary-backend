const RecentView = require("../models/recentViewModel");
const jwt = require('jsonwebtoken')

// Create Recent View

exports.createOrUpdateRecentView = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id; // Assuming the token contains user id as 'id'

        const { productId } = req.body;

        // Check if a recent view already exists for this user and product
        let recentView = await RecentView.findOne({ productId, visitedby: userId });

        if (recentView) {
            // If found, increment the count by 1
            recentView.count += 1;
        } else {
            // If not found, create a new recent view
            recentView = new RecentView({
                productId,
                visitedby: userId,
                count: 1,
            });
        }

        // Save the recent view (whether updated or new)
        await recentView.save();

        res.status(200).json({
            success: true,
            data: recentView,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create or update recent view",
            error: error.message,
        });
    }
};
// Get All Recent Views
exports.getRecentViewsByCount = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        console.log('user token in recent view products',token)

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Find recent views for the user and sort by count in descending order
        const recentViews = await RecentView.find({ visitedby: userId })
            .populate('productId')
            .sort({ count: -1 }); // Sort by count in descending order

        res.status(200).json({
            success: true,
            data: recentViews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch recent views",
            error: error.message,
        });
    }
};


// Delete Recent View
exports.deleteRecentView = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRecentView = await RecentView.findByIdAndDelete(id);

        if (!deletedRecentView) {
            return res.status(404).json({
                success: false,
                message: "Recent view not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Recent view deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to delete recent view",
            error: error.message,
        });
    }
};
