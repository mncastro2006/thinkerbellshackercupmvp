import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="icon-circle icon-circle--small">🔔</span>
        ThinkerBells
      </Link>
      <nav className="navbar__links">
        {user ? (
          <>
            <Link to="/parent">Dashboard</Link>
            <button
              className="btn btn--ghost"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/role" className="btn btn--small">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
