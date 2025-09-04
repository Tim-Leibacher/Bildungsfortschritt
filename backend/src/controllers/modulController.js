import Modul from "../models/modulModel.js";

export const getAllModules = async (req, res) => {
  try {
    const modules = await Modul.find();
    res.status(200).json(modules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching modules" });
  }
};
