// backend/src/routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import {
  registerValidation,
  loginValidation,
  checkValidation,
} from "../middleware/validation.js";

const router = express.Router();

// Registrierung mit Validierung
router.post("/register", registerValidation, checkValidation, register);

// Login mit Validierung
router.post("/login", loginValidation, checkValidation, login);

// Logout (kein Validierung erforderlich)
router.post("/logout", logout);

// Token refresh (kein Body-Validierung erforderlich)
router.post("/refresh", refreshToken);

// Aktueller User (authentifiziert)
router.get("/me", authenticate, getCurrentUser);

export default router;
