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
  TOKEN: {
    ACCESS_TOKEN_KEY: "accessToken",
    USE_SESSION_STORAGE: true,
  },
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 Minuten
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 Minuten
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 Stunde
  },
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    EMAIL_MAX_LENGTH: 254,
    PASSWORD_MAX_LENGTH: 128,
  },
  MESSAGES: {
    LOGIN: {
      INVALID_CREDENTIALS: "Ungültige E-Mail-Adresse oder Passwort",
      RATE_LIMITED:
        "Zu viele Login-Versuche. Bitte warten Sie {minutes} Minuten.",
      ACCOUNT_LOCKED:
        "Account temporär gesperrt. Versuchen Sie es in {minutes} Minuten erneut.",
      SERVER_ERROR: "Server-Fehler. Bitte versuchen Sie es später erneut.",
      NETWORK_ERROR:
        "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.",
      VALIDATION_ERROR: "E-Mail und Passwort sind erforderlich",
      INVALID_EMAIL: "Ungültige E-Mail-Adresse",
      WEAK_PASSWORD: "Passwort entspricht nicht den Sicherheitsanforderungen",
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
      UPDATE_USER_NO_DATA: "Keine Daten zum Aktualisieren bereitgestellt",
      UPDATE_USER_NO_CURRENT: "Kein aktueller Benutzer vorhanden",
      INCOMPLETE_SERVER_RESPONSE: "Unvollständige Antwort vom Server",
      NO_USER_DATA_RECEIVED: "Keine Benutzerdaten empfangen",
    },
  },
};

// ========================================
// SECURE TOKEN STORAGE
// ========================================
class SecureTokenStorage {
  constructor() {
    this.tokenKey = AUTH_CONFIG.TOKEN.ACCESS_TOKEN_KEY;
  }

  isSessionStorageAvailable() {
    try {
      const test = "__sessionStorageTest__";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  setToken(token) {
    if (
      AUTH_CONFIG.TOKEN.USE_SESSION_STORAGE &&
      this.isSessionStorageAvailable()
    ) {
      sessionStorage.setItem(this.tokenKey, token);
    } else {
      // Fallback auf localStorage mit Expiry
      const tokenData = {
        token,
        expiry: Date.now() + AUTH_CONFIG.SECURITY.SESSION_TIMEOUT,
      };
      localStorage.setItem(this.tokenKey, JSON.stringify(tokenData));
    }
  }

  getToken() {
    if (
      AUTH_CONFIG.TOKEN.USE_SESSION_STORAGE &&
      this.isSessionStorageAvailable()
    ) {
      return sessionStorage.getItem(this.tokenKey);
    } else {
      const tokenData = localStorage.getItem(this.tokenKey);
      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          if (Date.now() > parsed.expiry) {
            this.removeToken();
            return null;
          }
          return parsed.token;
        } catch (e) {
          this.removeToken();
          return null;
        }
      }
      return null;
    }
  }

  removeToken() {
    if (this.isSessionStorageAvailable()) {
      sessionStorage.removeItem(this.tokenKey);
    }
    localStorage.removeItem(this.tokenKey);
  }
}

