import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const GRADIENTS = ["grad-1", "grad-2", "grad-3", "grad-4"];

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingFor, setCreatingFor] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [modRes, sesRes] = await Promise.all([api.get("/modules"), api.get("/sessions")]);
      setModules(modRes.data.modules);
      setSessions(sesRes.data.sessions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleGenerateCode(moduleId) {
    setCreatingFor(moduleId);
    setError("");
    try {
      const res = await api.post("/sessions", { moduleId });
      navigate(`/parent/session/${res.data.session.id}/code`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate a code for this module");
    } finally {
      setCreatingFor(null);
    }
  }

  return (
    <div className="page page--wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Welcome, {user?.name} 👋</h1>
          <p className="helper-text">Upload a lesson, generate a connection code, and review your child's progress.</p>
        </div>
        <Link to="/parent/upload" className="btn">+ Upload new lesson</Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="helper-text">Loading...</p>}

      <section style={{ marginTop: 32 }}>
        <h2>Your lesson modules</h2>
        {!loading && modules.length === 0 && (
          <p className="helper-text">No modules yet. Upload a PDF lesson to generate your first stories.</p>
        )}
        <div className="module-grid">
          {modules.map((m, i) => (
            <div key={m.id} className={`module-card ${GRADIENTS[i % GRADIENTS.length]}`}>
              <span className="module-card__badge">📘</span>
              <h4>{m.title}</h4>
              <span>{m.topic || (m.status === "processing" ? "Generating stories..." : m.status)}</span>
              {m.status === "ready" && (
                <button
                  className="btn btn--small"
                  style={{ marginTop: 12 }}
                  onClick={() => handleGenerateCode(m.id)}
                  disabled={creatingFor === m.id}
                >
                  {creatingFor === m.id ? <span className="spinner" /> : "Generate code"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Recent sessions</h2>
        {!loading && sessions.length === 0 && <p className="helper-text">No sessions yet.</p>}
        <div className="module-grid">
          {sessions.map((s, i) => (
            <Link
              key={s.id}
              to={s.status === "completed" ? `/parent/session/${s.id}/report` : `/parent/session/${s.id}/code`}
              className={`module-card ${GRADIENTS[(i + 1) % GRADIENTS.length]}`}
            >
              <span className="module-card__badge">{s.status === "completed" ? "✅" : "⏳"}</span>
              <h4>{s.module?.title}</h4>
              <span>Code {s.code} · {s.status}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
