// src/Pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/LoginSignup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5001/signup", formData, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Signup response:", res.status, res.data);

      // Expect token from backend
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      } else {
        // If backend returns only message, redirect to login
        navigate("/");
      }
    } catch (err) {
      console.error("Signup failed:", err);
    
      if (err.response) {
        console.error("Server responded:", err.response.status, err.response.data);
        alert("Server error: " + err.response.data.message);
      } else if (err.request) {
        console.error("No response received:", err.request);
        alert("No response from server. Is backend running on port 5000?");
      } else {
        console.error("Axios config error:", err.message);
        alert("Axios setup error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <div className="auth-box glass-effect">
        <h1 className="app-title">Create <span>Account</span><br/><span className="subtitle">Join CINEMORA</span></h1>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit" className="login-btn" disabled={loading}>{loading ? "Signing up..." : "SIGN UP"}</button>
        </form>
        <p className="switch-text">
          Already have an account?<br/>
          <Link to="/login" className="signup-link">LOG IN</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
