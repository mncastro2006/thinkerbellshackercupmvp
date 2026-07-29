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
          text-decoration: none;
        }
        
        .brand-text-img {
          height: 52px; 
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
          /* Dark purple from OUI palette */
          color: #4c37a9;
          text-decoration: none;
          font-size: 16px;
          transition: color 0.2s;
        }
        .nav-text-link:hover {
          /* Medium purple from OUI palette for hover */
          color: #967cc7;
        }

        .nav-btn {
          /* Tangerine from the palette */
          background-color: #FF8F45;
          color: white;
          padding: 10px 24px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          transition: background 0.2s, transform 0.1s;
          border: none;
          cursor: pointer;
          font-size: 16px;
          display: inline-block;
          box-shadow: 0px 4px 0px #cf6e2f; /* Darker tangerine for 3D effect */
        }
        .nav-btn:hover {
          /* Orange from OUI palette for hover */
          background-color: #ffad33;
          box-shadow: 0px 4px 0px #cc8514;
        }
        .nav-btn:active {
          transform: translateY(4px);
          box-shadow: 0px 0px 0px transparent;
        }
      `}</style>

      {/* Top Left: Just the Vizma Wordmark Logo */}
      <Link to="/" className="nav-brand">
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