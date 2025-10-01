import express from "express";
import { verifyToken } from "../middleware/authJwt.js";
import {
  getAllLeistungsziele,
  getLeistungszieleByModule,
  getLeistungszieleByCompetencyArea,
  createLeistungsziel,
  updateLeistungsziel,
  deleteLeistungsziel
} from "../controllers/leistungszielController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/leistungsziele - Get all Leistungsziele
router.get("/", getAllLeistungsziele);

// GET /api/leistungsziele/module/:moduleId - Get Leistungsziele for a specific module
router.get("/module/:moduleId", getLeistungszieleByModule);

// GET /api/leistungsziele/competency/:competencyArea - Get Leistungsziele for a competency area
router.get("/competency/:competencyArea", getLeistungszieleByCompetencyArea);

// POST /api/leistungsziele - Create new Leistungsziel (BB only)
router.post("/", createLeistungsziel);

// PUT /api/leistungsziele/:leistungszielId - Update Leistungsziel (BB only)
router.put("/:leistungszielId", updateLeistungsziel);

// DELETE /api/leistungsziele/:leistungszielId - Delete Leistungsziel (BB only)
router.delete("/:leistungszielId", deleteLeistungsziel);

export default router;