import User from "../models/User.js";

export const getAllUsers = async (_, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getAllUsersFromBB = async (req, res) => {
  try {
    // For BB: get their assigned students
    if (req.user.isBB) {
      const students = await User.find({
        berufsbildner: req.user._id,
        isBB: false,
      })
        .select("-password")
        .populate("completedModules.module");

      res.status(200).json(students);
    } else {
      res.status(403).json({ message: "Not authorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("completedModules.module");

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const createUser = async (req, res) => {
  const { email, password, isBB, firstName, lastName, Lehrjahr } = req.body;
  try {
    const newUser = new User({
      email,
      password,
      isBB,
      firstName,
      lastName,
      Lehrjahr,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

//TODO: Implement updateUser
//TODO: Implement deleteUser
