import Compentency from "../models/Compentency.js";

export const getAllCompentencies = async (req, res) => {
  try {
    const compentencies = await Compentency.find().sort({ area: 1, code: 1 });
    res.status(200).json(compentencies);
  } catch (error) {
    console.error("Error fetching compentencies:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCompetenciesByArea = async (req, res) => {
  try {
    const { area } = req.params;
    const competencies = await Compentency.find({ area }).sort({ code: 1 });
    res.status(200).json(competencies);
  } catch (error) {
    console.error("Error fetching competencies by area:", error);
    res.status(500).json({ message: "Error fetching competencies by area" });
  }
};

export const createCompetency = async (req, res) => {
  try {
    const { code, description, area } = req.body;
    if (!code || !description || !area) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCompetency = new Compentency({ code, description, area });
    await newCompetency.save();
    res.status(201).json(newCompetency);
  } catch (error) {
    console.error("Error creating competency:", error);
    res.status(500).json({ message: "Error creating competency" });
  }
};
