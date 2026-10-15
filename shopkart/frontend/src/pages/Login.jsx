import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginCustomer(form);
      navigate("/home", { replace: true });
    } catch {
      setError("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div>
          <p className="eyebrow">SHOPKART</p>
          <h1>Welcome back</h1>
          <p className="muted">Log in to continue shopping.</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={update} required /></label>

        <button className="primary-button full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="switch-text">New to ShopKart? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}