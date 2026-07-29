import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";

const LEVEL_LABELS = {
  excellent: "Excellent",
  proficient: "Proficient",
  average: "Average",
  developing: "Developing",
  needs_improvement: "Needs improvement",
};

export default function ModuleReport() {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/reports/session/${sessionId}`)
      .then((res) => {
        setReport(res.data.report);
        setSession(res.data.session);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load report"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="report-page-wrapper"><div className="report-card">Loading report...</div></div>;
  if (error) return <div className="report-page-wrapper"><div className="report-card"><p className="feedback-bad">{error}</p></div></div>;
  if (!report) return null;

  return (
    <div className="report-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800;900&family=Nunito:wght@700;800;900&display=swap');

        .report-page-wrapper {
          font-family: 'Nunito', 'Poppins', sans-serif;
          background-image: url('/bg.png'); 
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          background-attachment: fixed;
          
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 60px 20px 40px 20px; 
          box-sizing: border-box;
        }

        .report-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 40px;
          border: 6px solid #FFFFFF;
          box-shadow: 0px 20px 0px rgba(76, 55, 169, 0.08), 0px 30px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 1100px;
          padding: 40px 44px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        /* --- HERO HEADER --- */
        .eval-hero {
          text-align: center;
          margin-bottom: 20px;
        }

        .eval-hero h1 {
          font-size: 34px;
          font-weight: 900;
          color: #4c37a9;
          margin: 0 0 4px 0;
        }

        .eval-hero .helper-text {
          font-size: 15px;
          color: #6698cc;
          font-weight: 800;
          margin: 0 0 16px 0;
        }

        /* Stacked Score Container */
        .eval-score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .eval-score {
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: 52px;
          color: #6698cc;
          line-height: 1;
        }

        .eval-level {
          display: inline-block;
          padding: 6px 20px;
          border-radius: 100px;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 0.5px;
          text-transform: capitalize;
        }

        /* Level Badge Color Variations */
        .eval-level--excellent, .eval-level--proficient {
          background: #fdfef7;
          color: #8fa338;
          border: 2px solid #c3d668;
        }

        .eval-level--average, .eval-level--developing {
          background: #fff0f4;
          color: #d1587a;
          border: 2px solid #fac2d1;
        }

        .eval-level--needs_improvement {
          background: #fff4ec;
          color: #d16e38;
          border: 2px solid #f2ab80;
        }

        /* --- SUMMARY TEXT --- */
        .report-summary-text {
          text-align: center;
          font-size: 15px;
          line-height: 1.6;
          color: #4c37a9;
          font-weight: 700;
          margin: 0 auto 28px auto;
          max-width: 850px;
        }

        /* --- HORIZONTAL 3-COLUMN GRID --- */
        .report-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .report-column {
          background: #fdfcfd;
          border-radius: 28px;
          padding: 24px 20px;
          border: 3px solid #f0ecf9;
          display: flex;
          flex-direction: column;
        }

        .report-column h3 {
          font-size: 17px;
          font-weight: 900;
          color: #4c37a9;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .report-item-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .report-item-card {
          background: #f5f2fa;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 14px;
          line-height: 1.55;
          color: #4c37a9;
          font-weight: 700;
        }

        /* --- DASHBOARD BUTTON --- */
        .btn-dashboard {
          display: inline-block;
          align-self: center;
          min-width: 280px;
          text-align: center;
          background-color: #4c37a9;
          color: #FFFFFF !important;
          padding: 16px 32px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 900;
          font-size: 16px;
          transition: all 0.2s ease;
          box-shadow: 0px 8px 0px #3c2a8c, 0px 15px 20px rgba(0, 0, 0, 0.15);
          box-sizing: border-box;
        }

        .btn-dashboard:hover {
          background-color: #5c45be;
          box-shadow: 0px 8px 0px #453299, 0px 15px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .btn-dashboard:active {
          transform: translateY(6px);
          box-shadow: 0px 0px 0px transparent;
        }

        .feedback-bad {
          color: #F98BA9;
          font-weight: 800;
          text-align: center;
        }

        /* Mobile / Tablet Responsive Fallback */
        @media (max-width: 900px) {
          .report-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .report-card {
            padding: 28px 20px;
          }
          .btn-dashboard {
            width: 100%;
          }
        }
      `}</style>

      <div className="report-card">
        {/* HERO AREA */}
        <div className="eval-hero">
          <h1>{session?.module?.title}</h1>
          <p className="helper-text">Feedback report for {session?.studentName || "your learner"}</p>
          
          <div className="eval-score-container">
            <div className="eval-score">{report.overallScore}%</div>
            <span className={`eval-level eval-level--${report.performanceLevel}`}>
              {LEVEL_LABELS[report.performanceLevel] || report.performanceLevel}
            </span>
          </div>
        </div>

        <p className="report-summary-text">{report.summary}</p>

        {/* HORIZONTAL 3-COLUMN GRID */}
        <div className="report-grid">
          {/* Column 1: Strengths */}
          <div className="report-column">
            <h3>💪 Strengths</h3>
            <div className="report-item-list">
              {report.strengths && report.strengths.length > 0 ? (
                report.strengths.map((s, i) => (
                  <div key={i} className="report-item-card">
                    {s}
                  </div>
                ))
              ) : (
                <p className="helper-text" style={{ fontSize: "14px", margin: 0 }}>
                  No specific strengths noted.
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Areas that need improvement */}
          <div className="report-column">
            <h3>🎯 Areas for Improvement</h3>
            <div className="report-item-list">
              {report.weaknesses && report.weaknesses.length > 0 ? (
                report.weaknesses.map((w, i) => (
                  <div key={i} className="report-item-card">
                    {w}
                  </div>
                ))
              ) : (
                <p className="helper-text" style={{ fontSize: "14px", margin: 0 }}>
                  No specific areas noted.
                </p>
              )}
            </div>
          </div>

          {/* Column 3: Recommended next steps */}
          <div className="report-column">
            <h3>📚 Recommended Steps</h3>
            <div className="report-item-list">
              {report.recommendations && report.recommendations.length > 0 ? (
                report.recommendations.map((r, i) => (
                  <div key={i} className="report-item-card">
                    {r}
                  </div>
                ))
              ) : (
                <p className="helper-text" style={{ fontSize: "14px", margin: 0 }}>
                  No recommendations noted.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <Link to="/parent" className="btn-dashboard">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}