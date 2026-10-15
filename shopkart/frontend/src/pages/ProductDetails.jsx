import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  getProduct,
  addToWishlist
} from "../services/api";

import { useCart } from "../context/CartContext.jsx";

export default function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");

  const [wishlistState, setWishlistState] =
    useState("idle");

  const [cartState, setCartState] =
    useState("idle");

  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(id)
      .then((res) => {
        setProduct(res.data.product);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [id]);

  async function handleWishlist() {
    setWishlistState("saving");
    setError("");

    try {
      await addToWishlist(id);
      setWishlistState("added");
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistState("added");
      } else {
        setWishlistState("idle");

        setError(
          err.response?.data?.message ||
          "Unable to save product."
        );
      }
    }
  }

  async function handleCart() {
    if (!product || product.stock === 0) {
      return;
    }

    setCartState("adding");
    setError("");

    try {
      await addToCart(product._id);
      setCartState("added");
    } catch (err) {
      setCartState("idle");

      setError(
        err.response?.data?.message ||
        "Unable to add product to cart."
      );
    }
  }

  return (
    <>
      <Navbar />

      <main className="page">
        {status === "loading" && (
          <div className="state-card">
            Loading product...
          </div>
        )}

        {status === "error" && (
          <div className="state-card error-box">
            Product could not be found.
            <br />

            <Link to="/products">
              Back to products
            </Link>
          </div>
        )}

        {status === "success" && product && (
          <section className="details-card">
            <img
              src={product.image}
              alt={product.name}
            />

            <div className="details-content">
              <span className="category">
                {product.category}
              </span>

              <h1>{product.name}</h1>

              <p className="details-description">
                {product.description}
              </p>

              <p className="price large">
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
                  ? `${product.stock} units available`
                  : "Out of stock"}
              </p>

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}

              <div className="details-actions">
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
                    ? "♥ Added to Wishlist"
                    : "♡ Add to Wishlist"}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}