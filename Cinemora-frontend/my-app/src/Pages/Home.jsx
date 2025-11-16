import React from "react";
import { Link } from "react-router-dom";
import "./CSS/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-content">
        <h1 className="hero-title">
          Welcome to <span>Cinemora</span>
        </h1>
        <p className="hero-subtitle">
          Your one-stop destination to explore, review, and share your favorite web series.
        </p>
        <div className="button-group">
          <Link to="/login" className="btn login-btn">
            Log In
          </Link>
          <Link to="/signup" className="btn signup-btn">
            Sign Up
          </Link>
          <Link to="/series" className="btn explore-btn">
            Explore Series
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
