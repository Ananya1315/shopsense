import { useState } from "react";
import api from "../api/axios";
import "../styles/signup.css";

function Signup({ onBackToLogin }) {
  const [accountType, setAccountType] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  // =========================================
  // CUSTOMER SIGNUP
  // =========================================

  const handleCustomerSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/customers", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        area: form.area,
        password: form.password,
      });

      setSuccess(
        "Customer account created successfully! You can now login."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        area: "",
        address: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Customer signup failed:", error);

      setError(
        error.response?.data?.detail ||
        "Failed to create customer account."
      );
    }
  };

  // =========================================
  // VENDOR SIGNUP
  // =========================================

  const handleVendorSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/vendor/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
      });

      setSuccess(
        "Vendor application submitted successfully! Please wait for admin approval before logging in."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        area: "",
        address: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Vendor signup failed:", error);

      setError(
        error.response?.data?.detail ||
        "Failed to submit vendor application."
      );
    }
  };

  // =========================================
  // ACCOUNT TYPE SELECTION
  // =========================================

  if (!accountType) {
    return (
      <div className="signup-page">

        <div className="signup-card">

          <h1>ShopSense</h1>

          <p className="signup-subtitle">
            Create your account
          </p>

          <p className="signup-question">
            How would you like to use ShopSense?
          </p>

          <div className="account-options">

            <button
              className="account-option"
              onClick={() => setAccountType("customer")}
            >
              <span className="account-icon">🛍️</span>

              <div>
                <h2>Customer</h2>
                <p>
                  Browse products and shop from vendors
                </p>
              </div>
            </button>

            <button
              className="account-option"
              onClick={() => setAccountType("vendor")}
            >
              <span className="account-icon">🏪</span>

              <div>
                <h2>Vendor</h2>
                <p>
                  Sell your products on ShopSense
                </p>
              </div>
            </button>

          </div>

          <button
            className="back-login-button"
            onClick={onBackToLogin}
          >
            ← Back to Login
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // CUSTOMER FORM
  // =========================================

  if (accountType === "customer") {
    return (
      <div className="signup-page">

        <div className="signup-card form-card">

          <h1>ShopSense</h1>

          <p className="signup-subtitle">
            Customer Registration
          </p>

          <form onSubmit={handleCustomerSignup}>

            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <label>Area</label>
            <input
              type="text"
              name="area"
              placeholder="Enter your area"
              value={form.area}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="signup-error">
                {error}
              </p>
            )}

            {success && (
              <p className="signup-success">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="signup-submit"
            >
              Create Customer Account
            </button>

          </form>

          <button
            className="back-login-button"
            onClick={() => setAccountType(null)}
          >
            ← Choose Different Account Type
          </button>

          <button
            className="login-link-button"
            onClick={onBackToLogin}
          >
            Already have an account? Login
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // VENDOR FORM
  // =========================================

  return (
    <div className="signup-page">

      <div className="signup-card form-card">

        <h1>ShopSense</h1>

        <p className="signup-subtitle">
          Vendor Registration
        </p>

        <div className="approval-notice">
          <strong>Vendor approval required</strong>

          <span>
            Your application will be reviewed by an
            administrator before you can login.
          </span>
        </div>

        <form onSubmit={handleVendorSignup}>

          <label>Business Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your business name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your business email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label>Address</label>
          <input
            type="text"
            name="address"
            placeholder="Enter your business address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && (
            <p className="signup-error">
              {error}
            </p>
          )}

          {success && (
            <p className="signup-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="signup-submit"
          >
            Submit Vendor Application
          </button>

        </form>

        <button
          className="back-login-button"
          onClick={() => setAccountType(null)}
        >
          ← Choose Different Account Type
        </button>

        <button
          className="login-link-button"
          onClick={onBackToLogin}
        >
          Already have an account? Login
        </button>

      </div>

    </div>
  );
}

export default Signup;