import jwt from "jsonwebtoken";
import { prommisify } from "util";

class JWTService {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is required");
    }

    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || "24h";
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

    // Promisify für async/await
    this.signAsync = promisify(jwt.sign);
    this.verifyAsync = promisify(jwt.verify);
  }

  async generateTokenPair(payload) {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      isBB: payload.isBB,
      // Niemals sensible Daten wie Passwort!
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signAsync(tokenPayload, this.secret, {
        expiresIn: this.expiresIn,
        issuer: "bildungsapp",
        subject: payload.id,
      }),
      this.signAsync({ id: payload.id }, this.secret, {
        expiresIn: this.refreshExpiresIn,
        issuer: "bildungsapp",
        subject: payload.id,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyToken(token) {
    try {
      const decoded = await this.verifyAsync(token, this.secret);
      return { success: true, payload: decoded };
    } catch (error) {
      return {
        success: false,
        error: error.name === "TokenExpiredError" ? "EXPIRED" : "INVALID",
      };
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}

export default new JWTService();
