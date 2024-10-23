const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        star: {
            type: Number,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
        },
        postedby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    },
    { timestamps: true }
);

const Rating  = mongoose.model("Rating", ratingSchema);

module.exports = Rating;