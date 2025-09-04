import User from "../models/User";
import { generateAccessToken } from "../util/jwt";

export const register = async (req, res) => {
  try {
    const { email, password, isBB, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      isBB: isBB || false,
    });
    await user.save();

    const accesToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    });
    const userRespone = user.toObject();
    delete userRespone.password;
    res.status(201).json({
      user: userRespone,
      accesToken,
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User finden
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }

    // Passwort prüfen
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }

    // Tokens generieren
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Refresh Token als Cookie setzen
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // User-Daten ohne Passwort zurückgeben
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    console.error("Login-Fehler:", error);
    res.status(500).json({ message: "Server-Fehler beim Login" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token fehlt" });
    }

    // Refresh Token verifizieren
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User nicht gefunden" });
    }

    // Neuen Access Token generieren
    const newAccessToken = generateAccessToken(user._id);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh Token Fehler:", error);
    res.status(401).json({ message: "Ungültiger Refresh Token" });
  }
};

export const logout = async (_, res) => {
  // Refresh Token Cookie löschen
  res.clearCookie("refreshToken");
  res.json({ message: "Erfolgreich abgemeldet" });
};
