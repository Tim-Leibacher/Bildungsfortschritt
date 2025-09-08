import express from "express";
import {
  getAllCompentencies,
  getCompetenciesByArea,
  createCompetency,
} from "../controllers/compentencyController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getAllCompentencies);
router.get("/area/:area", authenticate, getCompetenciesByArea);
router.post("/", authenticate, authorize("BB"), createCompetency);

export default router;
