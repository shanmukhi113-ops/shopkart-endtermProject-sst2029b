const mongoose = require("mongoose");
const crypto = require("crypto");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

function validateShippingAddress(shippingAddress) {
  if (!shippingAddress) {
    return "Shipping address is required";
  }

  const {
    fullName,
    phone,
    addressLine1,
    city,
    state,
    pincode
  } = shippingAddress;

  if (
    !fullName?.trim() ||
    !phone?.trim() ||
    !addressLine1?.trim() ||
    !city?.trim() ||
    !state?.trim() ||
    !pincode?.trim()
  ) {
    return "All shipping address fields are required";
  }

  if (!/^[6-9]\d{9}$/.test(phone.trim())) {
    return "Phone number must contain 10 valid digits";
  }

  if (!/^\d{6}$/.test(pincode.trim())) {
    return "Pincode must contain 6 digits";
  }

  return null;
}

async function createPaymentOrder(req, res) {
  let shopKartOrder = null;

  try {
    const { shippingAddress } = req.body;

    const shippingError = validateShippingAddress(shippingAddress);

    if (shippingError) {
      return res.status(400).json({
        success: false,
        message: shippingError
      });
    }

    const customer = await Customer.findById(req.user.id).populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty"
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists"
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} units are available.`
        });
      }

      totalAmount += product.price * cartItem.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    shopKartOrder = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString()
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    if (shopKartOrder) {
      try {
        await Order.findByIdAndDelete(shopKartOrder._id);
      } catch (cleanupError) {
        console.error("Order cleanup failed:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order"
    });
  }
}

async function verifyPayment(req, res) {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !shopKartOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ShopKart order ID"
      });
    }

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match"
      });
    }

    const body =
      order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const signaturesMatch =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signaturesMatch) {
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    const customer = await Customer.findById(req.user.id);

    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.json({
      success: true,
      message: "Payment verified and order placed",
      order
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment"
    });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await Order.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById
};