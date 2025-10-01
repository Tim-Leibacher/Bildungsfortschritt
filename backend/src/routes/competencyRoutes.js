import express from "express";
import { getAllCompetencies, getCompetenciesByArea } from "../controllers/competencyController.js";

const router = express.Router();

// GET /api/competencies - Alle Kompetenzen
router.get("/", getAllCompetencies);

// GET /api/competencies/area/:area - Kompetenzen nach Bereich
router.get("/area/:area", getCompetenciesByArea);

export default router;