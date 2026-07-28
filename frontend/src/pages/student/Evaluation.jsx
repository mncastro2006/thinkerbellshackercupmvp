import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const LEVEL_LABELS = {
  excellent: "Excellent",
  proficient: "Proficient",
  average: "Average",
  developing: "Developing",
  needs_improvement: "Needs improvement",
};

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

  function handleDone() {
    sessionStorage.removeItem("tb_session");
    sessionStorage.removeItem("tb_module");
    navigate("/");
  }

  if (error) return <div className="page center-col"><p className="error-text">{error}</p></div>;
  if (!summary) return <div className="page center-col">Calculating your results...</div>;

  return (
    <div className="page page--narrow">
      <div className="card eval-hero">
        <h1>{summary.moduleTitle}</h1>
        <div className="eval-score">{summary.score}/{summary.totalQuestions}</div>
        <span className={`eval-level eval-level--${summary.performanceLevel}`}>
          {LEVEL_LABELS[summary.performanceLevel]}
        </span>

        <div className="report-section" style={{ textAlign: "left" }}>
          <h3>Description</h3>
          <p>{summary.summary}</p>
        </div>

        <button className="btn btn--block" style={{ marginTop: 20 }} onClick={handleDone}>
          Back
        </button>
      </div>
    </div>
  );
}
