import { useState } from "react";
import api from "../api/axios";
import "../styles/login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Save JWT token
      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      alert("Login successful!");

      // Move to dashboard
      onLoginSuccess();

    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>ShopSense</h1>

        <p className="login-subtitle">
          AI-Powered Marketplace
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button type="submit">
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;