// ========================================
// RATE LIMITER
// ========================================
class RateLimiter {
  constructor(
    maxAttempts = AUTH_CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS,
    windowMs = AUTH_CONFIG.SECURITY.RATE_LIMIT_WINDOW
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  isAllowed(identifier = "default") {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];

    // Entferne alte Versuche außerhalb des Zeitfensters
    const validAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Füge aktuellen Versuch hinzu
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
// VALIDATION UTILITIES
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
      // Einfache XSS-Prävention durch HTML-Entitäten ersetzen
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
// AUTH CONTEXT
// ========================================
const AuthContext = createContext();

/**
 * Custom Hook zum Verwenden des Auth Context
 * @returns {Object} Auth context value
 * @throws {Error} Wenn außerhalb des AuthProvider verwendet
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider Component für Authentifizierungsmanagement
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Security State
  const [securityState, setSecurityState] = useState({
    isLocked: false,
    lockUntil: null,
    failedAttempts: 0,
  });

  // ========================================
  // SECURITY INSTANCES
  // ========================================
  const tokenStorage = new SecureTokenStorage();
  const loginLimiter = new RateLimiter();

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  /**
   * Hilfsfunktion zum Zurücksetzen des Auth-Status
   */
  const resetAuthState = useCallback(() => {
    tokenStorage.removeToken();
    setUser(null);
    setIsAuthenticated(false);
  }, [tokenStorage]);

  /**
   * Hilfsfunktion zum Setzen des authentifizierten Zustands
   * @param {Object} userData - User data from API
   * @param {string} token - Access token
   */
  const setAuthenticatedState = useCallback(
    (userData, token) => {
      if (token) {
        tokenStorage.setToken(token);
      }
      setUser(userData);
      setIsAuthenticated(true);
    },
    [tokenStorage]
  );

  /**
   * Formatiert Fehlermeldungen mit Parametern
   * @param {string} message - Message template
   * @param {Object} params - Parameters to replace
   * @returns {string} Formatted message
   */
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

  /**
   * Initialisierung der Authentifizierung beim App-Start
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenStorage.getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();

        // Verbesserte Datenextraktion mit besserer Fehlerbehandlung
        const userData = response.data?.user || response.data;

        if (!userData) {
          throw new Error(AUTH_CONFIG.MESSAGES.GENERAL.NO_USER_DATA_RECEIVED);
        }

        // Sanitize user data
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
  }, [setAuthenticatedState, resetAuthState, tokenStorage]);

  // ========================================
  // LOGIN FUNCTION
  // ========================================

  /**
   * Login-Funktion mit vollständiger Validierung und Sicherheitsfeatures
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise<Object>} Login result with success flag and data/error
   */
  const login = async (credentials) => {
    // Input validation
    if (!credentials?.email || !credentials?.password) {
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

      // Sanitize input data
      const sanitizedCredentials = sanitizeUserData(credentials);

      const response = await authAPI.login(sanitizedCredentials);
      const { user: userData, accessToken } = response.data;

      if (!userData || !accessToken) {
        throw new Error(
          AUTH_CONFIG.MESSAGES.GENERAL.INCOMPLETE_SERVER_RESPONSE
        );
      }

      // Sanitize user data from server
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
      console.error(
        AUTH_CONFIG.MESSAGES.GENERAL.TOKEN_VALIDATION_FAILED,
        error
      );

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
        errorMessage = sanitizeUserData({
          msg: error.response.data.message,
        }).msg;
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

  /**
   * Registrierungs-Funktion mit Validierung
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result with success flag and data/error
   */
  const register = async (userData) => {
    // Input validation
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

      // Sanitize input data
      const sanitizedUserData = sanitizeUserData(userData);

      const response = await authAPI.register(sanitizedUserData);
      const { user: newUser, accessToken } = response.data;

      // Validierung der API-Antwort
      if (!newUser || !accessToken) {
        throw new Error(
          AUTH_CONFIG.MESSAGES.GENERAL.INCOMPLETE_SERVER_RESPONSE
        );
      }

      // Sanitize user data from server
      const sanitizedUser = sanitizeUserData(newUser);

      setAuthenticatedState(sanitizedUser, accessToken);

      return { success: true, user: sanitizedUser };
    } catch (error) {
      console.error("Registrierungs-Fehler:", error);

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
        errorMessage = sanitizeUserData({
          msg: error.response.data.message,
        }).msg;
      } else if (error.message && !error.message.includes("Network Error")) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGOUT FUNCTION
  // ========================================

  /**
   * Logout-Funktion mit sicherem Cleanup
   */
  const logout = async () => {
    try {
      setLoading(true);

      // Logout-Endpoint aufrufen um Refresh Token zu invalidieren
      await authAPI.logout();
    } catch (error) {
      // Auch wenn der Server-Logout fehlschlägt, lokalen Zustand löschen
      console.error(AUTH_CONFIG.MESSAGES.GENERAL.LOGOUT_ERROR, error);
    } finally {
      // Secure cleanup
      resetAuthState();
      setSecurityState({
        isLocked: false,
        lockUntil: null,
        failedAttempts: 0,
      });
      setLoading(false);

      // Clear sensitive data from memory (optional)
      if (window.gc) {
        window.gc();
      }
    }
  };

  // ========================================
  // UPDATE USER FUNCTION
  // ========================================

  /**
   * Benutzer-Update-Funktion mit Validierung
   * @param {Object} updatedUserData - Updated user data
   */
  const updateUser = useCallback((updatedUserData) => {
    if (!updatedUserData) {
      console.warn(AUTH_CONFIG.MESSAGES.GENERAL.UPDATE_USER_NO_DATA);
      return;
    }

    setUser((prevUser) => {
      if (!prevUser) {
        console.warn(AUTH_CONFIG.MESSAGES.GENERAL.UPDATE_USER_NO_CURRENT);
        return prevUser;
      }

      // Sanitize updated data
      const sanitizedUpdate = sanitizeUserData(updatedUserData);

      return {
        ...prevUser,
        ...sanitizedUpdate,
      };
    });
  }, []);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Überprüfung ob der Benutzer eine bestimmte Rolle hat
   * @param {string} role - Role to check (e.g., 'BB' for Berufsbildner)
   * @returns {boolean} Whether user has the role
   */
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

  /**
   * Überprüfung ob die Sitzung bald abläuft
   * @returns {boolean} Whether session is expiring soon
   */
  const isSessionExpiringSoon = useCallback(() => {
    const token = tokenStorage.getToken();
    if (!token) return false;

    // Hier könnte JWT-Parsing implementiert werden
    // Für jetzt einfache localStorage-Prüfung
    const tokenData = localStorage.getItem(AUTH_CONFIG.TOKEN.ACCESS_TOKEN_KEY);
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        const timeUntilExpiry = parsed.expiry - Date.now();
        return timeUntilExpiry < 15 * 60 * 1000; // 15 Minuten
      } catch (e) {
        return false;
      }
    }
    return false;
  }, [tokenStorage]);

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
    resetAuthState, // Für Notfälle zugänglich machen

    // Config (read-only)
    config: AUTH_CONFIG,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
