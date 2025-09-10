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

  const { login, loading } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      const result = await login(formData);

      if (result.success) {
        toast.success(`Willkommen zurück, ${result.user.firstName}!`);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      const errorMsg = "Ein unerwarteter Fehler ist aufgetreten";
      setError(errorMsg);
      toast.error(errorMsg);
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
                disabled={loading}
                required
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
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
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
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? (
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
        </div>
      </div>
    </div>
  );
};
