const mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    profilepic: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    notifications: [
      {
        notificationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Notification",
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        readAt: {
          type: Date,
        },
      },
    ],
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    token: {
      type: String,
    },
    ipAddresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserIP",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
