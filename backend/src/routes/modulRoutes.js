import express from "express";
import {
  getAllModules,
  getModulesWithProgress,
  updateModuleProgress,
  getModuleById,
  getModuleStudents,
  updateStudentModuleProgress,
  updateModule,
} from "../controllers/modulController.js";
import { verifyToken } from "../middleware/authJwt.js";

const router = express.Router();

router.get("/", getAllModules); // Public route for all modules
router.get("/with-progress", [verifyToken], getModulesWithProgress);
router.get("/:moduleId", [verifyToken], getModuleById);
router.get("/:moduleId/students", [verifyToken], getModuleStudents);
router.put("/:moduleId/progress", [verifyToken], updateModuleProgress);
router.put("/:moduleId/students/:studentId/progress", [verifyToken], updateStudentModuleProgress);
router.put("/:moduleId", [verifyToken], updateModule);

export default router;
