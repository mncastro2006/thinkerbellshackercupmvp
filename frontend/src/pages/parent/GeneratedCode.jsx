import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function GeneratedCode() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  async function poll() {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      setSession(res.data.session);
      if (res.data.session.status === "completed") {
        navigate(`/parent/session/${sessionId}/report`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load session");
    }
  }

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="page page--narrow">
      <div className="center-col">
        <h1>This is your code</h1>
        <p className="helper-text">
          Enter this code on your child's device to connect it to <strong>{session?.module?.title}</strong>.
        </p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {session && (
        <>
          <div className="code-display">{session.code}</div>
          <div className="center-col">
            <span className="tag">
              {session.status === "waiting" && "Waiting for the student to connect..."}
              {session.status === "active" && "Connected! The student is playing now."}
              {session.status === "completed" && "Session complete — redirecting to report..."}
            </span>
            <p className="helper-text">Code expires in about an hour if unused.</p>
          </div>
        </>
      )}

      {!session && !error && <p className="helper-text">Loading your code...</p>}
    </div>
  );
}
