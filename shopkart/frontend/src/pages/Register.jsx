import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerCustomer(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div>
          <p className="eyebrow">SHOPKART</p>
          <h1>Create your account</h1>
          <p className="muted">Start shopping with your ShopKart account.</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <label>Full Name<input name="fullName" value={form.fullName} onChange={update} required /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={update} required minLength={6} /></label>
        <label>Phone Number<input name="phone" value={form.phone} onChange={update} required /></label>

        <button className="primary-button full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="switch-text">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}