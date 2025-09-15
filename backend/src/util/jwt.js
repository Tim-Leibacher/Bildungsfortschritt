// backend/src/util/jwt.js
import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "1h",
    issuer: process.env.JWT_ISSUER || "bildungsfortschritt-app",
    audience: process.env.JWT_AUDIENCE?.split(",") || ["web-app"],
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    issuer: process.env.JWT_ISSUER || "bildungsfortschritt-app",
    audience: process.env.JWT_AUDIENCE?.split(",") || ["web-app"],
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: process.env.JWT_ISSUER || "bildungsfortschritt-app",
    audience: process.env.JWT_AUDIENCE?.split(",") || ["web-app"],
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: process.env.JWT_ISSUER || "bildungsfortschritt-app",
    audience: process.env.JWT_AUDIENCE?.split(",") || ["web-app"],
  });
};
