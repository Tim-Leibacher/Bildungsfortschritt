import jwt from "jsonwebtoken";
import db from "../models/index.js";

const User = db.user;
const Role = db.role;

export const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    console.log("❌ No token provided");
    return res.status(403).json({ message: "No token provided!" });
  }

  const actualToken = token.startsWith("Bearer ")
    ? token.slice(7, token.length)
    : token;

  jwt.verify(actualToken, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ JWT verification failed:", err.message);
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.user = { id: decoded.id };
    console.log("✅ Token verified for user ID:", decoded.id);
    next();
  });
};

export const checkUserRole = async (req, res, next, requiredRole) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const roles = await user.getRoles();
    const hasRequiredRole = roles.some((role) => role.name === requiredRole);

    if (hasRequiredRole) {
      next();
    } else {
      res.status(403).send({ message: `${requiredRole} Access required` });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export const isBB = (req, res, next) => checkUserRole(req, res, next, "bb");

// Helper function to check if user is a Lernender (has no roles)
export const isLernender = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const roles = await user.getRoles();
    const hasNoRoles = roles.length === 0;

    if (hasNoRoles) {
      next();
    } else {
      res.status(403).send({ message: "Lernender access required" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export default {
  verifyToken,
  checkUserRole,
  isBB,
  isLernender,
};
