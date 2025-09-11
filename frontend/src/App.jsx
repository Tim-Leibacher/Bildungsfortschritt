import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext.jsx";

// Nur relevante Pages für Bildungsfortschritt
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ModulesPage from "./pages/ModulesPage.jsx";
import StudentDetailPage from "./pages/StudentDetailPage.jsx";
import CompetencyOverviewPage from "./pages/CompetencyOverviewPage.jsx";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <div className="mt-4 text-base-content">Lade Anwendung...</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <div className="mt-4 text-base-content">Lade Anwendung...</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  const { user, logout } = useAuth();

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <Routes>
        {/* Authentication Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        {/* Protected Bildungsfortschritt Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules"
          element={
            <ProtectedRoute>
              <ModulesPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/:studentId"
          element={
            <ProtectedRoute>
              <StudentDetailPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        // In Ihrem bestehenden App.jsx, fügen Sie diese Route hinzu:
        <Route
          path="/competency-overview"
          element={
            <ProtectedRoute>
              <CompetencyOverviewPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        {/* Root route */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                <p className="text-base-content/70 mb-4">
                  Seite nicht gefunden
                </p>
                <a href="/dashboard" className="btn btn-primary">
                  Zurück zum Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
