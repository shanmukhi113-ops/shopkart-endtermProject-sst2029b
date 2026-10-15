import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentCustomer } from "../services/api";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getCurrentCustomer()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "checking") {
    return <div className="center-message">Checking authentication...</div>;
  }

  return status === "authenticated"
    ? <Outlet />
    : <Navigate to="/login" replace />;
}