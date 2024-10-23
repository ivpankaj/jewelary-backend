const Order = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const addressModel = require("../models/addressModel");

// exports.createOrder = async (req, res) => {
//   try {
//     // Step 1: Retrieve user from the request (assuming user info is attached via middleware like JWT)
//     const user = req.body.userId;

//     // Step 2: Get the cart items for the user
//     const cart = await cartModel.findOne({ userId: req.body.userId });
//     console.log(cart);

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }
//     // Step 3: Get the discounted price and discount type from the request body
//     const { discountedprice, discount_type } = req.body;
//     if (!discountedprice || !discount_type) {
//       return res
//         .status(400)
//         .json({ message: "Discounted price and type are required" });
//     }
//     console.log({
//       userId: req.body.userId,
//       items: cart.items,
//       totalAmount: cart.totalPrice,
//       discountedprice,
//       discount_type,
//       createdAt: new Date(),
//     });

//     // Step 4: Create a new order with cart items and discounted info
//     const order = new Order({
//       userId: req.body.userId,
//       items: cart.items,
//       totalAmount: cart.totalPrice,
//       discountedprice,
//       discount_type,
//       createdAt: new Date(),
//     });

//     // Step 5: Save the order
//     await order.save();
//     // Step 6: Optionally, clear the cart after order creation
//     await cartModel.findOneAndUpdate({ user: user._id }, { items: [] });
//     // Step 7: Send response
//     return res
//       .status(201)
//       .json({ message: "Order created successfully", order });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


// exports.createOrder = async (req, res) => {
//   try {
//     // Step 1: Retrieve user and order details from the request
//     const { userId, discountedprice, discount_type, tax_estimate, shipping_estimate , address} = req.body;

//     // Step 2: Validate required fields
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     if (!discountedprice || typeof discountedprice !== 'number' || discountedprice <= 0) {
//       return res.status(400).json({ message: "Valid discounted price is required" });
//     }

//     const validDiscountTypes = ["offer", "coupon"];
//     if (!validDiscountTypes.includes(discount_type)) {
//       return res.status(400).json({ message: "Invalid discount type" });
//     }

//     // if (!discount || typeof discount !== 'number' || discount < 0) {
//     //   return res.status(400).json({ message: "Valid discount is required" });
//     // }

//     if (!tax_estimate || typeof tax_estimate !== 'number' || tax_estimate < 0) {
//       return res.status(400).json({ message: "Valid tax estimate is required" });
//     }

//     if (!shipping_estimate || typeof shipping_estimate !== 'number' || shipping_estimate < 0) {
//       return res.status(400).json({ message: "Valid shipping estimate is required" });
//     }

//     // Step 3: Get the cart items for the user
//     const cart = await cartModel.findOne({ userId });
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty or not found" });
//     }

//     // Step 4: Create the order object
//     const orderData = {
//       userId,
//       items: cart.items,
//       totalAmount: cart.totalPrice,
//       discountedprice,
//       discount_type,
//       tax_estimate,
//       shipping_estimate,
//       address,
//       createdAt: new Date(),
//     };

//     // Step 5: Create and save the new order
//     const order = new Order(orderData);
//     await order.save();

//     // Step 6: Clear the cart after order creation
//     await cartModel.findOneAndUpdate({ userId }, { items: [] });

//     // Step 7: Send success response
//     return res.status(201).json({ message: "Order created successfully", order ,status: 200 });
//   } catch (error) {
//     console.error("Error creating order:", error.message);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
exports.createOrder = async (req, res) => {
  try {
    // Step 1: Retrieve user and order details from the request
    const { userId, discountedprice, discount_type, tax_estimate, shipping_estimate, address: addressId,items } = req.body;

    // Step 2: Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }


    const validDiscountTypes = ["offer", "coupon"];
    if (!validDiscountTypes.includes(discount_type)) {
      return res.status(400).json({ message: "Invalid discount type" });
    }

    if (!tax_estimate || typeof tax_estimate !== 'number' || tax_estimate < 0) {
      return res.status(400).json({ message: "Valid tax estimate is required" });
    }

    if (!shipping_estimate || typeof shipping_estimate !== 'number' || shipping_estimate < 0) {
      return res.status(400).json({ message: "Valid shipping estimate is required" });
    }

    // Step 3: Get the cart items for the user
    const cart = await cartModel.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    // Step 4: Fetch the complete address using the address ID
    const address = await addressModel.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: "Address not found" });
    }

    // Step 5: Create the order object, including the complete address
    const orderData = {
      userId,
      items: items,
      totalAmount: cart.totalPrice,
      discountedprice,
      discount_type,
      tax_estimate,
      shipping_estimate,
      address,  // Store the complete address object
      createdAt: new Date(),
    };

    // Step 6: Create and save the new order
    const order = new Order(orderData);
    await order.save();

    // Step 7: Clear the cart after order creation
    await cartModel.findOneAndUpdate({ userId }, { items: [] });

    // Step 8: Send success response
    return res.status(201).json({ message: "Order created successfully", order, status: 200 });
  } catch (error) {
    console.error("Error creating order:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    // Step 1: Retrieve user from the request (assuming user info is attached via middleware like JWT)
    const userId = req.body.userId;
    console.log("Logged-in User ID:", userId);
    // Step 2: Find all orders associated with the logged-in user
    const orders = await Order.find({ userId })
    // Step 3: Check if the user has any order
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    // Step 4: Send response with all orders
    return res
      .status(200)
      .json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



// exports.getUserOrders = async (req, res) => {
//   try {
//     // Step 1: Retrieve user and date from the request
//     const userId = req.body.userId;
//     const selectedDate = req.body.date; // Assuming date is passed in the request body
//     console.log("Logged-in User ID:", userId);
//     console.log("Selected Date:", selectedDate);

//     // Step 2: Build the filter criteria
//     const filter = { userId };
//     if (selectedDate) {
//       // Filter orders based on the selected date
//       const startDate = new Date(selectedDate);
//       const endDate = new Date(selectedDate);
//       endDate.setDate(endDate.getDate() + 1); // Include the entire day

//       filter.createdAt = {
//         $gte: startDate,
//         $lt: endDate
//       };
//     }

//     // Step 3: Find all orders matching the filter criteria
//     const orders = await Order.find(filter);

//     // Step 4: Check if the user has any orders
//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     // Step 5: Send response with all orders
//     return res
//       .status(200)
//       .json({ message: "Orders retrieved successfully", orders });
//   } catch (error) {
//     console.error("Error fetching user orders:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
// Update an order by ID
exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
    });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res
      .status(200)
      .json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error updating order", error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
};
