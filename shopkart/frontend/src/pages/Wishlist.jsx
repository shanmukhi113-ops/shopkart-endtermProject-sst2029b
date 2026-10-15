import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  getWishlist,
  removeFromWishlist
} from "../services/api";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  async function loadWishlist() {
    try {
      setStatus("loading");
      setError("");

      const response = await getWishlist();

      setWishlist(response.data.wishlist || []);
      setStatus("success");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load wishlist."
      );
      setStatus("error");
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function handleRemove(productId) {
    try {
      setRemovingId(productId);

      await removeFromWishlist(productId);

      setWishlist((current) =>
        current.filter(
          (product) => product._id !== productId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to remove product."
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="page-heading">
          <p className="eyebrow">
            YOUR SAVED PRODUCTS
          </p>

          <h1>My Wishlist</h1>

          <p className="muted">
            {wishlist.length} product
            {wishlist.length !== 1 ? "s" : ""} saved.
          </p>
        </div>

        {status === "loading" && (
          <div className="state-card">
            Loading your wishlist...
          </div>
        )}

        {status === "error" && (
          <div className="state-card error-box">
            <p>
              Something went wrong.
              <br />
              We couldn't load your wishlist.
            </p>

            <button
              className="primary-button"
              onClick={loadWishlist}
            >
              Try Again
            </button>
          </div>
        )}

        {status === "success" &&
          wishlist.length === 0 && (
            <div className="state-card empty-state">
              <div className="empty-icon">
                ❤️
              </div>

              <h2>Your wishlist is empty</h2>

              <p className="muted">
                Save products you love and find
                them here later.
              </p>

              <Link
                className="primary-button"
                to="/products"
              >
                Browse Products
              </Link>
            </div>
          )}

        {status === "success" &&
          wishlist.length > 0 && (
            <div className="product-grid">
              {wishlist.map((product) => (
                <article
                  className="product-card"
                  key={product._id}
                >
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
                      ₹
                      {product.price.toLocaleString(
                        "en-IN"
                      )}
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
                        className="secondary-button danger-button"
                        onClick={() =>
                          handleRemove(product._id)
                        }
                        disabled={
                          removingId === product._id
                        }
                      >
                        {removingId === product._id
                          ? "Removing..."
                          : "Remove ♥"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        {error && status === "success" && (
          <div className="error-box page-error">
            {error}
          </div>
        )}
      </main>
    </>
  );
}