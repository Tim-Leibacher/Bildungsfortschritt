import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  getAllUsersFromBB,
  getCurrentUser,
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, authorize("BB"), getAllUsers); // Nur für Berufsbildner
router.get("/:id", authenticate, getUserById);
router.post("/", authenticate, authorize("BB"), createUser);
router.get("/me", authenticate, getCurrentUser);
router.get("/bb/users", authenticate, authorize("BB"), getAllUsersFromBB); // Nur für Berufsbildner
//TODO: Implement updateUser
//TODO: Implement deleteUser

export default router;
