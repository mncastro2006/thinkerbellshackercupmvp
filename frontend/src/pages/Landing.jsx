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
          
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 80px 20px; /* Space for navbar */
          box-sizing: border-box;
        }

        /* --- THE MAIN APP CARD --- */
        .main-app-card {
          display: flex;
          width: 100%;
          max-width: 1200px; 
          min-height: 550px;
          height: auto; 
          background: #FFFFFF;
          border-radius: 40px;
          box-shadow: 0px 20px 0px rgba(26, 48, 21, 0.1), 0px 30px 40px rgba(0,0,0,0.15);
          border: 6px solid #FFFFFF;
          position: relative;
          z-index: 10;
        }

        /* --- LEFT SIDE: FEATURES PANEL --- */
        .left-features-panel {
          width: 40%; 
          background: linear-gradient(180deg, #D0E4F7 0%, #A9CDEE 100%);
          padding: 40px 80px 40px 40px; 
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
          border-radius: 34px 0 0 34px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.85);
          padding: 12px 20px;
          border-radius: 100px;
          border: 3px solid #FFFFFF;
          box-shadow: 0px 6px 0px rgba(181, 214, 242, 0.8);
          transition: transform 0.2s ease;
          width: fit-content; 
          max-width: 100%;
          position: relative;
          z-index: 5;
        }
        .feature-item:hover {
          transform: translateX(8px);
        }

        .feature-icon-circle {
          font-size: 20px;
          width: 40px;
          height: 40px;
          background: #F0F8FF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0px -2px 0px #D0E4F7;
          flex-shrink: 0;
          color: #2C4A63;
        }

        .feature-text {
          font-size: 15px;
          font-weight: 800;
          color: #2C4A63;
          margin: 0;
          line-height: 1.2;
        }

        /* --- THE MASCOT (No Circle Frame) --- */
        .mascot-center-wrapper {
          position: absolute;
          left: 40%; /* Matches the 40% panel split */
          top: 50%;
          transform: translate(-50%, -50%);
          width: 350px; /* Size of the mascot */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          pointer-events: none; /* Prevents the invisible box from blocking mouse clicks */
        }

        .mascot-img {
          width: 100%;
          height: auto;
          /* Drop-shadow applies to the exact shape of the PNG instead of a box */
          filter: drop-shadow(0px 15px 20px rgba(0,0,0,0.25)); 
          z-index: 21;
        }

        /* --- RIGHT SIDE: HERO PANEL --- */
        .right-hero-panel {
          width: 60%;
          padding: 50px 50px 50px 190px; 
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          background: #FFFFFF;
          border-radius: 0 34px 34px 0;
        }

        .vizma-wordmark {
          max-width: 220px; 
          margin-bottom: 20px;
        }

        .hero-title {
          font-size: 38px;
          font-weight: 900;
          line-height: 1.15;
          color: #1A3015;
          margin-bottom: 16px;
        }

        .hero-text {
          font-size: 17px;
          line-height: 1.5;
          color: #4A6B42;
          margin-bottom: 30px;
          font-weight: 700;
          max-width: 95%;
        }

        /* 3D Glossy Green Button */
        .btn-3d {
          background: linear-gradient(180deg, #7CD936 0%, #52B313 100%);
          box-shadow: 0px 8px 0px #3B870B, 0px 15px 20px rgba(0, 0, 0, 0.2);
          border: 3px solid #9BEA5C;
          border-radius: 30px;
          padding: 14px 40px;
          color: #FFFFFF !important;
          font-weight: 900;
          font-size: 20px;
          text-decoration: none;
          display: inline-block;
          text-shadow: 0px 2px 0px rgba(0, 0, 0, 0.2);
          transition: all 0.1s ease;
          cursor: pointer;
        }
        .btn-3d:active {
          transform: translateY(8px);
          box-shadow: 0px 0px 0px #3B870B, 0px 5px 10px rgba(0, 0, 0, 0.2);
        }

        /* Mobile Adjustments */
        @media (max-width: 968px) {
          .main-app-card {
            flex-direction: column;
            height: auto;
          }
          .left-features-panel {
            width: 100%;
            border-radius: 34px 34px 0 0;
            padding: 40px 40px 120px 40px;
            align-items: center;
          }
          .feature-item {
            width: 100%;
            max-width: 350px;
          }
          .mascot-center-wrapper {
            position: relative;
            left: 50%;
            top: -60px; /* Lifts the mascot up slightly to bridge the two panels */
            transform: translateX(-50%);
            width: 260px;
          }
          .right-hero-panel {
            width: 100%;
            border-radius: 0 0 34px 34px;
            padding: 20px 40px 60px 40px;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>

      {/* Main Split-Card Container */}
      <div className="main-app-card">
        
        {/* LEFT SIDE: Features Panel */}
        <div className="left-features-panel">
          <div className="feature-item">
            <div className="feature-icon-circle">📄</div>
            <p className="feature-text">Upload any PDF lesson</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-circle">🔗</div>
            <p className="feature-text">Neurodiverse learning</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-circle">💌</div>
            <p className="feature-text">Visual, gentle storytelling</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-circle">📊</div>
            <p className="feature-text">Instant progress feedback</p>
          </div>
        </div>

        {/* CENTER OVERLAP: Floating Capybara Mascot */}
        <div className="mascot-center-wrapper">
          <img src="/mascot.png" alt="Vizma Capybara" className="mascot-img" />
        </div>

        {/* RIGHT SIDE: Text, Text-Logo, Button */}
        <div className="right-hero-panel">
          <img src="/vizma-logo.png" alt="Vizma" className="vizma-wordmark" />
          
          <h1 className="hero-title">Math made visual, gentle, and just for them.</h1>
          
          <p className="hero-text">
            Vizma turns any lesson PDF into short, illustrated stories with
            bite-sized questions — helping kids build confidence one story at a time.
          </p>
          
          <Link to="/role" className="btn-3d">
            Get started
          </Link>
        </div>

      </div>
    </div>
  );
}