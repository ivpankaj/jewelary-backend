
const mongoose = require("mongoose");

const RecentViewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true,
        },
        count: {
            type: Number,
            default: 0,
        },
        visitedby: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const RecentView = mongoose.model("RecentView", RecentViewSchema);
module.exports = RecentView;
