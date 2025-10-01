// app/routes/auth.routes.js
import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { verifyRegister } from "../middleware/index.js";

const router = express.Router();

// Register Route
router.post(
  "/register",
  [
    verifyRegister.checkDuplicateUsernameOrEmail,
    verifyRegister.checkRolesExisted,
  ],
  register
);

// Signin Route
router.post("/signin", login);

// TODO: Implement password update when needed
// router.post("/update", verifyToken, updatePassword);

router.get("/logout", logout);

export default router;
