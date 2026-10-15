
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// POST /wishlist/:productId
async function addToWishlist(req, res) {
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

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    const alreadyAdded = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyAdded) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist"
      });
    }

    customer.wishlist.push(product._id);
    await customer.save();

    const updatedCustomer = await Customer.findById(
      req.user.id
    ).populate(
      "wishlist",
      "name description price category image stock"
    );

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: updatedCustomer.wishlist
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist"
    });
  }
}

// GET /wishlist
async function getWishlist(req, res) {
  try {
    const customer = await Customer.findById(
      req.user.id
    ).populate(
      "wishlist",
      "name description price category image stock"
    );

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    return res.json({
      success: true,
      wishlist: (customer.wishlist || []).filter(Boolean)
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist"
    });
  }
}

// DELETE /wishlist/:productId
async function removeFromWishlist(req, res) {
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

    const originalLength = customer.wishlist.length;

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );

    if (customer.wishlist.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist"
      });
    }

    await customer.save();

    const updatedCustomer = await Customer.findById(
      req.user.id
    ).populate(
      "wishlist",
      "name description price category image stock"
    );

    return res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: updatedCustomer.wishlist
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist"
    });
  }
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};
