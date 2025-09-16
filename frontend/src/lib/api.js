import axios from "axios";

// ========================================
// KONFIGURATION
// ========================================

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  WITH_CREDENTIALS: true,

  RETRY: {
    ATTEMPTS: 3,
    DELAY_BASE: 1000,
    MULTIPLIER: 2,
  },

  TOKEN: {
    ACCESS_KEY: "accessToken",
    STORAGE_TYPE: "localStorage", // localStorage oder sessionStorage
  },

  EXCLUDED_REFRESH_ROUTES: ["/auth/login", "/auth/register", "/auth/refresh"],
};

// ========================================
// TOKEN MANAGEMENT
// ========================================

class TokenManager {
  static getStorage() {
    return API_CONFIG.TOKEN.STORAGE_TYPE === "sessionStorage"
      ? sessionStorage
      : localStorage;
  }

  static getToken() {
    try {
      return this.getStorage().getItem(API_CONFIG.TOKEN.ACCESS_KEY);
    } catch (error) {
      console.warn("Token retrieval failed:", error);
      return null;
    }
  }

  static setToken(token) {
    if (!token) return;

    try {
      this.getStorage().setItem(API_CONFIG.TOKEN.ACCESS_KEY, token);
    } catch (error) {
      console.error("Token storage failed:", error);
    }
  }

  static removeToken() {
    try {
      localStorage.removeItem(API_CONFIG.TOKEN.ACCESS_KEY);
      sessionStorage.removeItem(API_CONFIG.TOKEN.ACCESS_KEY);
    } catch (error) {
      console.warn("Token removal failed:", error);
    }
  }

  static isTokenExpiringSoon(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const bufferTime = 60 * 1000; // 1 Minute Puffer

      return expiryTime - currentTime < bufferTime;
    } catch (error) {
      return true;
    }
  }
}

// ========================================
// REQUEST QUEUE FÜR TOKEN REFRESH
// ========================================

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

// ========================================
// UTILITY FUNCTIONS
// ========================================

const shouldExcludeFromRefresh = (url) => {
  return API_CONFIG.EXCLUDED_REFRESH_ROUTES.some((route) =>
    url?.includes(route)
  );
};

const createRetryWrapper = (fn, maxRetries = API_CONFIG.RETRY.ATTEMPTS) => {
  return async (...args) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;

        // Nur bei Server-Fehlern (5xx) retry
        const shouldRetry =
          error.response?.status >= 500 && attempt < maxRetries;

        if (shouldRetry) {
          const delay =
            API_CONFIG.RETRY.DELAY_BASE *
            Math.pow(API_CONFIG.RETRY.MULTIPLIER, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        break;
      }
    }

    throw lastError;
  };
};

const generateRequestId = () => Math.random().toString(36).substr(2, 9);

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

    // Request-Metadaten für Debugging
    config.metadata = {
      startTime: Date.now(),
      requestId: generateRequestId(),
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
    // Performance-Logging für Development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(
        `API Success [${response.config.metadata.requestId}]: ` +
          `${response.config.method?.toUpperCase()} ${
            response.config.url
          } - ${duration}ms`
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Error-Logging für Development
    if (import.meta.env.DEV && originalRequest?.metadata) {
      const duration = Date.now() - originalRequest.metadata.startTime;
      console.error(
        `API Error [${originalRequest.metadata.requestId}]: ` +
          `${originalRequest.method?.toUpperCase()} ${originalRequest.url} - ` +
          `${duration}ms - Status: ${error.response?.status}`
      );
    }

    // Skip token refresh für auth routes
    if (shouldExcludeFromRefresh(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // 401 Fehler behandeln - Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Request bereits in Refresh Queue
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
        const refreshResponse = await api.post("/auth/refresh");
        const newToken = refreshResponse.data?.accessToken;

        if (!newToken) {
          throw new Error("No access token received from refresh");
        }

        TokenManager.setToken(newToken);
        requestQueue.processQueue(null, newToken);

        // Original Request mit neuem Token wiederholen
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        requestQueue.processQueue(refreshError, null);
        TokenManager.removeToken();

        // Redirect zur Login-Seite nur wenn nicht bereits dort
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

    return Promise.reject(error);
  }
);

// ========================================
// API ENDPOINTS
// ========================================

/**
 * Authentication API
 */
export const authAPI = {
  login: createRetryWrapper((credentials) => {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Email und Passwort sind erforderlich");
    }
    return api.post("/auth/login", credentials);
  }),

  register: createRetryWrapper((userData) => {
    if (!userData?.email || !userData?.password) {
      throw new Error("Email und Passwort sind erforderlich");
    }
    return api.post("/auth/register", userData);
  }),

  logout: createRetryWrapper(() => api.post("/auth/logout")),

  refresh: createRetryWrapper(() => api.post("/auth/refresh")),

  getCurrentUser: createRetryWrapper(() => api.get("/auth/me")),
};

/**
 * User API
 */
export const userAPI = {
  getCurrentUser: createRetryWrapper(() => api.get("/auth/me")),

  getProfile: createRetryWrapper(() => api.get("/user/profile")),

  updateProfile: createRetryWrapper((userData) => {
    if (!userData) throw new Error("User data is required");
    return api.put("/user/profile", userData);
  }),

  getAssignedStudents: createRetryWrapper(() => api.get("/user/bb/users")),

  getStudentProgress: createRetryWrapper((studentId) => {
    if (!studentId) throw new Error("Student ID is required");
    return api.get(`/user/progress/${studentId}`);
  }),

  getUserProgress: createRetryWrapper((userId = "") => {
    return api.get(`/user/progress/${userId}`);
  }),

  markModuleAsCompleted: createRetryWrapper((moduleId) => {
    if (!moduleId) throw new Error("Module ID is required");
    return api.post("/user/complete-module", { moduleId });
  }),

  unmarkModuleAsCompleted: createRetryWrapper((moduleId) => {
    if (!moduleId) throw new Error("Module ID is required");
    return api.post("/user/uncomplete-module", { moduleId });
  }),
};

