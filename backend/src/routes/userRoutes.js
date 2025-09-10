import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  getAllUsersFromBB,
  getCurrentUser,
  markModuleAsCompleted,
  unmarkModuleAsCompleted,
  getUserProgress,
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Spezifische Routen MÜSSEN vor parametrischen Routen stehen
router.get("/", authenticate, authorize("BB"), getAllUsers); // Nur für Berufsbildner
router.get("/me", authenticate, getCurrentUser);
router.get("/bb/users", authenticate, authorize("BB"), getAllUsersFromBB); // Nur für Berufsbildner
router.get("/progress/:id?", authenticate, getUserProgress); // MUSS vor /:id stehen
router.post("/complete-module", authenticate, markModuleAsCompleted);
router.post("/uncomplete-module", authenticate, unmarkModuleAsCompleted);

// Allgemeine parametrische Route am Ende
router.get("/:id", authenticate, getUserById);
router.post("/", authenticate, authorize("BB"), createUser);
//TODO: Implement updateUser
//TODO: Implement deleteUser

export default router;
