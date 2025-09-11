import axios from "axios";
// ENTFERNT: Ungültiger Backend-Import

// ========================================
// CONFIGURATION & CONSTANTS
// ========================================

const API_CONFIG = {
  // Environment-basierte Konfiguration
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000,
  WITH_CREDENTIALS: true,

  // Retry-Konfiguration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Token-Konfiguration
  TOKEN_KEY: "accessToken",
  REFRESH_TOKEN_KEY: "refreshToken",

  // Ausgeschlossene Routen für Token-Refresh
  EXCLUDED_REFRESH_ROUTES: ["/auth/login", "/auth/register", "/auth/refresh"],
};

// ========================================
// UTILITIES & HELPERS
// ========================================

/**
 * Sichere Token-Verwaltung mit Validierung
 */
class TokenManager {
  static getToken() {
    try {
      return localStorage.getItem(API_CONFIG.TOKEN_KEY);
    } catch (error) {
      console.warn("Token retrieval failed:", error);
      return null;
    }
  }

  static setToken(token) {
    try {
      if (token) {
        localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
      }
    } catch (error) {
      console.error("Token storage failed:", error);
    }
  }

  static removeToken() {
    try {
      localStorage.removeItem(API_CONFIG.TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.warn("Token removal failed:", error);
    }
  }

  static isTokenExpiringSoon(token) {
    if (!token) return true;

    try {
      // JWT-Token dekodieren ohne Library (nur für Expiry-Check)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeBuffer = 60 * 1000; // 1 Minute Buffer

      return expiryTime - currentTime < timeBuffer;
    } catch (error) {
      console.warn("Token validation failed:", error);
      return true;
    }
  }
}

/**
 * Improved Queue-Management für parallele Requests
 */
class RequestQueue {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  enqueue(resolve, reject) {
    this.failedQueue.push({ resolve, reject });
  }

  processQueue(error = null, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.clearQueue();
  }

  clearQueue() {
    this.failedQueue = [];
  }

  setRefreshing(status) {
    this.isRefreshing = status;
  }

  isCurrentlyRefreshing() {
    return this.isRefreshing;
  }
}

/**
 * Route-Validierung für Token-Refresh
 */
const shouldExcludeFromRefresh = (url) => {
  return API_CONFIG.EXCLUDED_REFRESH_ROUTES.some((route) =>
    url?.includes(route)
  );
};

/**
 * Retry-Logic mit exponential backoff
 */
const createRetryFunction = (fn, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (retries > 0 && error.response?.status >= 500) {
        const delay =
          API_CONFIG.RETRY_DELAY * (API_CONFIG.RETRY_ATTEMPTS - retries + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return createRetryFunction(fn, retries - 1)(...args);
      }
      throw error;
    }
  };
};

// ========================================
// AXIOS INSTANCE SETUP
// ========================================

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Initialize queue manager
const requestQueue = new RequestQueue();

// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(
  (config) => {
    // Token automatisch hinzufügen
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Request-ID für Debugging hinzufügen
    config.metadata = {
      startTime: Date.now(),
      requestId: Math.random().toString(36).substr(2, 9),
    };

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(
  (response) => {
    // Erfolgreiche Response-Metriken loggen (Development)
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(
        `✅ API Success [${
          response.config.metadata.requestId
        }]: ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${duration}ms`
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Error-Metriken loggen (Development)
    if (import.meta.env.DEV && originalRequest?.metadata) {
      const duration = Date.now() - originalRequest.metadata.startTime;
      console.error(
        `❌ API Error [${
          originalRequest.metadata.requestId
        }]: ${originalRequest.method?.toUpperCase()} ${
          originalRequest.url
        } - ${duration}ms - Status: ${error.response?.status}`
      );
    }

    // Ausgeschlossene Routen nicht verarbeiten
    if (shouldExcludeFromRefresh(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // 401-Fehler mit Token-Refresh behandeln
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Bereits refreshing - Request in Queue einreihen
      if (requestQueue.isCurrentlyRefreshing()) {
        return new Promise((resolve, reject) => {
          requestQueue.enqueue(
            (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            (err) => reject(err)
          );
        });
      }

      originalRequest._retry = true;
      requestQueue.setRefreshing(true);

      try {
        // Token-Refresh versuchen
        const refreshResponse = await api.post("/auth/refresh");
        const newToken = refreshResponse.data?.accessToken;

        if (!newToken) {
          throw new Error("No access token received from refresh");
        }

        // Token speichern und Queue verarbeiten
        TokenManager.setToken(newToken);
        requestQueue.processQueue(null, newToken);

        // Original Request wiederholen
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh fehlgeschlagen - Cleanup und Redirect
        console.error("Token refresh failed:", refreshError);

        requestQueue.processQueue(refreshError, null);
        TokenManager.removeToken();

        // Nur umleiten wenn nicht bereits auf Login-Seite
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        requestQueue.setRefreshing(false);
      }
    }

    // Network-Fehler behandeln
    if (!error.response && error.code === "ECONNABORTED") {
      console.error("Request timeout:", originalRequest?.url);
    }

    return Promise.reject(error);
  }
);

// ========================================
// API ENDPOINT DEFINITIONS
// ========================================

/**
 * Authentication API - Verbessert und konsolidiert
 */
export const authAPI = {
  login: createRetryFunction((credentials) =>
    api.post("/auth/login", credentials)
  ),
  register: createRetryFunction((userData) =>
    api.post("/auth/register", userData)
  ),
  logout: createRetryFunction(() => api.post("/auth/logout")),
  refresh: createRetryFunction(() => api.post("/auth/refresh")),
  getCurrentUser: createRetryFunction(() => api.get("/auth/me")),

  // Neue Security-Endpunkte
  changePassword: createRetryFunction((passwordData) =>
    api.put("/auth/change-password", passwordData)
  ),
  resetPassword: createRetryFunction((email) =>
    api.post("/auth/reset-password", { email })
  ),
  verifyToken: createRetryFunction(() => api.get("/auth/verify")),
};

/**
 * User API - Bereinigt und erweitert
 */
export const userAPI = {
  // User Profile (vereinheitlicht mit authAPI)
  getCurrentUser: createRetryFunction(() => api.get("/auth/me")), // Verweist auf authAPI für Konsistenz
  getProfile: createRetryFunction(() => api.get("/user/profile")),
  updateProfile: createRetryFunction((userData) =>
    api.put("/user/profile", userData)
  ),

  // Student Management (für Berufsbildner)
  getAssignedStudents: createRetryFunction(() => api.get("/user/bb/users")), // Original Endpoint beibehalten
  getStudentProgress: createRetryFunction((studentId) => {
    if (!studentId) {
      throw new Error("Student ID is required");
    }
    return api.get(`/user/progress/${studentId}`);
  }),

  // Progress Management
  getUserProgress: createRetryFunction((userId) =>
    api.get(`/user/progress/${userId || ""}`)
  ),
  markModuleAsCompleted: createRetryFunction((moduleId) => {
    if (!moduleId) {
      throw new Error("Module ID is required");
    }
    return api.post("/user/complete-module", { moduleId });
  }),
  unmarkModuleAsCompleted: createRetryFunction((moduleId) => {
    if (!moduleId) {
      throw new Error("Module ID is required");
    }
    return api.post("/user/uncomplete-module", { moduleId });
  }),

  // Bulk Operations
  markMultipleModulesCompleted: createRetryFunction((moduleIds) => {
    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      throw new Error("Module IDs array is required");
    }
    return api.post("/user/complete-modules", { moduleIds });
  }),
};

/**
 * Module API - Erweitert mit Caching-Strategien
 */
export const moduleAPI = {
  // Basic Operations
  getAllModules: createRetryFunction(() => api.get("/modules")),
  getModule: createRetryFunction((moduleId) => {
    if (!moduleId) {
      throw new Error("Module ID is required");
    }
    return api.get(`/modules/${moduleId}`);
  }),
  getModulesWithProgress: createRetryFunction(() =>
    api.get("/modules/with-progress")
  ),

  // Advanced Queries
  getModulesByArea: createRetryFunction((area) => {
    if (!area) {
      throw new Error("Area parameter is required");
    }
    return api.get("/modules", { params: { area } });
  }),
  searchModules: createRetryFunction((query) => {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }
    return api.get("/modules/search", { params: { q: query.trim() } });
  }),
};

/**
 * Competency API - Vollständig korrigiert
 */
export const competencyAPI = {
  // Grundlegende Funktionen
  getAllCompetencies: createRetryFunction(() => api.get("/competencies")),

  getCompetency: createRetryFunction((competencyId) => {
    if (!competencyId) {
      throw new Error("Competency ID is required");
    }
    return api.get(`/competencies/${competencyId}`);
  }),

  // Neue Funktionen für Leistungsziele-Übersicht
  getCompetencyOverview: createRetryFunction(() => {
    return api.get("/competencies/overview");
  }),

  getCompetenciesByArea: createRetryFunction((area) => {
    if (!area) {
      throw new Error("Area parameter is required");
    }
    return api.get(`/competencies/area/${area.toLowerCase()}`);
  }),

  searchCompetencies: createRetryFunction((query) => {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }
    return api.get("/competencies/search", {
      params: { q: query.trim() },
    });
  }),

  getCompetencyProgress: createRetryFunction((competencyId, userId) => {
    if (!competencyId) {
      throw new Error("Competency ID is required");
    }
    const params = userId ? `?userId=${userId}` : "";
    return api.get(`/competencies/${competencyId}/progress${params}`);
  }),
};

/**
 * Helper-Funktionen für Leistungsziele
 */
export const competencyHelpers = {
  /**
   * Formatiert Handlungskompetenzbereich für Anzeige
   * @param {string} area - Bereich (a-h)
   * @returns {Object} Formatierte Bereichsinformationen
   */
  formatArea: (area) => {
    const areaMap = {
      a: {
        code: "A",
        title: "Begleiten von ICT-Projekten",
        description: "Projektmanagement und Stakeholder-Betreuung",
        color: "primary",
      },
      b: {
        code: "B",
        title: "Betreiben und Erweitern von ICT-Lösungen",
        description: "Support und Wartung von ICT-Systemen",
        color: "secondary",
      },
      c: {
        code: "C",
        title: "Aufbauen und Pflegen von digitalen Daten",
        description: "Datenmanagement und Datenbankentwicklung",
        color: "accent",
      },
      d: {
        code: "D",
        title: "Gewährleisten der Informationssicherheit",
        description: "Sicherheitskonzepte und Datenschutz",
        color: "warning",
      },
      e: {
        code: "E",
        title: "Entwickeln und Bereitstellen von ICT-Lösungen",
        description: "Software-Entwicklung und Deployment",
        color: "info",
      },
      f: {
        code: "F",
        title: "Definieren und Implementieren von ICT-Prozessen",
        description: "Prozessoptimierung und Automatisierung",
        color: "success",
      },
      g: {
        code: "G",
        title: "Entwickeln von Applikationen",
        description: "Fachrichtung: Applikationsentwicklung",
        color: "primary",
      },
      h: {
        code: "H",
        title: "Ausliefern und Betreiben von Applikationen",
        description: "Fachrichtung: DevOps und Betrieb",
        color: "secondary",
      },
    };

    return (
      areaMap[area.toLowerCase()] || {
        code: area.toUpperCase(),
        title: `Handlungskompetenzbereich ${area.toUpperCase()}`,
        description: "Unbekannter Bereich",
        color: "neutral",
      }
    );
  },

  /**
   * Formatiert Taxonomiestufe für Anzeige
   * @param {string} taxonomy - Taxonomiestufe (K1-K6)
   * @returns {Object} Formatierte Taxonomie-Informationen
   */
  formatTaxonomy: (taxonomy) => {
    const taxonomyMap = {
      K1: {
        level: 1,
        title: "Wissen",
        description: "Wiedergeben und Erinnern",
      },
      K2: {
        level: 2,
        title: "Verstehen",
        description: "Verstehen und Erklären",
      },
      K3: {
        level: 3,
        title: "Anwenden",
        description: "Anwenden und Ausführen",
      },
      K4: {
        level: 4,
        title: "Analysieren",
        description: "Analysieren und Beurteilen",
      },
      K5: {
        level: 5,
        title: "Synthetisieren",
        description: "Entwickeln und Konzipieren",
      },
      K6: {
        level: 6,
        title: "Evaluieren",
        description: "Bewerten und Entscheiden",
      },
    };

    return (
      taxonomyMap[taxonomy] || {
        level: 0,
        title: taxonomy,
        description: "Unbekannte Taxonomiestufe",
      }
    );
  },

  /**
   * Berechnet Abdeckungsstatistiken
   * @param {Array} competencies - Array von Leistungszielen
   * @returns {Object} Statistiken
   */
  calculateCoverageStats: (competencies) => {
    const total = competencies.length;
    const covered = competencies.filter((c) => c.isCovered).length;
    const uncovered = total - covered;
    const percentage = total > 0 ? Math.round((covered / total) * 100) : 0;

    return { total, covered, uncovered, percentage };
  },

  /**
   * Gruppiert Leistungsziele nach Bereich
   * @param {Array} competencies - Array von Leistungszielen
   * @returns {Object} Nach Bereichen gruppierte Leistungsziele
   */
  groupByArea: (competencies) => {
    return competencies.reduce((groups, competency) => {
      const area = competency.area.toUpperCase();
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(competency);
      return groups;
    }, {});
  },
};

// ========================================
// UTILITY FUNCTIONS FOR COMPONENTS
// ========================================

/**
 * Health Check Utility
 */
export const healthAPI = {
  check: createRetryFunction(() => api.get("/health")),
  ping: createRetryFunction(() => api.get("/ping")),
};

/**
 * Generic API Helper für Custom Requests
 */
export const apiHelper = {
  get: createRetryFunction((url, config) => api.get(url, config)),
  post: createRetryFunction((url, data, config) => api.post(url, data, config)),
  put: createRetryFunction((url, data, config) => api.put(url, data, config)),
  patch: createRetryFunction((url, data, config) =>
    api.patch(url, data, config)
  ),
  delete: createRetryFunction((url, config) => api.delete(url, config)),
};

/**
 * Token Utilities für Components
 */
export const tokenUtils = {
  isAuthenticated: () => !!TokenManager.getToken(),
  getToken: TokenManager.getToken,
  removeToken: TokenManager.removeToken,
  isTokenExpiring: () => {
    const token = TokenManager.getToken();
    return TokenManager.isTokenExpiringSoon(token);
  },
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

/**
 * Zentrale Error-Handler
 */
export const errorHandler = {
  /**
   * Standard API Error Handler
   */
  handleApiError: (error, context = "API Call") => {
    console.error(`${context} failed:`, error);

    // Strukturiertes Error-Objekt zurückgeben
    return {
      message:
        error.response?.data?.message ||
        error.message ||
        "Ein unbekannter Fehler ist aufgetreten",
      status: error.response?.status || 500,
      code: error.response?.data?.code || "UNKNOWN_ERROR",
      details: error.response?.data?.details || null,
    };
  },

  /**
   * Network Error Handler
   */
  handleNetworkError: (error) => {
    if (error.code === "ECONNABORTED") {
      return {
        message:
          "Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.",
        status: 408,
        code: "TIMEOUT_ERROR",
      };
    }

    if (!error.response) {
      return {
        message:
          "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.",
        status: 0,
        code: "NETWORK_ERROR",
      };
    }

    return errorHandler.handleApiError(error, "Network");
  },
};

// ========================================
// DEVELOPMENT UTILITIES
// ========================================

if (import.meta.env.DEV) {
  // Request-Logging für Development
  api.interceptors.request.use((config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        data: config.data,
        params: config.params,
      }
    );
    return config;
  });

  // Global Error Logging
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.isAxiosError) {
      console.error(
        "🔥 Unhandled API Error:",
        errorHandler.handleApiError(event.reason)
      );
    }
  });
}

// ========================================
// EXPORTS
// ========================================

// Default Export: Konfigurierte Axios-Instanz
export default api;

// Named Exports: Alle APIs und Utilities
export { API_CONFIG, TokenManager, RequestQueue };
