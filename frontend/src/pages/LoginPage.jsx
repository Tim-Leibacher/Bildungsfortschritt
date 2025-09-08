import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeOffIcon, LogInIcon } from "lucide-react";
import { useAuth } from "../components/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        toast.success(`Willkommen zurück, ${result.user.firstName}!`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
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
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleInputChange}
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
                  className="input input-bordered w-full pr-12"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  isLoading ? "loading" : ""
                }`}
                disabled={isLoading}
              >
                {!isLoading && <LogInIcon className="size-5" />}
                {isLoading ? "Anmeldung läuft..." : "Anmelden"}
              </button>
            </div>
          </form>

          {/* Demo Accounts Info */}
          <div className="divider">Demo-Accounts</div>
          <div className="text-sm text-base-content/70 space-y-2">
            <div className="card bg-base-200 p-3">
              <div className="font-medium">Berufsbildner:</div>
              <div>Email: bb@example.com</div>
              <div>Passwort: password123</div>
            </div>
            <div className="card bg-base-200 p-3">
              <div className="font-medium">Lernender:</div>
              <div>Email: lernender@example.com</div>
              <div>Passwort: password123</div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-base-content/60">
              Noch kein Account?{" "}
              <a href="/register" className="link link-primary">
                Registrieren
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
