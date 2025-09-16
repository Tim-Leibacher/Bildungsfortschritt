import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authAPI } from "../lib/api";

// ========================================
// KONFIGURATION
// ========================================

const AUTH_CONFIG = {
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 254,
  },

  SECURITY: {
    MAX_FAILED_ATTEMPTS: 3,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 Minuten
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 Minuten
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 Stunde
  },

  MESSAGES: {
    VALIDATION_ERROR: "E-Mail und Passwort sind erforderlich",
    INVALID_EMAIL: "Ungültige E-Mail-Adresse",
    INVALID_CREDENTIALS: "Ungültige E-Mail-Adresse oder Passwort",
    ACCOUNT_LOCKED:
      "Account temporär gesperrt. Versuchen Sie es in {minutes} Minuten erneut.",
    SERVER_ERROR: "Server-Fehler. Bitte versuchen Sie es später erneut.",
    NETWORK_ERROR:
      "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.",
    GENERAL_ERROR: "Ein Fehler ist beim Anmelden aufgetreten",
    EMAIL_EXISTS: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
    WEAK_PASSWORD: "Passwort muss mindestens 6 Zeichen enthalten",
    REGISTRATION_ERROR: "Ein Fehler ist bei der Registrierung aufgetreten",
    TOKEN_VALIDATION_FAILED: "Token-Validierung fehlgeschlagen",
    NO_USER_DATA: "Keine Benutzerdaten empfangen",
  },
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return (
    AUTH_CONFIG.VALIDATION.EMAIL_REGEX.test(email) &&
    email.length <= AUTH_CONFIG.VALIDATION.EMAIL_MAX_LENGTH
  );
};

const validatePassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return (
    password.length >= AUTH_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH &&
    password.length <= AUTH_CONFIG.VALIDATION.PASSWORD_MAX_LENGTH
  );
};

