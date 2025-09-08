import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

import modulRoutes from "./routes/modulRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "../config/db.js";
import rateLimiter from "../src/middleware/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import competencyRoutes from "./routes/competencyRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// CORS-Konfiguration (verbessert)
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || false
      : "http://localhost:5173",
  credentials: true, // Wichtig für Cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json()); // JSON Bodies parsen
app.use(cookieParser()); // Cookies parsen

// Rate Limiting nur in Production
if (process.env.NODE_ENV === "production") {
  app.use(rateLimiter);
}

// Request Logging für Development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/modules", modulRoutes);
app.use("/api/competencies", competencyRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Static Files für Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Error Handler
app.use((error, req, res, next) => {
  console.error("Unhandled Error:", error);
  res.status(500).json({
    message: "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { error: error.message }),
  });
});

// 404 Handler für API Routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API Route not found" });
});

// Datenbankverbindung und Server Start
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf PORT: ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 Frontend URL: ${corsOptions.origin}`);
      console.log(`📝 API verfügbar unter: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error("❌ Fehler beim Starten des Servers:", error);
    process.exit(1);
  });
