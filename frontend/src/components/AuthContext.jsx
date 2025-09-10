import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored token and validate it on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user || response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        // Token is invalid, remove it
        localStorage.removeItem("accessToken");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true); // Zeige Loading während Login

      const response = await authAPI.login(credentials);
      const { user: userData, accessToken } = response.data;

      // Store token
      localStorage.setItem("accessToken", accessToken);

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);

      // Spezifische Fehlermeldungen für verschiedene Szenarien
      let errorMessage = "Ein Fehler ist beim Anmelden aufgetreten";

      if (error.response?.status === 401) {
        errorMessage = "Ungültige E-Mail-Adresse oder Passwort";
      } else if (error.response?.status === 429) {
        errorMessage =
          "Zu viele Login-Versuche. Bitte warten Sie einen Moment.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await authAPI.register(userData);
      const { user: newUser, accessToken } = response.data;

      // Store token
      localStorage.setItem("accessToken", accessToken);

      // Update state
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      console.error("Registration error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ein Fehler ist bei der Registrierung aufgetreten";

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Call logout endpoint to invalidate refresh token
      await authAPI.logout();
    } catch (error) {
      // Even if logout fails on server, we still want to clear local state
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem("accessToken");
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
    }));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
