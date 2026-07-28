import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function chooseParent() {
    navigate(user ? "/parent" : "/login");
  }

  function chooseStudent() {
    navigate("/student");
  }

  return (
    <div className="page page--narrow">
      <div className="center-col" style={{ marginBottom: 10 }}>
        <h1>Who's using ThinkerBells?</h1>
        <p className="helper-text">Choose your role to continue.</p>
      </div>

      <div className="role-grid">
        <div className="role-card" onClick={chooseStudent}>
          <div className="role-card__emoji">🧒</div>
          <h3>Student</h3>
          <p className="helper-text">I have a code from my parent and I'm ready to learn.</p>
        </div>
        <div className="role-card" onClick={chooseParent}>
          <div className="role-card__emoji">🧑‍🏫</div>
          <h3>Parent</h3>
          <p className="helper-text">I want to upload a lesson and create a code for my child.</p>
        </div>
      </div>
    </div>
  );
}
