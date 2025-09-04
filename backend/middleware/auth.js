// middleware/auth.js - neue Datei
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    // Token aus Authorization Header extrahieren
    const authHeader = req.header("Authorization");
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Zugang verweigert - Token fehlt" });
    }

    // Token verifizieren
    const decoded = verifyAccessToken(token);

    // User aus Datenbank laden (ohne Passwort)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Token ungültig - User nicht gefunden" });
    }

    // User zu req hinzufügen für weitere Verwendung
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentifizierungsfehler:", error);
    res.status(401).json({ message: "Token ungültig" });
  }
};

// Middleware für rollenbasierte Berechtigung
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Authentifizierung erforderlich" });
    }

    // Hier können Sie je nach Ihrer Rollenlogik prüfen
    // Zum Beispiel: isBB für Berufsbildner
    if (roles.includes("BB") && !req.user.isBB) {
      return res
        .status(403)
        .json({ message: "Berechtigung verweigert - BB-Rolle erforderlich" });
    }

    next();
  };
};
