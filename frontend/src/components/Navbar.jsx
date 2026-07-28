import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar-wrapper">
      <style>{`
        .navbar-wrapper {
          position: fixed;
          top: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          z-index: 100;
          box-sizing: border-box;
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        
        .brand-icon {
          height: 40px;
          width: auto;
        }
        
        .brand-text-img {
          height: 32px; /* Sized to align nicely with the V icon */
          width: auto;
          object-fit: contain;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-text-link {
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          color: #1A3015;
          text-decoration: none;
          font-size: 16px;
        }
        .nav-text-link:hover {
          color: #5C4B99;
        }

        .nav-btn {
          background-color: #8C7DE6;
          color: white;
          padding: 10px 24px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
          font-size: 16px;
          display: inline-block;
        }
        .nav-btn:hover {
          background-color: #7262C9;
        }
      `}</style>

      {/* Top Left: Logo & Wordmark Image */}
      <Link to="/" className="nav-brand">
        <img src="/v-icon.png" alt="Vizma logo" className="brand-icon" />
        <img src="/vizma-logo.png" alt="Vizma wordmark" className="brand-text-img" />
      </Link>

      {/* Top Right: Conditional Auth Links */}
      <nav className="nav-links">
        {user ? (
          <>
            <Link to="/parent" className="nav-text-link">Dashboard</Link>
            <button
              className="nav-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-text-link">Log in</Link>
            <Link to="/role" className="nav-btn">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}