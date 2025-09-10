import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

// Variable to track refresh attempts and prevent loops
let isRefreshing = false;
let failedQueue = [];

// Helper function to process failed requests queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");
        const newToken = response.data.accessToken;

        // Update token in localStorage
        localStorage.setItem("accessToken", newToken);

        // Process the failed queue
        processQueue(null, newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear everything and redirect
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");

        // Only redirect if we're not already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get("/user/me"),
  getAssignedStudents: () => api.get("/user/bb/users"),
  getUserProgress: (userId) => api.get(`/user/progress/${userId || ""}`),
  markModuleAsCompleted: (moduleId) =>
    api.post("/user/complete-module", { moduleId }),
  unmarkModuleAsCompleted: (moduleId) =>
    api.post("/user/uncomplete-module", { moduleId }),
};

// Module API
export const moduleAPI = {
  getAllModules: () => api.get("/modules"),
  getModulesWithProgress: () => api.get("/modules/with-progress"),
};

// Competency API
export const competencyAPI = {
  getAllCompetencies: () => api.get("/competencies"),
  getCompetenciesByArea: (area) => api.get(`/competencies/area/${area}`),
};

export default api;
