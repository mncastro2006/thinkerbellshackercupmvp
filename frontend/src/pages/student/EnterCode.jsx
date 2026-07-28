import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import IconCircle from "../../components/IconCircle";

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
    <div className="page page--narrow">
      <div className="center-col" style={{ marginBottom: 10 }}>
        <IconCircle emoji="🧒" />
        <h1>Enter code</h1>
        <p className="helper-text">Ask your parent for the code shown on their screen.</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Your name (optional)</label>
          <input id="name" type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Lea" />
        </div>
        <div className="form-group">
          <label htmlFor="code">Code</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            style={{ textAlign: "center", fontSize: "1.6rem", letterSpacing: "0.3em", fontWeight: 700 }}
            maxLength={8}
            required
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn--block" type="submit" disabled={busy}>
          {busy ? <span className="spinner" /> : "Connect"}
        </button>
      </form>
    </div>
  );
}
