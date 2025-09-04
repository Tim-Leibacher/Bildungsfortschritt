import dotenv from "dotenv";

class AuthService {
  constructor() {
    dotenv.config();
    this.baseURL = process.env.BASE_URL;
    this.tokenKey = "auth_tokens";
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, ...data };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login service error:", error);
      return { success: false, error: "Network error" };
    }
  }

  async logout() {
    try {
      const tokens = this.getStoredTokens();
      if (tokens.accessToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout service error:", error);
    }
  }

  async getCurrentUser() {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens.accessToken) {
        return { success: false, error: "No access token" };
      }

      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      const data = await response.json();
      return response.ok ? data : { success: false, error: data.error };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, error: "Network error" };
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, tokens: data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      return { success: false, error: "Network error" };
    }
  }

  // Token Management
  storeTokens(tokens) {
    try {
      localStorage.setItem(this.tokenKey, JSON.stringify(tokens));
    } catch (error) {
      console.error("Error storing tokens:", error);
    }
  }

  getStoredTokens() {
    try {
      const tokens = localStorage.getItem(this.tokenKey);
      return tokens ? JSON.parse(tokens) : {};
    } catch (error) {
      console.error("Error getting stored tokens:", error);
      return {};
    }
  }

  clearTokens() {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }
}

export default new AuthService();
