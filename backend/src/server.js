// backend/src/server.js - Erweitert mit neuen Competency Routes
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

import modulRoutes from "./routes/modulRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import competencyRoutes from "./routes/competencyRoutes.js";
import { connectDB } from "../config/db.js";
import rateLimiter from "../src/middleware/rateLimiter.js";

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
app.use(express.json({ limit: "10mb" })); // JSON Bodies parsen mit höherem Limit
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // URL-encoded Bodies
app.use(cookieParser()); // Cookies parsen

// Rate Limiting nur in Production
if (process.env.NODE_ENV === "production") {
  app.use(rateLimiter);
}

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

// Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/modules", modulRoutes);
app.use("/api/competencies", competencyRoutes); // Erweiterte Competency Routes

// Health Check Endpoint (erweitert)
app.get("/api/health", async (req, res) => {
  try {
    // Einfache Datenbankverbindung testen
    const mongoose = await import("mongoose");
    const dbStatus =
      mongoose.default.connection.readyState === 1
        ? "connected"
        : "disconnected";

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "unknown",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API Documentation Endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Bildungsfortschritt API",
    version: "1.0.0",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register",
        currentUser: "GET /api/auth/me",
      },
      users: {
        profile: "GET /api/user/profile",
        progress: "GET /api/user/progress",
        assignedStudents: "GET /api/user/assigned-students",
        completeModule: "POST /api/user/complete-module",
        uncompleteModule: "POST /api/user/uncomplete-module",
      },
      modules: {
        all: "GET /api/modules",
        byId: "GET /api/modules/:id",
        withProgress: "GET /api/modules/with-progress",
      },
      competencies: {
        all: "GET /api/competencies",
        byId: "GET /api/competencies/:id",
        byArea: "GET /api/competencies/area/:area",
        overview: "GET /api/competencies/overview [BB only]",
      },
    },
  });
});

// Static Files für Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    // Nur für Non-API Routen
    if (!req.url.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    } else {
      res.status(404).json({ message: "API Route not found" });
    }
  });
}

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Unhandled Error:", error);

  // Mongoose Validation Error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Validierungsfehler",
      errors,
    });
  }

  // MongoDB Duplicate Key Error
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Doppelter Eintrag",
      field: Object.keys(error.keyPattern)[0],
    });
  }

  // JWT Error
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Ungültiger Token",
    });
  }

  // Default Error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && {
      stack: error.stack,
      error: error,
    }),
  });
});

// 404 Handler für API Routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route not found",
    availableEndpoints: "/api für Übersicht",
  });
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Datenbankverbindung und Server Start
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log("🚀 ===============================================");
      console.log(`🚀 Server läuft auf PORT: ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 Frontend URL: ${corsOptions.origin}`);
      console.log(`📝 API verfügbar unter: http://localhost:${PORT}/api`);
      console.log(
        `🎯 Leistungsziele API: http://localhost:${PORT}/api/competencies/overview`
      );
      console.log("🚀 ===============================================");
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
      });
    });
  })
  .catch((error) => {
    console.error("❌ Fehler beim Starten des Servers:", error);
    process.exit(1);
  });
