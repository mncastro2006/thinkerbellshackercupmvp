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

const MODALITY_ICON = {
  Visual: "👀",
  Kinesthetic: "🤸",
  Tactile: "✋",
  Auditory: "👂",
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

  if (loading) return <div className="page center-col">Loading report...</div>;
  if (error) return <div className="page center-col"><p className="error-text">{error}</p></div>;
  if (!report) return null;

  return (
    <div className="page page--narrow">
      <div className="card">
        <div className="eval-hero">
          <h1>{session?.module?.title}</h1>
          <p className="helper-text">Feedback report for {session?.studentName || "your learner"}</p>
          <div className="eval-score">{report.overallScore}%</div>
          <span className={`eval-level eval-level--${report.performanceLevel}`}>
            {LEVEL_LABELS[report.performanceLevel]}
          </span>
        </div>

        <p style={{ textAlign: "center" }}>{report.summary}</p>

        {report.competencyBreakdown?.length > 0 && (
          <div className="report-section">
            <h3>📊 Module Breakdown</h3>
            <ul className="report-list">
              {report.competencyBreakdown.map((c) => (
                <li key={c.tag}>
                  <strong>{c.label}</strong>: {c.accuracy}% accuracy ({c.correct}/{c.total}) — {c.masteryLevel}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="report-section">
          <h3>💪 Wins and Strengths</h3>
          <ul className="report-list">
            {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        {report.keyInsight && (
          <div className="report-section">
            <h3>🔍 Key Insight and Observed Strategy</h3>
            <ul className="report-list">
              {report.keyInsight.currentStrategy && <li>{report.keyInsight.currentStrategy}</li>}
              {report.keyInsight.errorPattern && <li>{report.keyInsight.errorPattern}</li>}
            </ul>
          </div>
        )}

        {report.nextMilestone && (
          <div className="report-section">
            <h3>🎯 Next Growth Milestone</h3>
            <p>{report.nextMilestone}</p>
          </div>
        )}

        {report.multiSensoryActivities?.length > 0 && (
          <div className="report-section">
            <h3>🖐️ Multi-Sensory Home Practice Activities</h3>
            <ul className="report-list">
              {report.multiSensoryActivities.map((act, i) => (
                <li key={i}>
                  <strong>{MODALITY_ICON[act.modality] || ""} {act.modality} — {act.title}:</strong> {act.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/parent" className="btn btn--block" style={{ marginTop: 24 }}>Back to dashboard</Link>
      </div>
    </div>
  );
}
