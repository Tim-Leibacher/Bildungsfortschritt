// backend/src/controllers/authController.js
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../util/jwt.js";
import { normalizeGermanEmail } from "../middleware/validation.js";

export const register = async (req, res) => {
  try {
    let { email, password, isBB, firstName, lastName, lehrjahr } = req.body;

    // Normalisiere E-Mail für deutsche Umlaute
    email = normalizeGermanEmail(email);

    // Prüfe ob User bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
      });
    }

    // Erstelle neuen User
    const user = new User({
      email,
      password,
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      isBB: isBB || false,
      lehrjahr,
    });

    await user.save();

    // Generiere Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Setze Refresh Token als HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    });

    // Entferne Passwort aus Response (automatisch durch toJSON)
    const userResponse = user.toJSON();

    res.status(201).json({
      message: "Benutzer erfolgreich registriert",
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    console.error("Registrierungsfehler:", error);

    // Spezifische Fehlerbehandlung für Validierungsfehler
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        message: "Validierungsfehler",
        errors: validationErrors,
      });
    }

    // MongoDB Duplicate Key Error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
      });
    }

    return res.status(500).json({
      message: "Interner Serverfehler bei der Registrierung",
    });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validiere Input
    if (!email || !password) {
      return res.status(400).json({
        message: "E-Mail und Passwort sind erforderlich",
      });
    }

    // Normalisiere E-Mail
    email = normalizeGermanEmail(email);

    // User finden (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: "Ungültige E-Mail-Adresse oder Passwort",
      });
    }

    // Passwort prüfen
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Ungültige E-Mail-Adresse oder Passwort",
      });
    }

    // Tokens generieren
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Refresh Token als Cookie setzen
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    });

    // User-Daten ohne Passwort zurückgeben (automatisch durch toJSON)
    const userResponse = user.toJSON();

    res.json({
      message: "Erfolgreich angemeldet",
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    console.error("Login-Fehler:", error);
    res.status(500).json({
      message: "Interner Serverfehler beim Login",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh Token fehlt",
      });
    }

    // Refresh Token verifizieren
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Benutzer nicht gefunden",
      });
    }

    // Neuen Access Token generieren
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      accessToken: newAccessToken,
      message: "Token erfolgreich erneuert",
    });
  } catch (error) {
    console.error("Refresh Token Fehler:", error);

    // Cookie löschen bei ungültigem Token
    res.clearCookie("refreshToken");

    res.status(401).json({
      message: "Ungültiger oder abgelaufener Refresh Token",
    });
  }
};

export const logout = async (_, res) => {
  try {
    // Refresh Token Cookie löschen
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      message: "Erfolgreich abgemeldet",
    });
  } catch (error) {
    console.error("Logout-Fehler:", error);
    res.status(500).json({
      message: "Fehler beim Abmelden",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // User ist bereits durch authenticate middleware verfügbar
    const user = await User.findById(req.user._id).populate({
      path: "completedModules.module",
      populate: {
        path: "competencies",
        model: "Competency",
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Benutzer nicht gefunden",
      });
    }

    // Passwort wird automatisch durch toJSON entfernt
    res.json(user.toJSON());
  } catch (error) {
    console.error("Fehler beim Abrufen des aktuellen Benutzers:", error);
    res.status(500).json({
      message: "Fehler beim Abrufen der Benutzerdaten",
    });
  }
};
