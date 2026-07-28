import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import IconCircle from "../../components/IconCircle";

const GRADIENTS = ["grad-1", "grad-2", "grad-3", "grad-4"];

export default function Profile() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/reports/history")
      .then((res) => setHistory(res.data.history))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page page--wide">
      <div className="center-col" style={{ marginBottom: 24 }}>
        <IconCircle emoji="👤" />
        <h1>{user?.name}</h1>
        <p className="helper-text">{user?.email}</p>
      </div>

      <h2>History / Records of modules</h2>
      {loading && <p className="helper-text">Loading history...</p>}
      {!loading && history.length === 0 && (
        <p className="helper-text">No completed sessions yet. Once your child finishes a module, it'll show up here.</p>
      )}

      <div className="module-grid">
        {history.map((s, i) => (
          <Link key={s.id} to={`/parent/session/${s.id}/report`} className={`module-card ${GRADIENTS[i % GRADIENTS.length]}`}>
            <span className="module-card__badge">📗</span>
            <h4>{s.module?.title}</h4>
            <span>
              {s.report ? `Score: ${s.report.overallScore}%` : "Report pending"} · {new Date(s.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
