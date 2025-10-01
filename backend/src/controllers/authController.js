import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const User = db.user;
const Role = db.role;

export const register = async (req, res) => {
  try {
    // Create new user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userData = {
      email: req.body.email,
      password: hashedPassword,
    };

    // Add coach if provided
    if (req.body.coachId) {
      // Verify coach exists and is a BB
      const coach = await User.findByPk(req.body.coachId);
      if (!coach) {
        return res.status(400).json({ message: "Coach not found" });
      }

      const coachRoles = await coach.getRoles();
      const isBB = coachRoles.some(role => role.name === "bb");
      if (!isBB) {
        return res.status(400).json({ message: "Selected coach is not a Berufsbildner" });
      }

      userData.coach_id = req.body.coachId;
    }

    const user = await User.create(userData);

    // Neue Benutzer sind standardmäßig Lernende (keine explizite Rolle)
    // await user.setRoles([]);  // Nicht nötig, da bereits leer

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    // Validate password
    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Login!",
      });
    }

    // Get user roles
    const roles = await user.getRoles();
    const authorities = roles.map((role) => `ROLE_${role.name.toUpperCase()}`);
    const roleNames = roles.map((role) => role.name);

    // Generate JWT with roles
    const token = jwt.sign({
      id: user.id,
      roles: roleNames
    }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "24h",
    });

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TODO: Implement password update functionality when needed
// export const updatePassword = async (req, res) => {
//   // Implement proper password update with validation
// };

export const logout = (req, res) => {
  req.session = null;
  res.status(200).json({ message: "Logged out successfully!" });
};
