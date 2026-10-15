import { useState } from "react";

export default function CartItem({
  item,
  onUpdate,
  onRemove
}) {
  const [updating, setUpdating] = useState(false);

  const product = item.product;

  async function changeQuantity(newQuantity) {
    if (newQuantity < 1) {
      return;
    }

    if (newQuantity > product.stock) {
      return;
    }

    try {
      setUpdating(true);
      await onUpdate(
        product._id,
        newQuantity
      );
    } finally {
      setUpdating(false);
    }
  }

  async function remove() {
    try {
      setUpdating(true);
      await onRemove(product._id);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <article className="cart-item">
      <img
        src={product.image}
        alt={product.name}
      />

      <div className="cart-item-info">
        <span className="category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="muted small">
          {product.stock} units currently in stock
        </p>
      </div>

      <div className="cart-item-controls">
        <div className="quantity-control">
          <button
            onClick={() =>
              changeQuantity(item.quantity - 1)
            }
            disabled={
              updating || item.quantity <= 1
            }
          >
            −
          </button>

          <strong>{item.quantity}</strong>

          <button
            onClick={() =>
              changeQuantity(item.quantity + 1)
            }
            disabled={
              updating ||
              item.quantity >= product.stock
            }
          >
            +
          </button>
        </div>

        <p className="price">
          ₹
          {(
            product.price * item.quantity
          ).toLocaleString("en-IN")}
        </p>

        <button
          className="text-button danger-text"
          onClick={remove}
          disabled={updating}
        >
          {updating
            ? "Updating..."
            : "Remove"}
        </button>
      </div>
    </article>
  );
}