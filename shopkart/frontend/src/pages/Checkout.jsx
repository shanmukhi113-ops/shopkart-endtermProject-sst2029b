import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  createPaymentOrder,
  verifyPayment
} from "../services/api";

import { useCart } from "../context/CartContext.jsx";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    totalUnits,
    subtotal,
    clearCartLocal
  } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value
    });
  }

  function validateForm() {
    for (const value of Object.values(form)) {
      if (!value.trim()) {
        return "All shipping fields are required.";
      }
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return "Phone number must contain 10 valid digits.";
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return "Pincode must contain 6 digits.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const response =
        await createPaymentOrder(form);

      const data = response.data;

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded."
        );
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id:
          data.razorpayOrderId,

        handler: async function (
          paymentResponse
        ) {
          try {
            setLoading(true);

            const verifyResponse =
              await verifyPayment({
                shopKartOrderId:
                  data.shopKartOrderId,

                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature
              });

            if (
              verifyResponse.data.success
            ) {
              clearCartLocal();

              navigate(
                `/order-success/${data.shopKartOrderId}`
              );
            }
          } catch (verificationError) {
            setError(
              verificationError.response
                ?.data?.message ||
                "Payment verification failed. Your cart has not been cleared."
            );
          } finally {
            setLoading(false);
          }
        },

        prefill: {
          name: form.fullName,
          contact: form.phone
        }
      };

      const paymentObject =
        new window.Razorpay(options);

      paymentObject.on(
        "payment.failed",
        function () {
          setError(
            "Payment failed. Your cart has not been cleared. Please try again."
          );
          setLoading(false);
        }
      );

      paymentObject.open();

      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to start payment."
      );

      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />

        <main className="page">
          <div className="state-card empty-state">
            <div className="empty-icon">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p className="muted">
              Add products before checking out.
            </p>

            <Link
              className="primary-button"
              to="/products"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="page-heading">
          <p className="eyebrow">
            CHECKOUT
          </p>

          <h1>Complete your order</h1>

          <p className="muted">
            Enter your shipping information
            and continue to secure payment.
          </p>
        </div>

        <div className="checkout-layout">
          <form
            className="checkout-card"
            onSubmit={handleSubmit}
          >
            <h2>Shipping Address</h2>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <label>
              Full Name

              <input
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Phone Number

              <input
                name="phone"
                value={form.phone}
                onChange={updateField}
                placeholder="10 digit number"
                required
              />
            </label>

            <label>
              Address Line

              <input
                name="addressLine1"
                value={form.addressLine1}
                onChange={updateField}
                required
              />
            </label>

            <div className="form-two-column">
              <label>
                City

                <input
                  name="city"
                  value={form.city}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                State

                <input
                  name="state"
                  value={form.state}
                  onChange={updateField}
                  required
                />
              </label>
            </div>

            <label>
              Pincode

              <input
                name="pincode"
                value={form.pincode}
                onChange={updateField}
                placeholder="6 digits"
                required
              />
            </label>

            <button
              className="primary-button full"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Pay with Razorpay"}
            </button>
          </form>

          <aside className="summary-card">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div
                className="summary-product"
                key={item.product._id}
              >
                <span>
                  {item.product.name}
                  {" × "}
                  {item.quantity}
                </span>

                <strong>
                  ₹
                  {(
                    item.product.price *
                    item.quantity
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}

            <div className="summary-row">
              <span>Total Items</span>
              <strong>{totalUnits}</strong>
            </div>

            <div className="summary-row total-row">
              <span>Total</span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}