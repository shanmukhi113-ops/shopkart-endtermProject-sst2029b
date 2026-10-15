import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";

import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    refreshCart,
    updateQuantity,
    removeFromCart
  } = useCart();

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="page-heading">
          <p className="eyebrow">
            SHOPPING CART
          </p>

          <h1>My Cart</h1>

          <p className="muted">
            {totalUnits} item
            {totalUnits !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && (
          <div className="state-card">
            Loading your cart...
          </div>
        )}

        {!loading && error && (
          <div className="state-card error-box">
            <p>
              Unable to load your cart.
            </p>

            <button
              className="primary-button"
              onClick={refreshCart}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          cartItems.length === 0 && (
            <div className="state-card empty-state">
              <div className="empty-icon">
                🛒
              </div>

              <h2>Your cart is empty</h2>

              <p className="muted">
                Looks like you haven't added
                anything yet.
              </p>

              <Link
                className="primary-button"
                to="/products"
              >
                Browse Products
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          cartItems.length > 0 && (
            <div className="cart-layout">
              <section className="cart-items">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product._id}
                    item={item}
                    onUpdate={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </section>

              <aside className="summary-card">
                <h2>Order Summary</h2>

                <div className="summary-row">
                  <span>Items</span>
                  <strong>
                    {totalUnits}
                  </strong>
                </div>

                <div className="summary-row total-row">
                  <span>Subtotal</span>

                  <strong>
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <Link
                  className="primary-button full"
                  to="/checkout"
                >
                  Proceed to Checkout
                </Link>
              </aside>
            </div>
          )}
      </main>
    </>
  );
}