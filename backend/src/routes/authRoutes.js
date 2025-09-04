// routes/authRoutes.js - neue Datei
import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Öffentliche Routen
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Geschützte Routen
router.post("/logout", authenticate, logout);

// Test-Route für geschützte Bereiche
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
