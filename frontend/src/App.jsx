import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RoleSelect from "./pages/RoleSelect";

import ParentDashboard from "./pages/parent/ParentDashboard";
import UploadMaterial from "./pages/parent/UploadMaterial";
import GeneratedCode from "./pages/parent/GeneratedCode";
import ModuleReport from "./pages/parent/ModuleReport";

import EnterCode from "./pages/student/EnterCode";
import StoryQuiz from "./pages/student/StoryQuiz";
import Evaluation from "./pages/student/Evaluation";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page center-col">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/role" element={<RoleSelect />} />

        <Route
          path="/parent"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/upload"
          element={
            <ProtectedRoute>
              <UploadMaterial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/session/:sessionId/code"
          element={
            <ProtectedRoute>
              <GeneratedCode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/session/:sessionId/report"
          element={
            <ProtectedRoute>
              <ModuleReport />
            </ProtectedRoute>
          }
        />

        <Route path="/student" element={<EnterCode />} />
        <Route path="/student/play" element={<StoryQuiz />} />
        <Route path="/student/evaluation" element={<Evaluation />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
