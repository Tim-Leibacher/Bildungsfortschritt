import express from "express";
import {
  getAllModules,
  getModulesWithProgress,
} from "../controllers/modulController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllModules); // Public route for all modules
router.get("/with-progress", authenticate, getModulesWithProgress); // Authenticated route with progress

export default router;
