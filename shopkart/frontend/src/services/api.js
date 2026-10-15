import axios from "axios";

const api = axios.create({
  baseURL: "/",
  withCredentials: true
});

// -------------------------
// Authentication
// -------------------------

export const registerCustomer = (data) =>
  api.post("/customers/register", data);

export const loginCustomer = (data) =>
  api.post("/customers/login", data);

export const getCurrentCustomer = () =>
  api.get("/customers/me");

export const logoutCustomer = () =>
  api.post("/customers/logout");

// -------------------------
// Products
// -------------------------

export const getProducts = (params = {}) =>
  api.get("/products", { params });

export const getProduct = (id) =>
  api.get(`/products/${id}`);

// -------------------------
// Wishlist - LAB 04
// -------------------------

export const addToWishlist = (productId) =>
  api.post(`/wishlist/${productId}`);

export const getWishlist = () =>
  api.get("/wishlist");

export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

// -------------------------
// Cart - LAB 05
// -------------------------

export const addToCart = (productId) =>
  api.post(`/cart/${productId}`);

export const getCart = () =>
  api.get("/cart");

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) =>
  api.delete(`/cart/${productId}`);

// -------------------------
// Orders - LAB 06
// -------------------------

export const createPaymentOrder = (shippingAddress) =>
  api.post("/orders/create-payment-order", {
    shippingAddress
  });

export const verifyPayment = (data) =>
  api.post("/orders/verify-payment", data);

export const getOrders = () =>
  api.get("/orders");

export const getOrder = (id) =>
  api.get(`/orders/${id}`);

export default api;