import express from "express";
import { verifyToken } from "../middleware/authJwt.js";
import {
  getAllLBs,
  getLBsByModule,
  createLB,
  updateLB,
  deleteLB
} from "../controllers/lbController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/lbs - Get all LBs
router.get("/", getAllLBs);

// GET /api/lbs/module/:moduleId - Get LBs for a specific module
router.get("/module/:moduleId", getLBsByModule);

// POST /api/lbs - Create new LB (BB only)
router.post("/", createLB);

// PUT /api/lbs/:lbId - Update LB (BB only)
router.put("/:lbId", updateLB);

// DELETE /api/lbs/:lbId - Delete LB (BB only)
router.delete("/:lbId", deleteLB);

export default router;