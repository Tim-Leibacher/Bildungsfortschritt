import express from "express";
import { verifyToken } from "../middleware/authJwt.js";
import {
  getAllHandlungsziele,
  getHandlungszieleByModule,
  createHandlungsziel,
  updateHandlungsziel,
  deleteHandlungsziel
} from "../controllers/handlungszielController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/handlungsziele - Get all Handlungsziele
router.get("/", getAllHandlungsziele);

// GET /api/handlungsziele/module/:moduleId - Get Handlungsziele for a specific module
router.get("/module/:moduleId", getHandlungszieleByModule);

// POST /api/handlungsziele - Create new Handlungsziel (BB only)
router.post("/", createHandlungsziel);

// PUT /api/handlungsziele/:handlungszielId - Update Handlungsziel (BB only)
router.put("/:handlungszielId", updateHandlungsziel);

// DELETE /api/handlungsziele/:handlungszielId - Delete Handlungsziel (BB only)
router.delete("/:handlungszielId", deleteHandlungsziel);

export default router;