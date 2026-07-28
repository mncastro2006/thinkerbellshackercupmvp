import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import IconCircle from "../components/IconCircle";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate("/role");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="center-col" style={{ marginBottom: 20 }}>
        <IconCircle emoji="🔔" />
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="helper-text">
          {mode === "login"
            ? "Log in to manage your child's learning modules."
            : "Set up a parent account to start creating story-based lessons."}
        </p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div className="form-group">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn--block" type="submit" disabled={busy}>
          {busy ? <span className="spinner" /> : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="center-col" style={{ marginTop: 16 }}>
        {mode === "login" ? (
          <>
            New here?{" "}
            <button className="btn btn--ghost btn--small" onClick={() => setMode("register")}>
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button className="btn btn--ghost btn--small" onClick={() => setMode("login")}>
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
