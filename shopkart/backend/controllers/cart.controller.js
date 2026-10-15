const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

async function addToCart(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock"
      });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units are available`
        });
      }

      existingItem.quantity += 1;
    } else {
      customer.cart.push({
        product: product._id,
        quantity: 1
      });
    }

    await customer.save();

    const updatedCustomer = await Customer.findById(req.user.id).populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    return res.status(201).json({
      success: true,
      message: existingItem
        ? "Product quantity increased"
        : "Product added to cart",
      cart: updatedCustomer.cart
    });
  } catch (error) {
    console.error("Add cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart"
    });
  }
}

async function getCart(req, res) {
  try {
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

    const cart = (customer.cart || []).filter(
      (item) => item.product
    );

    return res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
}

async function updateCartQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number greater than or equal to 1"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units are available`
      });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const item = customer.cart.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product is not in cart"
      });
    }

    item.quantity = quantity;

    await customer.save();

    const updatedCustomer = await Customer.findById(req.user.id).populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    return res.json({
      success: true,
      message: "Cart updated",
      cart: updatedCustomer.cart
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart"
    });
  }
}

async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const originalLength = customer.cart.length;

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (customer.cart.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product is not in cart"
      });
    }

    await customer.save();

    const updatedCustomer = await Customer.findById(req.user.id).populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    return res.json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCustomer.cart
    });
  } catch (error) {
    console.error("Remove cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart"
    });
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};