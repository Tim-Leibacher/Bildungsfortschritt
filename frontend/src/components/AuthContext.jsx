import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../lib/api";

// ========================================
// KONFIGURATION
// ========================================
const AUTH_CONFIG = {
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    EMAIL_MAX_LENGTH: 254,
    PASSWORD_MAX_LENGTH: 128,
  },
  MESSAGES: {
    LOGIN: {
      VALIDATION_ERROR: "E-Mail und Passwort sind erforderlich",
      INVALID_EMAIL: "Ungültige E-Mail-Adresse",
      INVALID_CREDENTIALS: "Ungültige E-Mail-Adresse oder Passwort",
      RATE_LIMITED:
        "Zu viele Login-Versuche. Bitte warten Sie {minutes} Minuten.",
      ACCOUNT_LOCKED:
        "Account temporär gesperrt. Versuchen Sie es in {minutes} Minuten erneut.",
      SERVER_ERROR: "Server-Fehler. Bitte versuchen Sie es später erneut.",
      NETWORK_ERROR:
        "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.",
      GENERAL_ERROR: "Ein Fehler ist beim Anmelden aufgetreten",
    },
    REGISTER: {
      EMAIL_EXISTS: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
      WEAK_PASSWORD:
        "Passwort muss mindestens 8 Zeichen enthalten, mit Groß-, Kleinbuchstaben und Zahlen",
      INVALID_DATA: "Ungültige Eingabedaten",
      SERVER_ERROR: "Server-Fehler. Bitte versuchen Sie es später erneut.",
      GENERAL_ERROR: "Ein Fehler ist bei der Registrierung aufgetreten",
    },
    GENERAL: {
      TOKEN_VALIDATION_FAILED: "Token-Validierung fehlgeschlagen",
      LOGOUT_ERROR: "Logout-Fehler",
      INCOMPLETE_SERVER_RESPONSE: "Unvollständige Antwort vom Server",
      NO_USER_DATA_RECEIVED: "Keine Benutzerdaten empfangen",
    },
  },
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 Minuten
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 Minuten
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 Stunde
  },
  TOKEN: {
    ACCESS_TOKEN_KEY: "accessToken",
    USE_SESSION_STORAGE: true,
  },
};

// ========================================
// UTILITIES
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
    password.length >= 8 &&
    password.length <= AUTH_CONFIG.VALIDATION.PASSWORD_MAX_LENGTH &&
    AUTH_CONFIG.VALIDATION.PASSWORD_REGEX.test(password)
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

// ========================================
// TOKEN STORAGE
// ========================================
class TokenStorage {
  constructor() {
    this.tokenKey = AUTH_CONFIG.TOKEN.ACCESS_TOKEN_KEY;
  }

  setToken(token) {
    try {
      if (AUTH_CONFIG.TOKEN.USE_SESSION_STORAGE && sessionStorage) {
        sessionStorage.setItem(this.tokenKey, token);
      } else {
        localStorage.setItem(this.tokenKey, token);
      }
    } catch (error) {
      console.error("Token storage failed:", error);
    }
  }

  getToken() {
    try {
      if (AUTH_CONFIG.TOKEN.USE_SESSION_STORAGE && sessionStorage) {
        return sessionStorage.getItem(this.tokenKey);
      } else {
        return localStorage.getItem(this.tokenKey);
      }
    } catch (error) {
      console.warn("Token retrieval failed:", error);
      return null;
    }
  }

  removeToken() {
    try {
      if (sessionStorage) sessionStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.warn("Token removal failed:", error);
    }
  }
}

// ========================================
// RATE LIMITER
// ========================================
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  isAllowed(identifier = "default") {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    const validAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    return true;
  }

  getRemainingTime(identifier = "default") {
    const userAttempts = this.attempts.get(identifier) || [];
    if (userAttempts.length === 0) return 0;

    const oldestAttempt = Math.min(...userAttempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, remainingTime);
  }
}

