require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const products = [
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900",
    stock: 10
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
    stock: 25
  },
  {
    name: "Running Shoes",
    description: "Lightweight everyday running shoes with cushioned soles.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
    stock: 18
  },
  {
    name: "The Pragmatic Programmer",
    description: "A practical guide to software development and professional programming.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=900",
    stock: 14
  },
  {
    name: "Minimal Desk Lamp",
    description: "Modern adjustable LED desk lamp for work and study.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900",
    stock: 8
  },
  {
    name: "Smartphone Stand",
    description: "Adjustable aluminium stand for phones and small tablets.",
    price: 699,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900",
    stock: 32
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});