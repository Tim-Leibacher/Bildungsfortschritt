import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", authenticate, authorize("BB"), getAllUsers); // Nur für Berufsbildner
router.get("/:id", authenticate, getUserById);
router.post("/", authenticate, authorize("BB"), createUser);
//TODO: Implement updateUser
//TODO: Implement deleteUser

export default router;
