const mongoose = require('mongoose');

const PopularProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  popularityScore: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const PopularProduct = mongoose.model("PopularProduct", PopularProductSchema);
module.exports = PopularProduct;