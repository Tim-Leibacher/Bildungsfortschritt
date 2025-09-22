import db from "../models/index.js";

const { ROLES, user: User } = db;

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    if (req.body.username) {
      const existingUsername = await User.findOne({
        username: req.body.username,
      });

      if (existingUsername) {
        return res.status(400).json({
          message: "Fehler! Benutzername ist bereits vergeben!",
        });
      }
    }

    // Email
    const existingEmail = await User.findOne({
      email: req.body.email,
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Fehler! E-Mail ist bereits vergeben!",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: `Serverfehler: ${error.message}`,
    });
  }
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return res.status(400).json({
          message: `Fehler! Rolle ${req.body.roles[i]} existiert nicht!`,
        });
      }
    }
  }

  next();
};

export const verifySignup = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
};

export default verifySignup;
