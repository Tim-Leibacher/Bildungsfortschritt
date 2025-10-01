import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieSession from "cookie-session";

// Active routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import moduleRoutes from "./routes/modulRoutes.js";
import competencyRoutes from "./routes/competencyRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import performanceGoalRoutes from "./routes/performanceGoalRoutes.js";
import handlungszielRoutes from "./routes/handlungszielRoutes.js";
import leistungszielRoutes from "./routes/leistungszielRoutes.js";
import lbRoutes from "./routes/lbRoutes.js";
import db from "./models/index.js";

dotenv.config();

const initializeRoles = async () => {
  const roles = ["bb"]; // Nur Berufsbildner als explizite Rolle
  for (const role of roles) {
    await db.role.findOrCreate({
      where: { name: role },
    });
  }
};

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const corsOptions = {
  origin: "*", // Allow all origins for debugging
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json()); // JSON Bodies (wichtig für API!)
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
app.use("/api/users", userRoutes);

app.use("/api/modules", moduleRoutes);
app.use("/api/competencies", competencyRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/performance-goals", performanceGoalRoutes);
app.use("/api/handlungsziele", handlungszielRoutes);
app.use("/api/leistungsziele", leistungszielRoutes);
app.use("/api/lbs", lbRoutes);

// Datenbankverbindung und Server Start
db.sequelize
  .sync()
  .then(async () => {
    await initializeRoles();
    console.log("PostgreSQL Datenbankverbindung erfolgreich hergestellt!");
  })
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
