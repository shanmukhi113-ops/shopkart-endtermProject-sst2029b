import { Link, useNavigate } from "react-router-dom";

import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();

  const {
    totalUnits
  } = useCart();

  async function handleLogout() {
    try {
      await logoutCustomer();
    } finally {
      navigate("/login", {
        replace: true
      });
    }
  }

  return (
    <nav className="navbar">
      <Link
        className="brand"
        to="/home"
      >
        ShopKart
      </Link>

      <div className="nav-links">
        <Link to="/home">
          Home
        </Link>

        <Link to="/products">
          Products
        </Link>

        <Link to="/wishlist">
          Wishlist
        </Link>

        <Link to="/cart">
          Cart ({totalUnits})
        </Link>

        <Link to="/orders">
          Orders
        </Link>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}