import React from "react";

export default function ProgressBar({ value, max, label }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  
  return (
    <div className="vizma-progress-container" aria-label={label || "progress"}>
      <style>{`
        .vizma-progress-container {
          width: 100%;
          max-width: 800px; /* Elongated to span much wider */
          margin: 0 auto;
          text-align: center;
          font-family: 'Nunito', 'Poppins', sans-serif;
        }
        .vizma-progress-track {
          position: relative;
          height: 24px;
          background: #FFFFFF;
          border: 3px solid #D6BEEA; /* OUI Lavender */
          border-radius: 20px;
          box-shadow: inset 0px 3px 0px rgba(0,0,0,0.05);
          margin-bottom: 12px;
          width: 100%;
        }
        .vizma-progress-fill {
          height: 100%;
          background: #B7C96A; /* OUI Matcha */
          border-radius: 16px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0px -4px 0px rgba(0,0,0,0.15);
        }
        .vizma-progress-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 32px;
          transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.2));
          z-index: 2;
        }
        .vizma-progress-label {
          font-size: 16px;
          font-weight: 800;
          color: #6698cc; /* OUI Blue */
        }
      `}</style>
      
      <div className="vizma-progress-track">
        <div className="vizma-progress-fill" style={{ width: `${pct}%` }} />
        <span className="vizma-progress-marker" style={{ left: `${pct}%` }}>🍎</span>
      </div>
      {label && <div className="vizma-progress-label">{label}</div>}
    </div>
  );
}