/**
 * Module API
 */
export const moduleAPI = {
  getAllModules: createRetryWrapper(() => api.get("/modules")),

  getModule: createRetryWrapper((moduleId) => {
    if (!moduleId) throw new Error("Module ID is required");
    return api.get(`/modules/${moduleId}`);
  }),

  getModulesWithProgress: createRetryWrapper(() =>
    api.get("/modules/with-progress")
  ),

  getModulesByArea: createRetryWrapper((area) => {
    if (!area) throw new Error("Area parameter is required");
    return api.get("/modules", { params: { area } });
  }),

  searchModules: createRetryWrapper((query) => {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }
    return api.get("/modules/search", { params: { q: query.trim() } });
  }),
};

/**
 * Competency API
 */
export const competencyAPI = {
  getAllCompetencies: createRetryWrapper(() => api.get("/competencies")),

  getCompetency: createRetryWrapper((competencyId) => {
    if (!competencyId) throw new Error("Competency ID is required");
    return api.get(`/competencies/${competencyId}`);
  }),

  getCompetencyOverview: createRetryWrapper(() =>
    api.get("/competencies/overview")
  ),

  getCompetenciesByArea: createRetryWrapper((area) => {
    if (!area) throw new Error("Area parameter is required");
    return api.get(`/competencies/area/${area.toLowerCase()}`);
  }),

  searchCompetencies: createRetryWrapper((query) => {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }
    return api.get("/competencies/search", { params: { q: query.trim() } });
  }),
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Competency Helper Functions
 */
export const competencyHelpers = {
  formatArea: (area) => {
    const areaMap = {
      a: { code: "A", title: "Begleiten von ICT-Projekten", color: "primary" },
      b: {
        code: "B",
        title: "Betreiben und Erweitern von ICT-Lösungen",
        color: "secondary",
      },
      c: {
        code: "C",
        title: "Aufbauen und Pflegen von digitalen Daten",
        color: "accent",
      },
      d: {
        code: "D",
        title: "Gewährleisten der Informationssicherheit",
        color: "warning",
      },
      e: {
        code: "E",
        title: "Entwickeln und Bereitstellen von ICT-Lösungen",
        color: "info",
      },
      f: {
        code: "F",
        title: "Definieren und Implementieren von ICT-Prozessen",
        color: "success",
      },
      g: { code: "G", title: "Entwickeln von Applikationen", color: "primary" },
      h: {
        code: "H",
        title: "Ausliefern und Betreiben von Applikationen",
        color: "secondary",
      },
    };

    return (
      areaMap[area?.toLowerCase()] || {
        code: area?.toUpperCase() || "?",
        title: `Handlungskompetenzbereich ${
          area?.toUpperCase() || "Unbekannt"
        }`,
        color: "neutral",
      }
    );
  },

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
        title: taxonomy || "Unbekannt",
        description: "Unbekannte Taxonomiestufe",
      }
    );
  },

  calculateCoverageStats: (competencies) => {
    if (!Array.isArray(competencies))
      return { total: 0, covered: 0, uncovered: 0, percentage: 0 };

    const total = competencies.length;
    const covered = competencies.filter((c) => c?.isCovered).length;
    const uncovered = total - covered;
    const percentage = total > 0 ? Math.round((covered / total) * 100) : 0;

    return { total, covered, uncovered, percentage };
  },

  groupByArea: (competencies) => {
    if (!Array.isArray(competencies)) return {};

    return competencies.reduce((groups, competency) => {
      const area = competency?.area?.toUpperCase() || "UNKNOWN";
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(competency);
      return groups;
    }, {});
  },
};

// ========================================
// UTILITY APIS
// ========================================

export const healthAPI = {
  check: createRetryWrapper(() => api.get("/health")),
  ping: createRetryWrapper(() => api.get("/ping")),
};

export const apiHelper = {
  get: createRetryWrapper((url, config) => api.get(url, config)),
  post: createRetryWrapper((url, data, config) => api.post(url, data, config)),
  put: createRetryWrapper((url, data, config) => api.put(url, data, config)),
  patch: createRetryWrapper((url, data, config) =>
    api.patch(url, data, config)
  ),
  delete: createRetryWrapper((url, config) => api.delete(url, config)),
};

export const tokenUtils = {
  isAuthenticated: () => !!TokenManager.getToken(),
  getToken: TokenManager.getToken.bind(TokenManager),
  removeToken: TokenManager.removeToken.bind(TokenManager),
  isTokenExpiring: () => {
    const token = TokenManager.getToken();
    return TokenManager.isTokenExpiringSoon(token);
  },
};

// ========================================
// ERROR HANDLING
// ========================================

export const errorHandler = {
  handleApiError: (error, context = "API Call") => {
    console.error(`${context} failed:`, error);

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

    return this.handleApiError(error, "Network");
  },
};

// ========================================
// DEVELOPMENT UTILITIES
// ========================================

if (import.meta.env.DEV) {
  // Unhandled Promise Rejection Logging
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.isAxiosError) {
      console.error(
        "Unhandled API Error:",
        errorHandler.handleApiError(event.reason)
      );
    }
  });
}

// ========================================
// EXPORTS
// ========================================

export default api;
export { API_CONFIG, TokenManager, RequestQueue };
