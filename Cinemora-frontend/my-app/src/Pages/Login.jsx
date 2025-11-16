// src/Pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api"; // use your axios instance
import "./CSS/LoginSignup.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Correct API endpoint
      const res = await API.post("/login", formData);

      console.log("Login response:", res.status, res.data);

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home"); // redirect after login
      } else {
        alert("Login failed: No token received from server");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);

      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <div className="auth-box glass-effect">
        <h1 className="app-title">
          WELCOME BACK TO<br />
          <span className="subtitle">CINEMORA</span>
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        <p className="switch-text">
          Don't have an account?
          <br />
          <Link to="/signup" className="signup-link">
            SIGN UP
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
