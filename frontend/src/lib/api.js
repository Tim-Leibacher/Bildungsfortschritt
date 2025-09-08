import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

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
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const response = await api.post("/auth/refresh");
        const newToken = response.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
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
  getAssignedStudents: () => api.get("/user/bb/users"), // For Berufsbildner
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
