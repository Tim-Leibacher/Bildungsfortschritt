import Modul from "../models/Modul.js";
import User from "../models/User.js";

export const getAllModules = async (req, res) => {
  try {
    const modules = await Modul.find();
    res.status(200).json(modules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching modules" });
  }
};

export const getModulesWithProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all modules
    const modules = await Modul.find().populate("competencies");

    // Get user's completed modules
    const user = await User.findById(userId).select("completedModules");
    const completedModuleIds = user.completedModules.map((cm) =>
      cm.module.toString()
    );

    // Add completion status to each module
    const modulesWithStatus = modules.map((module) => ({
      ...module.toObject(),
      completed: completedModuleIds.includes(module._id.toString()),
      completedAt:
        user.completedModules.find(
          (cm) => cm.module.toString() === module._id.toString()
        )?.completedAt || null,
    }));

    res.status(200).json(modulesWithStatus);
  } catch (error) {
    console.error("Error fetching modules with progress:", error);
    res.status(500).json({ message: "Error fetching modules with progress" });
  }
};
