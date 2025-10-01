import express from "express";
import {
  getScheduleByYear,
  getAvailableYears,
  getScheduleByWeeks,
  getScheduleByModule,
  createModuleSchedule,
  updateModuleSchedule,
  deleteModuleSchedule
} from "../controllers/scheduleController.js";
import { verifyToken, isBB } from "../middleware/authJwt.js";

const router = express.Router();

// Öffentliche Routen (keine Authentifizierung erforderlich für Bildungsplan-Ansicht)
router.get("/years", getAvailableYears);
router.get("/year/:year", getScheduleByYear);
router.get("/weeks", getScheduleByWeeks);

// Geschützte Routen für Berufsbildner (BB)
router.get("/module/:moduleId", [verifyToken], getScheduleByModule);
router.post("/module/:moduleId", [verifyToken, isBB], createModuleSchedule);
router.put("/:scheduleId", [verifyToken, isBB], updateModuleSchedule);
router.delete("/:scheduleId", [verifyToken, isBB], deleteModuleSchedule);

export default router;