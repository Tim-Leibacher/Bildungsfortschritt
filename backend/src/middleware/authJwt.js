import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";

const verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) return res.status(403).send({ message: "No token provided!" });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!", //TODO Unauthorized Site
      });
    }

    req.userId = decoded.id;
    next();
  });
};

export const checkUserRole = async (req, res, next, requiredRole) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const roles = await Role.find({ _id: { $in: user.roles } });
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

export const isAdmin = (req, res, next) =>
  checkUserRole(req, res, next, "admin");
export const isModerator = (req, res, next) =>
  checkUserRole(req, res, next, "moderator");

export default {
  verifyToken,
  checkUserRole,
  isAdmin,
  isModerator,
};
