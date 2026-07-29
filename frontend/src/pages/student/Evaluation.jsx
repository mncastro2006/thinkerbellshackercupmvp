import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function Evaluation() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const s = sessionStorage.getItem("tb_session");
    if (!s) {
      navigate("/student");
      return;
    }
    const { id } = JSON.parse(s);
    api
      .get(`/reports/session/${id}/summary`)
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load your results"));
  }, [navigate]);

  if (error) return <div className="page center-col"><p className="error-text">{error}</p></div>;
  if (!summary) return <div className="page center-col">Calculating your results...</div>;

  // Calculate percentage score
  const percentage = summary.totalQuestions
    ? Math.round((summary.score / summary.totalQuestions) * 100)
    : 0;

  return (
    <div className="eval-wrapper">
      <style>{`
        .eval-wrapper {
          width: 100%;
          max-width: 600px;
          margin: 60px auto 40px auto;
          padding: 24px;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .eval-card {
          background: #ffffff;
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .eval-title {
          font-size: 2rem;
          font-weight: 800;
          color: #4f46e5; /* Distinct deep purple title */
          margin: 0 0 16px 0;
        }

        .eval-percentage {
          font-size: 5rem;
          font-weight: 900;
          color: #5b9bd5; /* Bold blue percentage */
          margin: 0 0 16px 0;
          line-height: 1;
        }

        .eval-message {
          font-size: 1.8rem;
          font-weight: 800;
          color: #22c55e; /* Encouraging vibrant green */
          margin: 0;
        }

        @media (max-width: 640px) {
          .eval-wrapper {
            margin-top: 80px;
            padding: 16px;
          }
          .eval-card {
            padding: 32px 20px;
          }
          .eval-title {
            font-size: 1.6rem;
          }
          .eval-percentage {
            font-size: 4rem;
          }
          .eval-message {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="eval-card">
        {/* Module Title */}
        <h1 className="eval-title">{summary.moduleTitle}</h1>

        {/* Score Percentage */}
        <div className="eval-percentage">{percentage}%</div>

        {/* Good Job Encouragement Message */}
        <div className="eval-message">🎉 Good Job!</div>
      </div>
    </div>
  );
}