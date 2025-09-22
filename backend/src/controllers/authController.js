import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const handleError = (res, error, statusCode = 500) => {
  return res.status(statusCode).send({ message: error.message || error });
};

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    allowInsecureKeySizes: true,
    expiresIn: 3600,
  });
};

export const signup = async (req, res) => {
  try {
    const { username, email, password, roles: requestedRoles } = req.body;

    const user = new db.user({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    });

    const savedUser = await user.save();

    let roles;

    if (requestedRoles && requestedRoles.length > 0) {
      roles = await db.role.find({ name: { $in: requestedRoles } });
    } else {
      const defaultRole = await db.role.findOne({ name: "user" });
      roles = [defaultRole];
    }
    if (!roles || roles.lenght === 0) {
      return handleError(res, new Error("Roles not found", 404));
    }

    const result = await saveUserWithRoles(savedUser, roles);
    res.status(201).send(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.user.findOne({ username }).populate("roles", "-__v");

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password" });
    }

    const token = createToken(user.id);

    const authorities = user.roles.map(
      (role) => `ROLE_${role.name.toUpperCase()}`
    );

    req.session.token = token;

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const signout = async (req, res) => {
  try {
    req.session = null;
    res.status(200).send({ message: "You've been signed out!" });
  } catch (error) {
    handleError(res, error);
  }
};
