// models/UserIPModel.js
const mongoose = require('mongoose');

const userIPSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
    },
    lastVisited: {
        type: Date,
        default: Date.now,
    },
    visitCount: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('UserIP', userIPSchema);