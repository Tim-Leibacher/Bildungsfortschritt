import express from "express";
import {
  getAllPerformanceGoalsWithModules,
  getBandPerformanceGoals,
  assignGoalToModule,
  removeGoalFromModule,
  createBandModule
} from "../controllers/performanceGoalController.js";

import { authJwt } from "../middleware/index.js";

const router = express.Router();

// Alle Leistungsziele mit Modulen (für BB)
router.get("/", [authJwt.verifyToken, authJwt.isBB], getAllPerformanceGoalsWithModules);

// BAND-spezifische Leistungsziele (für BB)
router.get("/band", [authJwt.verifyToken, authJwt.isBB], getBandPerformanceGoals);

// Leistungsziel zu Modul zuordnen (für BB)
router.post("/assign", [authJwt.verifyToken, authJwt.isBB], assignGoalToModule);

// Leistungsziel von Modul entfernen (für BB)
router.delete("/assign", [authJwt.verifyToken, authJwt.isBB], removeGoalFromModule);

// Neues BAND-Modul erstellen (für BB)
router.post("/modules", [authJwt.verifyToken, authJwt.isBB], createBandModule);

export default router;