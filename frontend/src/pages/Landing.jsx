import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-cartoony-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Nunito:wght@700;900&display=swap');

        .landing-cartoony-wrapper {
          font-family: 'Nunito', 'Poppins', sans-serif;
          background-image: url('/bg.png'); 
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          
          height: 100vh;
          width: 100vw;
          overflow: hidden; 
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 80px 20px 20px 20px; 
          box-sizing: border-box;
        }

        /* --- THE MAIN APP CARD --- */
        .main-app-card {
          display: flex;
          width: 100%;
          max-width: 1200px; 
          height: 100%;
          max-height: 580px; 
          background: #FFFFFF;
          border-radius: 40px;
          box-shadow: 0px 20px 0px rgba(76, 55, 169, 0.08), 0px 30px 40px rgba(0,0,0,0.1);
          border: 6px solid #FFFFFF;
          position: relative;
          z-index: 10;
        }

        /* --- LEFT SIDE: FEATURES PANEL --- */
        .left-features-panel {
          width: 42%; 
          /* Sky to Lavender Gradient */
          background: linear-gradient(180deg, #7FB9E6 0%, #D6BEEA 100%);
          padding: 30px 70px 30px 40px; 
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px; 
          border-radius: 34px 0 0 34px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 20px; 
          border-radius: 100px;
          border: 3px solid #FFFFFF;
          /* Pink shadow from the palette */
          box-shadow: 0px 6px 0px #F98BA9;
          transition: transform 0.2s ease;
          width: 100%; 
          max-width: 360px; 
          position: relative;
          z-index: 5;
        }
        .feature-item:hover {
          transform: translateX(8px);
        }

        .feature-icon-circle {
          font-size: 18px;
          width: 36px;
          height: 36px;
          /* Butter background */
          background: #F4D77A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0px -2px 0px #e5c765;
          flex-shrink: 0;
          /* Dark purple from OUI palette for contrast */
          color: #4c37a9;
        }

        .feature-text {
          font-size: 14px;
          font-weight: 800;
          /* Dark purple from OUI palette */
          color: #4c37a9;
          margin: 0;
          line-height: 1.2;
        }

        /* --- THE MASCOT --- */
        .mascot-center-wrapper {
          position: absolute;
          left: 42%; 
          top: 50%;
          transform: translate(-50%, -50%);
          width: 320px; 
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          pointer-events: none; 
        }

        .mascot-img {
          width: 100%;
          height: auto;
          filter: drop-shadow(0px 15px 20px rgba(76, 55, 169, 0.2)); 
          z-index: 21;
        }

        /* --- RIGHT SIDE: HERO PANEL --- */
        .right-hero-panel {
          width: 58%; 
          padding: 30px 40px 30px 170px; 
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          background: #FFFFFF;
          border-radius: 0 34px 34px 0;
        }

        .vizma-wordmark {
          width: 100%;
          max-width: 440px; 
          margin-bottom: 16px; 
        }

        .hero-title {
          font-size: 34px;
          font-weight: 900;
          line-height: 1.15;
          /* Dark purple from OUI palette */
          color: #4c37a9;
          margin-bottom: 12px;
        }

        .hero-text {
          font-size: 16px;
          line-height: 1.5;
          /* Blue from OUI palette */
          color: #6698cc;
          margin-bottom: 24px; 
          font-weight: 800;
          max-width: 95%;
        }

        /* 3D Glossy Button - Matcha Theme */
        .btn-3d {
          /* Matcha to slightly darker green (OUI palette green) */
          background: linear-gradient(180deg, #B7C96A 0%, #6baa75 100%);
          box-shadow: 0px 8px 0px #538b5d, 0px 15px 20px rgba(0, 0, 0, 0.15);
          border: 3px solid #c9da7b;
          border-radius: 30px;
          padding: 12px 36px;
          color: #FFFFFF !important;
          font-weight: 900;
          font-size: 18px;
          text-decoration: none;
          display: inline-block;
          text-shadow: 0px 2px 0px rgba(0, 0, 0, 0.15);
          transition: all 0.1s ease;
          cursor: pointer;
        }
        .btn-3d:active {
          transform: translateY(8px);
          box-shadow: 0px 0px 0px #538b5d, 0px 5px 10px rgba(0, 0, 0, 0.15);
        }

        /* Mobile Adjustments */
        @media (max-width: 968px) {
          .landing-cartoony-wrapper {
            height: auto;
            overflow-y: auto; 
          }
          .main-app-card {
            flex-direction: column;
            height: auto;
            max-height: none;
          }
          .left-features-panel {
            width: 100%;
            border-radius: 34px 34px 0 0;
            padding: 40px 40px 100px 40px;
            align-items: center;
          }
          .feature-item {
            width: 100%;
            max-width: 380px; 
          }
          .mascot-center-wrapper {
            position: relative;
            left: 50%;
            top: -50px; 
            transform: translateX(-50%);
            width: 240px;
          }
          .right-hero-panel {
            width: 100%;
            border-radius: 0 0 34px 34px;
            padding: 20px 40px 50px 40px;
            align-items: center;
            text-align: center;
          }
          .vizma-wordmark {
            max-width: 300px; 
          }
        }
      `}</style>

      {/* Main Split-Card Container */}
      <div className="main-app-card">
        
        {/* LEFT SIDE: Features Panel */}
        <div className="left-features-panel">
          <div className="feature-item">
            <div className="feature-icon-circle">📄</div>
            <p className="feature-text">Upload Any PDF Lesson</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-circle">🔗</div>
            <p className="feature-text">Neurodiverse Learning</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-circle">💌</div>
            <p className="feature-text">Visual & Gentle Storytelling</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-circle">📊</div>
            <p className="feature-text">Instant Progress Feedback</p>
          </div>
        </div>

        {/* CENTER OVERLAP: Floating Capybara Mascot */}
        <div className="mascot-center-wrapper">
          <img src="/mascot.png" alt="Vizma Capybara" className="mascot-img" />
        </div>

        {/* RIGHT SIDE: Text, Text-Logo, Button */}
        <div className="right-hero-panel">
          <img src="/vizma-logo.png" alt="Vizma" className="vizma-wordmark" />
          
          <h1 className="hero-title">Math made visual, gentle, and fit for them.</h1>
          
          <p className="hero-text">
            Vizma turns any lesson PDF into short, illustrated stories with
            bite-sized questions, helping students build confidence one story at a time.
          </p>
          
          <Link to="/role" className="btn-3d">
            Get Started
          </Link>
        </div>

      </div>
    </div>
  );
}