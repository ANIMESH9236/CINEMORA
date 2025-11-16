// src/Pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api"; // Using your axios instance
import "./CSS/LoginSignup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
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
      // Correct API call
      const res = await API.post("/signup", formData);

      console.log("Signup response:", res.status, res.data);

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      } else {
        alert("Signup succeeded but token missing. Redirecting to login.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Signup failed:", err);

      const message =
        err.response?.data?.message ||
        "Unexpected error occurred. Please try again.";

      alert("Signup failed: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <div className="auth-box glass-effect">
        <h1 className="app-title">
          Create <span>Account</span>
          <br />
          <span className="subtitle">Join CINEMORA</span>
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

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
            {loading ? "Signing up..." : "SIGN UP"}
          </button>
        </form>

        <p className="switch-text">
          Already have an account?
          <br />
          <Link to="/login" className="signup-link">
            LOG IN
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
