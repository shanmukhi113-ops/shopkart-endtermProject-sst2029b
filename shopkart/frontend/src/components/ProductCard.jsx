import { useState } from "react";
import { Link } from "react-router-dom";

import {
  addToWishlist
} from "../services/api";

import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const [wishlistState, setWishlistState] =
    useState("idle");

  const [wishlistError, setWishlistError] =
    useState("");

  const [cartState, setCartState] =
    useState("idle");

  const [cartError, setCartError] =
    useState("");

  async function handleWishlist() {
    if (
      wishlistState === "saving" ||
      wishlistState === "added"
    ) {
      return;
    }

    setWishlistState("saving");
    setWishlistError("");

    try {
      await addToWishlist(product._id);
      setWishlistState("added");
    } catch (error) {
      if (error.response?.status === 409) {
        setWishlistState("added");
        setWishlistError("");
      } else {
        setWishlistState("idle");
        setWishlistError(
          error.response?.data?.message ||
          "Unable to save product."
        );
      }
    }
  }

  async function handleCart() {
    if (
      cartState === "adding" ||
      product.stock === 0
    ) {
      return;
    }

    setCartState("adding");
    setCartError("");

    try {
      await addToCart(product._id);
      setCartState("added");
    } catch (error) {
      setCartState("idle");

      setCartError(
        error.response?.data?.message ||
        "Unable to add product to cart."
      );
    }
  }

  return (
    <article className="product-card">
      <img
        src={product.image}
        alt={product.name}
      />

      <div className="product-card-body">
        <span className="category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p
          className={
            product.stock > 0
              ? "stock in-stock"
              : "stock out-stock"
          }
        >
          {product.stock > 0
            ? `${product.stock} units left`
            : "Out of stock"}
        </p>

        <div className="card-actions">
          <Link
            className="primary-button"
            to={`/products/${product._id}`}
          >
            View Details
          </Link>

          <button
            className="secondary-button"
            onClick={handleWishlist}
            disabled={
              wishlistState === "saving" ||
              wishlistState === "added"
            }
          >
            {wishlistState === "saving"
              ? "Saving..."
              : wishlistState === "added"
              ? "♥ Added"
              : "♡ Wishlist"}
          </button>

          <button
            className="primary-button"
            onClick={handleCart}
            disabled={
              product.stock === 0 ||
              cartState === "adding"
            }
          >
            {cartState === "adding"
              ? "Adding..."
              : cartState === "added"
              ? "Added to Cart"
              : "Add to Cart"}
          </button>
        </div>

        {wishlistError && (
          <p className="inline-error">
            {wishlistError}
          </p>
        )}

        {cartError && (
          <p className="inline-error">
            {cartError}
          </p>
        )}
      </div>
    </article>
  );
}