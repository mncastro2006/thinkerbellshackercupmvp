import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function chooseParent() {
    navigate(user ? "/parent" : "/login");
  }

  function chooseStudent() {
    navigate("/student");
  }

  return (
    <div className="role-select-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Nunito:wght@700;900&display=swap');

        .role-select-wrapper {
          font-family: 'Nunito', 'Poppins', sans-serif;
          background-image: url('/bg.png'); 
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Padding accounts for the fixed navbar */
          padding: 100px 20px 40px 20px; 
          box-sizing: border-box;
        }

        /* Container holding everything */
        .role-main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 40px;
          box-shadow: 0px 20px 0px rgba(76, 55, 169, 0.08), 0px 30px 40px rgba(0,0,0,0.1);
          border: 6px solid #FFFFFF;
          padding: 60px 40px;
          text-align: center;
          max-width: 850px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .role-title {
          font-size: 38px;
          font-weight: 900;
          color: #4c37a9; /* OUI Dark Purple */
          margin-top: 0;
          margin-bottom: 12px;
        }

        .role-subtitle {
          font-size: 18px;
          color: #6698cc; /* OUI Blue */
          font-weight: 800;
          margin-bottom: 50px;
        }

        .role-grid {
          display: flex;
          gap: 40px;
          justify-content: center;
        }

        /* Individual Choice Cards */
        .role-card {
          background: #FFFFFF;
          border-radius: 35px;
          padding: 40px 30px;
          width: 100%;
          max-width: 320px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 4px solid #FFFFFF;
        }

        /* 3D Shadows using the OUI Palette */
        .student-card {
          box-shadow: 0px 12px 0px #7FB9E6, 0px 20px 20px rgba(0,0,0,0.1); /* Sky */
        }
        
        .parent-card {
          box-shadow: 0px 12px 0px #F98BA9, 0px 20px 20px rgba(0,0,0,0.1); /* Pink */
        }

        .role-card:hover {
          transform: translateY(-8px);
        }

        .role-card:active {
          transform: translateY(8px);
        }
        
        .student-card:active {
          box-shadow: 0px 0px 0px #7FB9E6, 0px 5px 10px rgba(0,0,0,0.1);
        }

        .parent-card:active {
          box-shadow: 0px 0px 0px #F98BA9, 0px 5px 10px rgba(0,0,0,0.1);
        }

        /* Emoji Icon Circle */
        .role-card__emoji {
          font-size: 50px;
          width: 100px;
          height: 100px;
          background: #F4D77A; /* OUI Butter */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          box-shadow: inset 0px -5px 0px #e5c765;
        }

        .role-card h3 {
          font-size: 26px;
          font-weight: 900;
          color: #4c37a9; /* OUI Dark Purple */
          margin-bottom: 12px;
          margin-top: 0;
        }

        .role-card p {
          font-size: 16px;
          color: #6698cc; /* OUI Blue */
          font-weight: 700;
          line-height: 1.5;
          margin: 0;
        }

        /* Mobile Layout */
        @media (max-width: 768px) {
          .role-grid {
            flex-direction: column;
            align-items: center;
            gap: 30px;
          }
          .role-main-card {
            padding: 40px 20px;
          }
        }
      `}</style>

      <div className="role-main-card">
        <h1 className="role-title">Who's using Vizma?</h1>
        <p className="role-subtitle">Choose your role to continue.</p>

        <div className="role-grid">
          {/* Student Option */}
          <div className="role-card student-card" onClick={chooseStudent}>
            <div className="role-card__emoji">🧒</div>
            <h3>Student</h3>
            <p>I have a code from my parent and I'm ready to learn.</p>
          </div>

          {/* Parent Option */}
          <div className="role-card parent-card" onClick={chooseParent}>
            <div className="role-card__emoji">🧑‍🏫</div>
            <h3>Parent</h3>
            <p>I want to upload a lesson and create a code for my child.</p>
          </div>
        </div>
      </div>
    </div>
  );
}