const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Cart Schema
const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps whenever the cart is updated
CartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Cart  = mongoose.model('Cart', CartSchema);
module.exports = Cart;