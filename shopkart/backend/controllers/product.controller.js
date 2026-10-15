const mongoose = require("mongoose");
const Product = require("../models/product.model");

async function createProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ success: false, message: "All product fields are required" });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Price must be greater than 0" });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      stock: Number(stock)
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid product data" });
  }
}

async function getProducts(req, res) {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    let mongoQuery = Product.find(query).select("name description price category image stock createdAt");

    if (sort === "price_asc") mongoQuery = mongoQuery.sort({ price: 1 });
    if (sort === "price_desc") mongoQuery = mongoQuery.sort({ price: -1 });

    const products = await mongoQuery;

    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
}

async function getProductById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
}

module.exports = { createProduct, getProducts, getProductById };