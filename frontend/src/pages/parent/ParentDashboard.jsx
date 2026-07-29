import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const GRADIENT_PALETTES = [
  "linear-gradient(135deg, #7b66dc 0%, #9485e6 100%)",
  "linear-gradient(135deg, #8a77ea 0%, #a293f0 100%)",
  "linear-gradient(135deg, #5da898 0%, #76c7b5 100%)",
  "linear-gradient(135deg, #e38368 0%, #f19f88 100%)",
];

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
    <div className="parent-dashboard-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Nunito:wght@700;800;900&display=swap');

        .parent-dashboard-wrapper {
          font-family: 'Nunito', 'Poppins', sans-serif;
          background-image: url('/bg.png');
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          background-attachment: fixed;
          min-height: 100vh;
          width: 100%;
          /* Clears top menu bar completely */
          padding: 100px 60px 60px 60px;
          box-sizing: border-box;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 36px;
        }

        .dashboard-title-group {
          max-width: 650px;
        }

        .dashboard-title-group h1 {
          font-size: 36px;
          font-weight: 900;
          color: #4c37a9;
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .dashboard-title-group p {
          font-size: 15px;
          color: #537bb0;
          font-weight: 800;
          margin: 0;
        }

        .btn-upload {
          background-color: #7b66dc;
          color: #FFFFFF;
          padding: 14px 24px;
          border-radius: 20px;
          font-weight: 900;
          font-size: 15px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0px 5px 0px #5a48b5;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-upload:hover {
          background-color: #8a77ea;
          transform: translateY(-2px);
          box-shadow: 0px 7px 0px #5a48b5;
        }

        .section-title {
          font-size: 22px;
          font-weight: 900;
          color: #4c37a9;
          margin: 0 0 18px 0;
        }

        .helper-info {
          font-size: 15px;
          color: #537bb0;
          font-weight: 800;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 22px;
        }

        /* --- CARD STYLING --- */
        .vizma-card {
          position: relative;
          border-radius: 28px;
          padding: 24px 20px;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
          box-shadow: 0px 10px 20px rgba(76, 55, 169, 0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .vizma-card:hover {
          transform: translateY(-4px);
          box-shadow: 0px 14px 25px rgba(76, 55, 169, 0.22);
        }

        .btn-delete-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.2);
          border: none;
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .btn-delete-badge:hover {
          background: rgba(224, 79, 114, 0.85);
        }

        .card-content h4 {
          font-size: 18px;
          font-weight: 900;
          margin: 0 0 8px 0;
          padding-right: 28px;
          line-height: 1.3;
        }

        .card-content p {
          font-size: 13px;
          font-weight: 800;
          opacity: 0.9;
          margin: 0;
        }

        .card-action-bar {
          margin-top: 20px;
        }

        .btn-card-action {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(4px);
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          color: #FFFFFF;
          padding: 8px 18px;
          border-radius: 14px;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s ease;
          font-family: 'Nunito', sans-serif;
        }

        .btn-card-action:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.03);
        }

        .error-banner {
          background: #fde8ec;
          border: 2px solid #e04f72;
          color: #e04f72;
          padding: 12px 20px;
          border-radius: 16px;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .parent-dashboard-wrapper {
            padding: 90px 20px 40px 20px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        {/* Top Header Row with padding pushing down below Navbar */}
        <div className="dashboard-top">
          <div className="dashboard-title-group">
            <h1>Welcome, {user?.name}</h1>
            <p>Upload a lesson, generate a connection code, and review your child's progress.</p>
          </div>
          <Link to="/parent/upload" className="btn-upload">
            + Upload New Lesson
          </Link>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <p className="helper-info">Loading modules and sessions...</p>}

        {/* Modules Section */}
        <section style={{ marginBottom: 44 }}>
          <h2 className="section-title">Your Lesson Modules</h2>
          {!loading && modules.length === 0 && (
            <p className="helper-info">
              No modules yet. Upload a PDF lesson to generate your first stories.
            </p>
          )}

          <div className="cards-grid">
            {modules.map((m, i) => (
              <div
                key={m.id}
                className="vizma-card"
                style={{ background: GRADIENT_PALETTES[i % GRADIENT_PALETTES.length] }}
              >
                <button
                  type="button"
                  className="btn-delete-badge"
                  aria-label={`Delete ${m.title}`}
                  onClick={(e) => handleDeleteModule(e, m.id, m.title)}
                  disabled={deleting === `module-${m.id}`}
                >
                  {deleting === `module-${m.id}` ? <span className="spinner" /> : "×"}
                </button>

                <div className="card-content">
                  <h4>{m.title}</h4>
                  <p>{m.topic || (m.status === "processing" ? "Generating stories..." : m.status)}</p>
                </div>

                {m.status === "ready" && (
                  <div className="card-action-bar">
                    <button
                      className="btn-card-action"
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

        {/* Recent Sessions Section */}
        <section>
          <h2 className="section-title">Recent sessions</h2>
          {!loading && sessions.length === 0 && (
            <p className="helper-info">No sessions recorded yet.</p>
          )}

          <div className="cards-grid">
            {sessions.map((s, i) => (
              <div
                key={s.id}
                className="vizma-card"
                style={{
                  background: GRADIENT_PALETTES[(i + 1) % GRADIENT_PALETTES.length],
                }}
              >
                <button
                  type="button"
                  className="btn-delete-badge"
                  aria-label={`Delete session ${s.code}`}
                  onClick={(e) => handleDeleteSession(e, s.id, s.module?.title || s.code)}
                  disabled={deleting === `session-${s.id}`}
                >
                  {deleting === `session-${s.id}` ? <span className="spinner" /> : "×"}
                </button>

                <div className="card-content">
                  <h4>{s.module?.title || "Session"}</h4>
                  <p>Code {s.code} • {s.status}</p>
                </div>

                <div className="card-action-bar">
                  <Link
                    to={
                      s.status === "completed"
                        ? `/parent/session/${s.id}/report`
                        : `/parent/session/${s.id}/code`
                    }
                    className="btn-card-action"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}