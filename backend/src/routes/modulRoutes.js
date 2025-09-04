import express from "express";
import { getAllModules } from "../controllers/modulController.js";
const router = express.Router();

router.get("/", getAllModules);

export default router;
