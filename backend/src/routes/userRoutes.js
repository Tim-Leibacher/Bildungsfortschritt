import express from "express";
import {
  allAccess,
  userBoard,
  bbBoard,
  getAllBBs,
  getAllStudents,
  getMyStudents,
} from "../controllers/userController.js";
import { authJwt } from "../middleware/index.js";

const router = express.Router();

// Public Route
router.get("/all", allAccess);

// Public Route für BB-Liste (für Registrierung)
router.get("/bbs", getAllBBs);

// User Route
router.get("/user", [authJwt.verifyToken], userBoard);

// Berufsbildner Route (ersetzt Moderator)
router.get("/bb", [authJwt.verifyToken, authJwt.isBB], bbBoard);

// Student Routes für BBs
router.get("/students/all", [authJwt.verifyToken, authJwt.isBB], getAllStudents);
router.get("/students/mine", [authJwt.verifyToken, authJwt.isBB], getMyStudents);

export default router;