const sanitizeUserData = (userData) => {
  if (!userData || typeof userData !== "object") return userData;

  const sanitized = {};
  for (const [key, value] of Object.entries(userData)) {
    if (typeof value === "string") {
      sanitized[key] = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const formatMessage = (message, params = {}) => {
  let formatted = message;
  Object.entries(params).forEach(([key, value]) => {
    formatted = formatted.replace(`{${key}}`, value);
  });
  return formatted;
};

// ========================================
// SECURITY STATE MANAGEMENT
// ========================================

class SecurityManager {
  constructor() {
    this.attempts = new Map();
    this.lockedAccounts = new Map();
  }

  isAllowed(email) {
    const now = Date.now();

    // Prüfe ob Account gesperrt ist
    const lockInfo = this.lockedAccounts.get(email);
    if (lockInfo && now < lockInfo.lockUntil) {
      return false;
    }

    // Entferne abgelaufene Sperre
    if (lockInfo && now >= lockInfo.lockUntil) {
      this.lockedAccounts.delete(email);
      this.attempts.delete(email);
    }

    return true;
  }

  recordFailedAttempt(email) {
    const now = Date.now();
    const userAttempts = this.attempts.get(email) || [];

    // Entferne alte Versuche außerhalb des Zeitfensters
    const validAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < AUTH_CONFIG.SECURITY.RATE_LIMIT_WINDOW
    );

    validAttempts.push(now);
    this.attempts.set(email, validAttempts);

    // Sperre Account nach zu vielen Versuchen
    if (validAttempts.length >= AUTH_CONFIG.SECURITY.MAX_FAILED_ATTEMPTS) {
      this.lockedAccounts.set(email, {
        lockUntil: now + AUTH_CONFIG.SECURITY.LOCKOUT_DURATION,
        attempts: validAttempts.length,
      });
    }

    return validAttempts.length;
  }

  getRemainingLockTime(email) {
    const lockInfo = this.lockedAccounts.get(email);
    if (!lockInfo) return 0;

    const remainingTime = lockInfo.lockUntil - Date.now();
    return Math.max(0, Math.ceil(remainingTime / 1000 / 60)); // in Minuten
  }

  clearFailedAttempts(email) {
    this.attempts.delete(email);
    this.lockedAccounts.delete(email);
  }
}

// ========================================
// CONTEXT SETUP
// ========================================

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ========================================
// AUTH PROVIDER COMPONENT
// ========================================

export const AuthProvider = ({ children }) => {
  // State Management
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Security Manager Instance
  const securityManager = useMemo(() => new SecurityManager(), []);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  const resetAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const setAuthenticatedState = useCallback((userData) => {
    const sanitizedUser = sanitizeUserData(userData);
    setUser(sanitizedUser);
    setIsAuthenticated(true);
  }, []);

  // ========================================
  // INITIALIZATION
  // ========================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        const userData = response.data?.user || response.data;

        if (!userData) {
          throw new Error(AUTH_CONFIG.MESSAGES.NO_USER_DATA);
        }

        setAuthenticatedState(userData);
      } catch (error) {
        console.error(AUTH_CONFIG.MESSAGES.TOKEN_VALIDATION_FAILED, error);
        resetAuthState();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setAuthenticatedState, resetAuthState]);

  // ========================================
  // LOGIN FUNCTION
  // ========================================

  const login = useCallback(
    async (credentials) => {
      // Input Validation
      if (!credentials?.email || !credentials?.password) {
        return {
          success: false,
          error: AUTH_CONFIG.MESSAGES.VALIDATION_ERROR,
        };
      }

      if (!validateEmail(credentials.email)) {
        return {
          success: false,
          error: AUTH_CONFIG.MESSAGES.INVALID_EMAIL,
        };
      }

      // Security Check
      if (!securityManager.isAllowed(credentials.email)) {
        const remainingTime = securityManager.getRemainingLockTime(
          credentials.email
        );
        return {
          success: false,
          error: formatMessage(AUTH_CONFIG.MESSAGES.ACCOUNT_LOCKED, {
            minutes: remainingTime,
          }),
        };
      }

      try {
        setLoading(true);

        const sanitizedCredentials = sanitizeUserData(credentials);
        const response = await authAPI.login(sanitizedCredentials);
        const { user: userData, accessToken } = response.data;

        if (!userData || !accessToken) {
          throw new Error(AUTH_CONFIG.MESSAGES.NO_USER_DATA);
        }

        // Erfolgreicher Login - Security State zurücksetzen
        securityManager.clearFailedAttempts(credentials.email);
        setAuthenticatedState(userData);

        return { success: true, user: userData };
      } catch (error) {
        // Failed Attempt registrieren
        securityManager.recordFailedAttempt(credentials.email);

        // Error Handling
        let errorMessage = AUTH_CONFIG.MESSAGES.GENERAL_ERROR;

        if (error.response?.status === 401) {
          errorMessage = AUTH_CONFIG.MESSAGES.INVALID_CREDENTIALS;
        } else if (error.response?.status === 429) {
          errorMessage = AUTH_CONFIG.MESSAGES.ACCOUNT_LOCKED.replace(
            "{minutes}",
            "15"
          );
        } else if (error.response?.status >= 500) {
          errorMessage = AUTH_CONFIG.MESSAGES.SERVER_ERROR;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.code === "NETWORK_ERROR") {
          errorMessage = AUTH_CONFIG.MESSAGES.NETWORK_ERROR;
        }

        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [securityManager, setAuthenticatedState]
  );

  // ========================================
  // REGISTER FUNCTION
  // ========================================

  const register = useCallback(
    async (userData) => {
      // Input Validation
      if (!userData?.email || !userData?.password) {
        return {
          success: false,
          error: AUTH_CONFIG.MESSAGES.VALIDATION_ERROR,
        };
      }

      if (!validateEmail(userData.email)) {
        return {
          success: false,
          error: AUTH_CONFIG.MESSAGES.INVALID_EMAIL,
        };
      }

      if (!validatePassword(userData.password)) {
        return {
          success: false,
          error: AUTH_CONFIG.MESSAGES.WEAK_PASSWORD,
        };
      }

      try {
        setLoading(true);

        const sanitizedUserData = sanitizeUserData(userData);
        const response = await authAPI.register(sanitizedUserData);
        const { user: newUser, accessToken } = response.data;

        if (!newUser || !accessToken) {
          throw new Error(AUTH_CONFIG.MESSAGES.NO_USER_DATA);
        }

        setAuthenticatedState(newUser);
        return { success: true, user: newUser };
      } catch (error) {
        let errorMessage = AUTH_CONFIG.MESSAGES.REGISTRATION_ERROR;

        if (error.response?.status === 409) {
          errorMessage = AUTH_CONFIG.MESSAGES.EMAIL_EXISTS;
        } else if (error.response?.status === 400) {
          errorMessage =
            error.response.data?.message ||
            AUTH_CONFIG.MESSAGES.VALIDATION_ERROR;
        } else if (error.response?.status >= 500) {
          errorMessage = AUTH_CONFIG.MESSAGES.SERVER_ERROR;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [setAuthenticatedState]
  );

  // ========================================
  // LOGOUT FUNCTION
  // ========================================

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      resetAuthState();
      setLoading(false);
    }
  }, [resetAuthState]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const updateUser = useCallback((updatedUserData) => {
    if (!updatedUserData) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const sanitizedUpdate = sanitizeUserData(updatedUserData);
      return { ...prevUser, ...sanitizedUpdate };
    });
  }, []);

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      switch (role) {
        case "BB":
          return Boolean(user.isBB);
        case "student":
          return Boolean(!user.isBB);
        default:
          return false;
      }
    },
    [user]
  );

  const isSessionExpiringSoon = useCallback(() => {
    // Diese Funktion wird von der api.js TokenManager übernommen
    // Hier als Placeholder für zukünftige Implementierung
    return false;
  }, []);

  // ========================================
  // CONTEXT VALUE MEMOIZATION
  // ========================================

  const contextValue = useMemo(
    () => ({
      // State
      user,
      isAuthenticated,
      loading,

      // Actions
      login,
      register,
      logout,
      updateUser,

      // Utility Functions
      hasRole,
      isSessionExpiringSoon,
      resetAuthState,

      // Security Info (read-only)
      securityConfig: AUTH_CONFIG.SECURITY,
    }),
    [
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      updateUser,
      hasRole,
      isSessionExpiringSoon,
      resetAuthState,
    ]
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
