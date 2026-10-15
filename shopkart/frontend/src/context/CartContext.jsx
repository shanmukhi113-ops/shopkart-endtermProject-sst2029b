import { Outlet } from "react-router-dom";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getCart,
  addToCart as addToCartApi,
  updateCartQuantity as updateCartQuantityApi,
  removeFromCart as removeFromCartApi
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider()  {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshCart() {
    try {
      setLoading(true);
      setError("");

      const response = await getCart();

      setCartItems(response.data.cart || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your cart."
      );
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCart();
  }, []);

  async function addToCart(productId) {
    const response = await addToCartApi(productId);

    setCartItems(response.data.cart || []);

    return response.data;
  }

  async function updateQuantity(productId, quantity) {
    const response = await updateCartQuantityApi(
      productId,
      quantity
    );

    setCartItems(response.data.cart || []);

    return response.data;
  }

  async function removeFromCart(productId) {
    const response = await removeFromCartApi(productId);

    setCartItems(response.data.cart || []);

    return response.data;
  }

  function clearCartLocal() {
    setCartItems([]);
  }

  const totalUnits = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return (
        total +
        item.product.price * item.quantity
      );
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCartLocal
  };

  return (
  <CartContext.Provider value={value}>
    <Outlet />
  </CartContext.Provider>
);
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}