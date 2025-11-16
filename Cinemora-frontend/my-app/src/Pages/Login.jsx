// src/Pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/LoginSignup.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://cinemora-jumy.onrender.com", formData, {
        headers: { "Content-Type": "application/json" }
      });
      
      console.log("Login response:", res.status, res.data);

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        alert("Login failed: token missing in response");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message || err);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <div className="auth-box glass-effect">
        <h1 className="app-title">WELCOME BACK TO<span></span><br/><span className="subtitle">CINEMORA</span></h1>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit" className="login-btn" disabled={loading}>{loading ? "Logging in..." : "LOG IN"}</button>
        </form>
        <p className="switch-text">
          Don't have an account?<br/>
          <Link to="/signup" className="signup-link">SIGN UP</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
