import User from "../models/User.js";
import Modul from "../models/Modul.js";
import Competency from "../models/Competency.js";

export const getAllUsers = async (_, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getAllUsersFromBB = async (req, res) => {
  try {
    if (!req.user.isBB) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const students = await User.find({
      berufsbildner: req.user._id,
      isBB: false,
    })
      .select("-password")
      .populate({
        path: "completedModules.module",
        populate: {
          path: "competencies",
          model: "Competency",
        },
      });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "completedModules.module",
        populate: {
          path: "competencies",
          model: "Competency",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const createUser = async (req, res) => {
  const { email, password, isBB, firstName, lastName, lehrjahr } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      password,
      isBB,
      firstName,
      lastName,
      lehrjahr,
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const markModuleAsCompleted = async (req, res) => {
  try {
    const { moduleId } = req.body;
    const userId = req.user._id;

    if (!moduleId) {
      return res.status(400).json({ message: "Module ID is required" });
    }

    const moduleExists = await Modul.findById(moduleId);
    if (!moduleExists) {
      return res.status(404).json({ message: "Module not found" });
    }

    const user = await User.findById(userId);
    const alreadyCompleted = user.completedModules.some(
      (cm) => cm.module.toString() === moduleId
    );

    if (alreadyCompleted) {
      return res
        .status(400)
        .json({ message: "Module already marked as completed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          completedModules: { module: moduleId, completedAt: new Date() },
        },
      },
      { new: true }
    ).populate({
      path: "completedModules.module",
      populate: {
        path: "competencies",
        model: "Competency",
      },
    });

    res.status(200).json({
      message: "Module marked as completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error marking module as completed:", error);
    res.status(500).json({ message: "Error marking module as completed" });
  }
};

export const unmarkModuleAsCompleted = async (req, res) => {
  try {
    const { moduleId } = req.body;
    const userId = req.user._id;

    if (!moduleId) {
      return res.status(400).json({ message: "Module ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          completedModules: { module: moduleId },
        },
      },
      { new: true }
    ).populate({
      path: "completedModules.module",
      populate: {
        path: "competencies",
        model: "Competency",
      },
    });

    res.status(200).json({
      message: "Module unmarked as completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error unmarking module:", error);
    res.status(500).json({ message: "Error unmarking module as completed" });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = id || req.user._id;

    // Authorization check: Users can only see their own progress,
    // BBs can see progress of their assigned students
    if (id && req.user._id.toString() !== id && !req.user.isBB) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this user's progress" });
    }

    // Get user with populated completed modules and competencies
    const user = await User.findById(userId)
      .populate({
        path: "completedModules.module",
        populate: {
          path: "competencies",
          model: "Competency",
        },
      })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If BB is requesting another user's progress, check if they're assigned
    if (req.user.isBB && id && req.user._id.toString() !== id) {
      const isAssigned = user.berufsbildner.some(
        (bbId) => bbId.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this user's progress" });
      }
    }

    // Get all competencies grouped by area
    const allCompetencies = await Competency.find().sort({
      area: 1,
      code: 1,
    });

    const competencyAreas = allCompetencies.reduce((acc, comp) => {
      if (!acc[comp.area]) {
        acc[comp.area] = [];
      }
      acc[comp.area].push(comp);
      return acc;
    }, {});

    // Calculate progress for each competency area
    const progressByArea = {};

    // Get all completed competency IDs
    const completedCompetencyIds = new Set();
    user.completedModules.forEach((cm) => {
      if (cm.module && cm.module.competencies) {
        cm.module.competencies.forEach((comp) => {
          completedCompetencyIds.add(comp._id.toString());
        });
      }
    });

    // Calculate progress per area
    Object.keys(competencyAreas).forEach((area) => {
      const competenciesInArea = competencyAreas[area];
      const completedInArea = competenciesInArea.filter((comp) =>
        completedCompetencyIds.has(comp._id.toString())
      ).length;

      const totalInArea = competenciesInArea.length;
      const progressPercent =
        totalInArea > 0 ? (completedInArea / totalInArea) * 100 : 0;

      progressByArea[area] = {
        completed: completedInArea,
        total: totalInArea,
        percentage: Math.round(progressPercent),
        competencies: competenciesInArea.map((comp) => ({
          ...comp.toObject(),
          completed: completedCompetencyIds.has(comp._id.toString()),
        })),
      };
    });

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        lehrjahr: user.lehrjahr,
        completedModules: user.completedModules,
      },
      progress: progressByArea,
      overallProgress: {
        completed: completedCompetencyIds.size,
        total: allCompetencies.length,
        percentage:
          allCompetencies.length > 0
            ? Math.round(
                (completedCompetencyIds.size / allCompetencies.length) * 100
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Error getting user progress:", error);
    res.status(500).json({ message: "Error fetching user progress" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Users can only update themselves, BBs can update their assigned students
    if (req.user._id.toString() !== id && !req.user.isBB) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Don't allow password updates through this endpoint
    delete updates.password;
    delete updates._id;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only BBs can delete users
    if (!req.user.isBB) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
