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
  const [deleting, setDeleting] = useState(null);
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

  async function handleDeleteModule(e, moduleId, title) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete “${title}” and all of its sessions? This cannot be undone.`)) return;
    setDeleting(`module-${moduleId}`);
    setError("");
    try {
      await api.delete(`/modules/${moduleId}`);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      setSessions((prev) => prev.filter((s) => s.moduleId !== moduleId && s.module?.id !== moduleId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete module");
    } finally {
      setDeleting(null);
    }
  }

  async function handleDeleteSession(e, sessionId, label) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete session “${label}”? This cannot be undone.`)) return;
    setDeleting(`session-${sessionId}`);
    setError("");
    try {
      await api.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete session");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="page page--wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p className="helper-text">Upload a lesson, generate a connection code, and review your child&apos;s progress.</p>
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
              <button
                type="button"
                className="module-card__delete"
                aria-label={`Delete ${m.title}`}
                onClick={(e) => handleDeleteModule(e, m.id, m.title)}
                disabled={deleting === `module-${m.id}`}
              >
                {deleting === `module-${m.id}` ? <span className="spinner" /> : "×"}
              </button>
              <h4>{m.title}</h4>
              <span>{m.topic || (m.status === "processing" ? "Generating stories..." : m.status)}</span>
              {m.status === "ready" && (
                <div className="module-card__actions">
                  <button
                    className="btn btn--small"
                    onClick={() => handleGenerateCode(m.id)}
                    disabled={creatingFor === m.id || deleting === `module-${m.id}`}
                  >
                    {creatingFor === m.id ? <span className="spinner" /> : "Generate code"}
                  </button>
                </div>
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
            <div key={s.id} className={`module-card ${GRADIENTS[(i + 1) % GRADIENTS.length]}`}>
              <button
                type="button"
                className="module-card__delete"
                aria-label={`Delete session ${s.code}`}
                onClick={(e) => handleDeleteSession(e, s.id, s.module?.title || s.code)}
                disabled={deleting === `session-${s.id}`}
              >
                {deleting === `session-${s.id}` ? <span className="spinner" /> : "×"}
              </button>
              <Link
                to={s.status === "completed" ? `/parent/session/${s.id}/report` : `/parent/session/${s.id}/code`}
                className="module-card__link"
              >
                <h4>{s.module?.title || "Session"}</h4>
                <span>Code {s.code} · {s.status}</span>
              </Link>
              <div className="module-card__actions">
                <Link
                  to={s.status === "completed" ? `/parent/session/${s.id}/report` : `/parent/session/${s.id}/code`}
                  className="btn btn--small"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
