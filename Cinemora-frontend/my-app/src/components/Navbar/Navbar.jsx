import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-icon">🎬</div>
            <h1 className="logo-text">CINEMORA</h1>
          </div>
          <nav className="nav-links">
            <a href="#home" className="nav-link">HOME</a>
            <a href="#series" className="nav-link">SERIES</a>
            <a href="#profile" className="nav-link">PROFILE</a>
          </nav>
          <button className="login-btn">LOGIN</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="background-overlay"></div>
        <div className="content-wrapper">
          <div className="featured-content">
            <div className="trending-badge">TRENDING NOW</div>
            <h2 className="series-title">THE LAST KINGDOM</h2>
            <div className="series-meta">
              <span className="rating">
                <span className="star-icon">⭐</span>
                8.9
              </span>
              <span className="year">2023</span>
              <span className="seasons">3 Seasons</span>
              <span className="genre-badge">Drama</span>
            </div>
            <p className="series-description">
              A gripping tale of power, betrayal, and redemption set in a dystopian future where humanity's last hope lies in the hands of unlikely heroes.
            </p>
            <div className="action-buttons">
              <button className="watch-now-btn">
                <span className="play-icon">▶</span>
                WATCH NOW
              </button>
              <button className="more-info-btn">
                <span className="info-icon">ℹ</span>
                MORE INFO
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
