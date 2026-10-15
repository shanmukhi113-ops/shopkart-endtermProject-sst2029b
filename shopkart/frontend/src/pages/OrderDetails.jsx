import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="success-card">
          <div className="success-icon">
            ✓
          </div>

          <p className="eyebrow">
            PAYMENT SUCCESSFUL
          </p>

          <h1>Order Placed Successfully</h1>

          <p className="muted">
            Your payment has been verified and
            your order has been saved.
          </p>

          <div className="order-id-box">
            <span>Order ID</span>
            <strong>{id}</strong>
          </div>

          <div className="success-actions">
            <Link
              className="primary-button"
              to="/orders"
            >
              View My Orders
            </Link>

            <Link
              className="secondary-button"
              to="/products"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}