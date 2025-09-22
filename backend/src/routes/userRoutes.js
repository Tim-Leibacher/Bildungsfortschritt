import express from "express";
import authJwt from "../middleware/authJwt.js";
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

const router = express.Router();

// Spezifische Routen MÜSSEN vor parametrischen Routen stehen
router.get("/", [authJwt.verifyToken], getAllUsers);
router.get("/me", getCurrentUser);
router.get("/bb/users", getAllUsersFromBB); // Nur für Berufsbildner
router.get("/progress/:id?", getUserProgress); // MUSS vor /:id stehen
router.post("/complete-module", markModuleAsCompleted);
router.post("/uncomplete-module", unmarkModuleAsCompleted);

// Allgemeine parametrische Route am Ende
router.get("/:id", getUserById);
router.post("/", createUser);
//TODO: Implement updateUser
//TODO: Implement deleteUser

export default router;
