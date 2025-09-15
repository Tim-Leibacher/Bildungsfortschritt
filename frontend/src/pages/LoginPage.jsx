import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  EyeIcon,
  EyeOffIcon,
  LogInIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { useAuth } from "../components/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(), // Entferne Leerzeichen
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Verbesserte Validierung mit Trimming
    const trimmedEmail = formData.email?.trim();
    const trimmedPassword = formData.password?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Bitte füllen Sie alle Felder aus");
      return;
    }

    // E-Mail Format-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein");
      return;
    }

    setIsLoading(true);

    try {
      // Sende getrimmte Daten
      const result = await login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (result.success) {
        toast.success(
          `Willkommen zurück, ${result.user.firstName || "Benutzer"}!`
        );
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      const errorMsg = "Verbindungsfehler. Bitte versuchen Sie es erneut.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary font-mono mb-2">
              Bildungsfortschritt
            </h1>
            <p className="text-base-content/70">
              Melden Sie sich an, um fortzufahren
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">E-Mail-Adresse</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="ihre.email@beispiel.com"
                className={`input input-bordered w-full ${
                  error && !formData.email ? "input-error" : ""
                }`}
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Passwort</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Ihr Passwort"
                  className={`input input-bordered w-full pr-12 ${
                    error && !formData.password ? "input-error" : ""
                  }`}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={
                    showPassword ? "Passwort verbergen" : "Passwort anzeigen"
                  }
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading || !formData.email || !formData.password}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Anmelden...
                </>
              ) : (
                <>
                  <LogInIcon className="h-4 w-4" />
                  Anmelden
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-base-content/70">
            <p>
              Bei Problemen wenden Sie sich an Ihren
              <br />
              Systemadministrator.
            </p>
          </div>

          {/* Debug Info (nur in Development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-base-200 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Test-Credentials:</h4>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Berufsbildner:</strong> bb@example.com / password123
                </p>
                <p>
                  <strong>Student:</strong> student@example.com / password123
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
