import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieSession from "cookie-session";

import modulRoutes from "./routes/modulRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import competencyRoutes from "./routes/competencyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.urlencoded({ extended: true })); // URL-encoded Bodies
app.use(
  cookieSession({
    name: "bildungsfortschritt",
    keys: [process.env.JWT_ACCESS_SECRET],
    httpOnly: true,
  })
);

// Request Logging für Development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Log request body für POST/PUT requests (ohne sensible Daten)
    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = "[REDACTED]";
      console.log("Request Body:", JSON.stringify(sanitizedBody, null, 2));
    }
    next();
  });
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/modules", modulRoutes);
app.use("/api/competencies", competencyRoutes); // Erweiterte Competency Routes

// Datenbankverbindung und Server Start
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log("===============================================");
      console.log(`Server läuft auf PORT: ${PORT}`);
      console.log(`Frontend URL: ${corsOptions.origin}`);
      console.log(`API verfügbar unter: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error("Fehler beim Starten des Servers:", error);
    process.exit(1);
  });
