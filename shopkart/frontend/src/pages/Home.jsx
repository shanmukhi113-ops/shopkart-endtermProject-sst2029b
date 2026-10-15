import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../services/api";

export default function Home() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentCustomer()
      .then((res) => setCustomer(res.data))
      .catch(() => setError("Could not load your profile."));
  }, []);

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="hero">
          <div>
            <p className="eyebrow">WELCOME TO SHOPKART</p>
            <h1>{customer ? `Hi, ${customer.fullName}!` : "Welcome!"}</h1>
            <p className="muted">Discover products and find something you love.</p>
            <Link className="primary-button" to="/products">Browse Products</Link>
          </div>
          <div className="hero-icon">🛒</div>
        </section>

        <section className="profile-card">
          <h2>Your Profile</h2>
          {error && <div className="error-box">{error}</div>}
          {!customer && !error ? <p>Loading profile...</p> : null}
          {customer && (
            <div className="profile-grid">
              <div><span>Name</span><strong>{customer.fullName}</strong></div>
              <div><span>Email</span><strong>{customer.email}</strong></div>
              <div><span>Phone</span><strong>{customer.phone}</strong></div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}