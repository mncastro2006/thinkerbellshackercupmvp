import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="login-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Nunito:wght@700;800;900&display=swap');

        .login-page-wrapper {
          font-family: 'Nunito', 'Poppins', sans-serif;
          background-image: url('/bg.png'); 
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          background-attachment: fixed;
          
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 40px;
          border: 6px solid #FFFFFF;
          box-shadow: 0px 20px 0px rgba(76, 55, 169, 0.08), 0px 30px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 480px;
          padding: 40px 36px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .vizma-icon-circle {
          width: 80px;
          height: 80px;
          background-color: #8c7be8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 10px 20px rgba(140, 123, 232, 0.3);
          margin-bottom: 20px;
        }

        .vizma-icon-circle img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-header h1 {
          font-size: 32px;
          font-weight: 900;
          color: #4c37a9;
          margin: 0 0 8px 0;
        }

        .login-header p {
          font-size: 15px;
          color: #6698cc;
          font-weight: 800;
          margin: 0;
          line-height: 1.4;
        }

        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 900;
          color: #4c37a9;
          margin-left: 4px;
        }

        .form-group input {
          width: 100%;
          background: #f0ecf9;
          border: 2px solid transparent;
          border-radius: 18px;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 700;
          color: #4c37a9;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: 'Nunito', sans-serif;
        }

        .form-group input:focus {
          border-color: #8c7be8;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(140, 123, 232, 0.15);
        }

        .error-text {
          color: #e04f72;
          font-size: 14px;
          font-weight: 800;
          text-align: center;
          margin: 4px 0 0 0;
        }

        .btn-submit {
          width: 100%;
          background-color: #7b66dc;
          color: #FFFFFF;
          border: none;
          padding: 16px;
          border-radius: 25px;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0px 6px 0px #5a48b5;
          margin-top: 10px;
          font-family: 'Nunito', sans-serif;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #8a77ea;
          transform: translateY(-2px);
          box-shadow: 0px 8px 0px #5a48b5;
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0px 2px 0px #5a48b5;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .toggle-mode-container {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          font-weight: 800;
          color: #6698cc;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .btn-toggle {
          background: transparent;
          border: 2px solid #8c7be8;
          color: #4c37a9;
          padding: 8px 20px;
          border-radius: 100px;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Nunito', sans-serif;
        }

        .btn-toggle:hover {
          background-color: #f0ecf9;
          transform: translateY(-1px);
        }

        /* Loading Spinner */
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-card">
        {/* Vizma Mascot Circle */}
        <div className="vizma-icon-circle">
          <img src="/v-icon.png" alt="Vizma Icon" />
        </div>

        <div className="login-header">
          <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p>
            {mode === "login"
              ? "Log in to manage your child's learning modules."
              : "Set up a parent account to start creating story-based lessons."}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                type="text"
                placeholder="Parent Name"
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
              placeholder="parent@example.com"
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
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn-submit" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <div className="toggle-mode-container">
          <span>{mode === "login" ? "New here?" : "Already have an account?"}</span>
          <button
            type="button"
            className="btn-toggle"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}