import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function EnterCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/sessions/join", { code, studentName });
      sessionStorage.setItem("tb_session", JSON.stringify(res.data.session));
      sessionStorage.setItem("tb_module", JSON.stringify(res.data.module));
      navigate("/student/play");
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect. Please check the code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="enter-code-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Nunito:wght@700;900&display=swap');

        .enter-code-wrapper {
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
          padding: 100px 20px 40px 20px; 
          box-sizing: border-box;
        }

        /* 3D Main Card */
        .code-main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 40px;
          /* Sky blue shadow for the student theme */
          box-shadow: 0px 15px 0px #7FB9E6, 0px 25px 30px rgba(0,0,0,0.15);
          border: 6px solid #FFFFFF;
          padding: 50px 40px;
          text-align: center;
          max-width: 550px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        /* Emoji Icon Circle */
        .header-emoji-circle {
          font-size: 50px;
          width: 100px;
          height: 100px;
          background: #F4D77A; /* OUI Butter */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
          box-shadow: inset 0px -5px 0px #e5c765;
        }

        .title {
          font-size: 34px;
          font-weight: 900;
          color: #4c37a9; /* OUI Dark Purple */
          margin-top: 0;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 16px;
          color: #6698cc; /* OUI Blue */
          font-weight: 800;
          margin-bottom: 30px;
        }

        /* Form & Inputs */
        .code-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 16px;
          font-weight: 800;
          color: #4c37a9;
          margin-left: 10px;
        }

        .styled-input {
          width: 100%;
          padding: 16px 24px;
          border-radius: 20px;
          border: 3px solid #D6BEEA; /* OUI Lavender */
          background: #FAFAFA;
          font-family: 'Nunito', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #4c37a9;
          box-sizing: border-box;
          transition: all 0.2s ease;
          outline: none;
        }

        .styled-input:focus {
          border-color: #7FB9E6; /* OUI Sky */
          background: #FFFFFF;
          box-shadow: 0px 0px 0px 4px rgba(127, 185, 230, 0.2);
        }

        .styled-input::placeholder {
          color: #b5a7d6;
          font-weight: 700;
        }

        .input-code {
          text-align: center;
          font-size: 28px;
          letter-spacing: 0.3em;
          font-weight: 900;
          text-transform: uppercase;
        }

        .error-message {
          color: #F98BA9; /* OUI Pink */
          font-weight: 800;
          text-align: center;
          margin: 0;
          background: #fff0f4;
          padding: 12px;
          border-radius: 12px;
          border: 2px solid #F98BA9;
        }

        /* 3D Submit Button */
        .btn-submit-3d {
          background: #7FB9E6; /* OUI Sky */
          box-shadow: 0px 8px 0px #6698cc, 0px 15px 20px rgba(0, 0, 0, 0.15); /* OUI Blue shadow */
          border: 3px solid #aaddff;
          border-radius: 30px;
          padding: 16px 36px;
          color: #FFFFFF !important;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 20px;
          text-align: center;
          display: block;
          width: 100%;
          margin-top: 10px;
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .btn-submit-3d:hover:not(:disabled) {
          filter: brightness(1.05);
        }

        .btn-submit-3d:active:not(:disabled) {
          transform: translateY(8px);
          box-shadow: 0px 0px 0px #6698cc, 0px 5px 10px rgba(0, 0, 0, 0.15);
        }
        
        .btn-submit-3d:disabled {
          background: #cccccc;
          box-shadow: 0px 8px 0px #aaaaaa;
          border-color: #dddddd;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .code-main-card {
            padding: 40px 20px;
          }
          .title {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="code-main-card">
        <div className="header-emoji-circle">🧒</div>
        <h1 className="title">Enter code</h1>
        <p className="subtitle">Ask your parent for the code shown on their screen.</p>

        <form className="code-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Your name (optional)</label>
            <input 
              id="name" 
              type="text" 
              className="styled-input"
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)} 
              placeholder="e.g. Lea" 
            />
          </div>

          <div className="form-group">
            <label htmlFor="code" className="form-label">Code</label>
            <input
              id="code"
              type="text"
              className="styled-input input-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="ENTER HERE"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="btn-submit-3d" type="submit" disabled={busy}>
            {busy ? "Connecting... 🚀" : "Connect"}
          </button>
        </form>
      </div>
    </div>
  );
}