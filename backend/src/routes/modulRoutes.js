import express from "express";
import {
  getAllModules,
  getModulesWithProgress,
} from "../controllers/modulController.js";

const router = express.Router();

router.get("/", getAllModules); // Public route for all modules
router.get("/with-progress", getModulesWithProgress);

export default router;