// ========================================
// AUTH CONTEXT
// ========================================
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [securityState, setSecurityState] = useState({
    isLocked: false,
    lockUntil: null,
    failedAttempts: 0,
  });

  // ========================================
  // INSTANCES
  // ========================================
  const tokenStorage = new TokenStorage();
  const loginLimiter = new RateLimiter();

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const resetAuthState = useCallback(() => {
    tokenStorage.removeToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const setAuthenticatedState = useCallback((userData, token) => {
    if (token) {
      tokenStorage.setToken(token);
    }
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const formatMessage = useCallback((message, params = {}) => {
    let formatted = message;
    Object.entries(params).forEach(([key, value]) => {
      formatted = formatted.replace(`{${key}}`, value);
    });
    return formatted;
  }, []);

  // ========================================
  // INITIALIZATION
  // ========================================
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenStorage.getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        const userData = response.data?.user || response.data;

        if (!userData) {
          throw new Error(AUTH_CONFIG.MESSAGES.GENERAL.NO_USER_DATA_RECEIVED);
        }

        const sanitizedUser = sanitizeUserData(userData);
        setAuthenticatedState(sanitizedUser);
      } catch (error) {
        console.error(
          AUTH_CONFIG.MESSAGES.GENERAL.TOKEN_VALIDATION_FAILED,
          error
        );
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
  const login = async (credentials) => {
    // Input validation
    if (!credentials) {
      return {
        success: false,
        error: AUTH_CONFIG.MESSAGES.LOGIN.VALIDATION_ERROR,
      };
    }

    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: AUTH_CONFIG.MESSAGES.LOGIN.VALIDATION_ERROR,
      };
    }

    if (!validateEmail(credentials.email)) {
      return {
        success: false,
        error: AUTH_CONFIG.MESSAGES.LOGIN.INVALID_EMAIL,
      };
    }

    // Rate limiting check
    if (!loginLimiter.isAllowed(credentials.email)) {
      const remainingTime = Math.ceil(
        loginLimiter.getRemainingTime(credentials.email) / 1000 / 60
      );
      return {
        success: false,
        error: formatMessage(AUTH_CONFIG.MESSAGES.LOGIN.RATE_LIMITED, {
          minutes: remainingTime,
        }),
      };
    }

    // Security state check
    if (securityState.isLocked && Date.now() < securityState.lockUntil) {
      const remainingTime = Math.ceil(
        (securityState.lockUntil - Date.now()) / 1000 / 60
      );
      return {
        success: false,
        error: formatMessage(AUTH_CONFIG.MESSAGES.LOGIN.ACCOUNT_LOCKED, {
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
        throw new Error(
          AUTH_CONFIG.MESSAGES.GENERAL.INCOMPLETE_SERVER_RESPONSE
        );
      }

      const sanitizedUser = sanitizeUserData(userData);
      setAuthenticatedState(sanitizedUser, accessToken);

      // Reset security state on successful login
      setSecurityState({
        isLocked: false,
        lockUntil: null,
        failedAttempts: 0,
      });

      return { success: true, user: sanitizedUser };
    } catch (error) {
      // Update security state on failed login
      const newFailedAttempts = securityState.failedAttempts + 1;
      let newSecurityState = {
        ...securityState,
        failedAttempts: newFailedAttempts,
      };

      // Lock account after 3 consecutive failed attempts
      if (newFailedAttempts >= 3) {
        newSecurityState = {
          ...newSecurityState,
          isLocked: true,
          lockUntil: Date.now() + AUTH_CONFIG.SECURITY.LOCKOUT_DURATION,
        };
      }

      setSecurityState(newSecurityState);

      // Enhanced error handling
      let errorMessage = AUTH_CONFIG.MESSAGES.LOGIN.GENERAL_ERROR;

      if (error.response?.status === 401) {
        errorMessage = AUTH_CONFIG.MESSAGES.LOGIN.INVALID_CREDENTIALS;
      } else if (error.response?.status === 429) {
        errorMessage = AUTH_CONFIG.MESSAGES.LOGIN.RATE_LIMITED.replace(
          "{minutes}",
          ""
        );
      } else if (error.response?.status >= 500) {
        errorMessage = AUTH_CONFIG.MESSAGES.LOGIN.SERVER_ERROR;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.message.includes("Network Error")) {
        errorMessage = error.message;
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = AUTH_CONFIG.MESSAGES.LOGIN.NETWORK_ERROR;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // REGISTER FUNCTION
  // ========================================
  const register = async (userData) => {
    if (!userData?.email || !userData?.password) {
      return {
        success: false,
        error: AUTH_CONFIG.MESSAGES.LOGIN.VALIDATION_ERROR,
      };
    }

    if (!validateEmail(userData.email)) {
      return {
        success: false,
        error: AUTH_CONFIG.MESSAGES.LOGIN.INVALID_EMAIL,
      };
    }

    if (!validatePassword(userData.password)) {
      return {
        success: false,
        error: AUTH_CONFIG.MESSAGES.REGISTER.WEAK_PASSWORD,
      };
    }

    try {
      setLoading(true);
      const sanitizedUserData = sanitizeUserData(userData);
      const response = await authAPI.register(sanitizedUserData);
      const { user: newUser, accessToken } = response.data;

      if (!newUser || !accessToken) {
        throw new Error(
          AUTH_CONFIG.MESSAGES.GENERAL.INCOMPLETE_SERVER_RESPONSE
        );
      }

      const sanitizedUser = sanitizeUserData(newUser);
      setAuthenticatedState(sanitizedUser, accessToken);
      return { success: true, user: sanitizedUser };
    } catch (error) {
      let errorMessage = AUTH_CONFIG.MESSAGES.REGISTER.GENERAL_ERROR;

      if (error.response?.status === 409) {
        errorMessage = AUTH_CONFIG.MESSAGES.REGISTER.EMAIL_EXISTS;
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message ||
          AUTH_CONFIG.MESSAGES.REGISTER.INVALID_DATA;
      } else if (error.response?.status >= 500) {
        errorMessage = AUTH_CONFIG.MESSAGES.REGISTER.SERVER_ERROR;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGOUT FUNCTION
  // ========================================
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error(AUTH_CONFIG.MESSAGES.GENERAL.LOGOUT_ERROR, error);
    } finally {
      resetAuthState();
      setSecurityState({
        isLocked: false,
        lockUntil: null,
        failedAttempts: 0,
      });
      setLoading(false);
    }
  };

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
        default:
          return false;
      }
    },
    [user]
  );

  const isSessionExpiringSoon = useCallback(() => {
    const token = tokenStorage.getToken();
    if (!token) return false;

    try {
      // Simple JWT expiry check (ohne externe library)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const timeUntilExpiry = payload.exp * 1000 - Date.now();
      return timeUntilExpiry < 15 * 60 * 1000; // 15 Minuten
    } catch (error) {
      return false;
    }
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================
  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    securityState,

    // Functions
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isSessionExpiringSoon,
    resetAuthState,

    // Config (read-only)
    config: AUTH_CONFIG,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
