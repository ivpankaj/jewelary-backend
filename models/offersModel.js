const mongoose = require("mongoose");

var offerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        offer: {
            type: Number,
            required: true
        },
        discountType: {
            type: String,
            enum: ['Coupon', 'Offers'],
            required: true,
        },
        prodCategory: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Offers", offerSchema);