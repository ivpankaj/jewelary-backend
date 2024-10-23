const jwt = require("jsonwebtoken");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const wishlistIndex = user.wishlist.indexOf(productId);

    if (wishlistIndex >= 0) {
      user.wishlist.splice(wishlistIndex, 1);
      await user.save();
    }

    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      cart = new cartModel({ userId, items: [], totalItems: 0, totalPrice: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.price,
      });
    }
    cart.totalItems = cart.items.length;
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({ data: cart, length: cart.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userId } = req.body; // User ID from the request body
    const { productId } = req.params; // Product ID from the request parameters

    console.log('User ID:', userId);
    console.log('Removing product ID:', productId);

    // Find the cart by userId
    const userCart = await cartModel.findOne({ userId });

    // Check if the cart exists
    if (!userCart) {
      return res.status(404).json({ message: "User not found or cart is empty" });
    }

    // Log the current items for debugging
    console.log('Current items in cart:', userCart.items);

    // Find the index of the item to remove
    const itemIndex = userCart.items.findIndex(item => item.productId == productId);
    console.log('item index', itemIndex)
    // If the item is found, remove it
    if (itemIndex !== -1) {
      userCart.items.splice(itemIndex, 1);
      console.log('Item removed, updated items:', userCart.items);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // If there are no items left in the cart, delete the cart
    if (userCart.items.length == 0) {
      await cartModel.deleteOne({ userId });
      return res.status(200).json({ message: "Cart is empty and has been deleted", status: 200 });
    }

    // Update totalItems and totalPrice
    userCart.totalItems = userCart.items.length; // Update totalItems
    userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0); // Recalculate totalPrice

    console.log('last user cart data is here ', userCart)
    // Save the updated cart object
    await userCart.save();

    // Respond with a success message
    return res.status(200).json({ message: "Product removed from cart", status: 200 });
  } catch (err) {
    // Log the error for debugging
    console.error('Error removing product from cart:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;

    let cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Delete all items in the cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.body.userId;

    let cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Checkout and empty the cart
exports.checkout = async (req, res) => {
  try {
    const userId = req.body.userId;

    let cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();
    res.status(200).json({ message: "Checkout successful and cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Get all items in the cart for the logged-in user

// exports.getCartItems = async (req, res) => {
//     try {

//       const userId = req.body.userId;

//       const cart = await cartModel.findOne({ userId });

//       if (!cart || cart.items.length === 0) {
//         return res.status(404).json({ message: "No items found in the cart" });
//       }

//       res.status(200).json({
//         success: true,
//         items: cart.items,
//         totalItems: cart.totalItems,
//         totalPrice: cart.totalPrice,
//       });
//     } catch (err) {
//       res.status(500).json({ message: "Server error", error: err.message });
//     }
//   };

exports.getCartItems = async (req, res) => {
  try {
    const userId = req.body.userId;

    const cart = await cartModel
      .findOne({ userId })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: "No items found in the cart", data:0 });
    }

    // Calculate subtotal, shipping, tax, and total
    const shippingEstimate = 5.0; // Fixed shipping cost
    const taxRate = 0.18; // 18% tax rate
    let subtotal = 0;

    cart.items.forEach((item) => {
      subtotal += item.price * item.quantity; // Calculate subtotal
    });

    const taxEstimate = subtotal * taxRate; // Calculate tax
    const orderTotal = subtotal + shippingEstimate + taxEstimate; // Calculate total

    res.status(200).json({
      success: true,
      items: cart.items.length > 0 ? cart.items : [],
      subtotal: subtotal.toFixed(2), // Format to 2 decimal places
      shippingEstimate: shippingEstimate.toFixed(2),
      taxEstimate: taxEstimate.toFixed(2),
      orderTotal: orderTotal.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// exports.getCartItems = async (req, res) => {
//   try {
//     const userId = req.body.userId;

//     const cart = await cartModel.findOne({ userId }).populate('items.productId');

//     if (!cart || cart.items.length === 0) {
//       return res.status(404).json({ message: "No items found in the cart" });
//     }

//     // Calculate subtotal, shipping, tax, and total
//     const shippingEstimate = 5.00; // Fixed shipping cost
//     const taxRate = 0.18; // 18% tax rate
//     let subtotal = 0;

//     cart.items.forEach(item => {
//       subtotal += item.price * item.quantity; // Calculate subtotal
//     });

//     const taxEstimate = subtotal * taxRate; // Calculate tax
//     const orderTotal = subtotal + shippingEstimate + taxEstimate; // Calculate total

//     res.status(200).json({
//       success: true,
//       items: cart.items,
//       subtotal: subtotal.toFixed(2), // Format to 2 decimal places
//       shippingEstimate: shippingEstimate.toFixed(2),
//       taxEstimate: taxEstimate.toFixed(2),
//       orderTotal: orderTotal.toFixed(2),
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
