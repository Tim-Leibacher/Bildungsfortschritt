import db from "../models/index.js";

export const getAllHandlungsziele = async (req, res) => {
  try {
    const handlungsziele = await db.handlungsziel.findAll({
      include: [
        {
          model: db.competency,
          as: "competency",
          attributes: ["id", "code", "title", "area", "areaTitle"]
        },
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ],
      order: [["module_id", "ASC"], ["id", "ASC"]]
    });

    res.status(200).json(handlungsziele);
  } catch (error) {
    console.error("Error fetching handlungsziele:", error);
    res.status(500).json({ message: "Error fetching handlungsziele" });
  }
};

export const getHandlungszieleByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const handlungsziele = await db.handlungsziel.findAll({
      where: { module_id: moduleId },
      include: [
        {
          model: db.competency,
          as: "competency",
          attributes: ["id", "code", "title", "area", "areaTitle"]
        }
      ],
      order: [["id", "ASC"]]
    });

    res.status(200).json(handlungsziele);
  } catch (error) {
    console.error("Error fetching handlungsziele for module:", error);
    res.status(500).json({ message: "Error fetching handlungsziele for module" });
  }
};

export const createHandlungsziel = async (req, res) => {
  try {
    const { name, competency_id, module_id, notwendige_kenntnisse } = req.body;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    // Validate that the module is BFS or ÜK type
    const module = await db.modul.findByPk(module_id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    if (!["BFS", "ÜK"].includes(module.type)) {
      return res.status(400).json({
        message: "Handlungsziele can only be created for BFS or ÜK modules"
      });
    }

    // Validate competency exists
    const competency = await db.competency.findByPk(competency_id);
    if (!competency) {
      return res.status(404).json({ message: "Competency not found" });
    }

    const handlungsziel = await db.handlungsziel.create({
      name,
      competency_id,
      module_id,
      notwendige_kenntnisse: notwendige_kenntnisse || []
    });

    const createdHandlungsziel = await db.handlungsziel.findByPk(handlungsziel.id, {
      include: [
        {
          model: db.competency,
          as: "competency",
          attributes: ["id", "code", "title", "area", "areaTitle"]
        },
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ]
    });

    res.status(201).json({
      message: "Handlungsziel created successfully",
      handlungsziel: createdHandlungsziel
    });
  } catch (error) {
    console.error("Error creating handlungsziel:", error);
    res.status(500).json({ message: "Error creating handlungsziel" });
  }
};

export const updateHandlungsziel = async (req, res) => {
  try {
    const { handlungszielId } = req.params;
    const { name, competency_id, notwendige_kenntnisse } = req.body;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    const handlungsziel = await db.handlungsziel.findByPk(handlungszielId);
    if (!handlungsziel) {
      return res.status(404).json({ message: "Handlungsziel not found" });
    }

    // If competency_id is being updated, validate it exists
    if (competency_id && competency_id !== handlungsziel.competency_id) {
      const competency = await db.competency.findByPk(competency_id);
      if (!competency) {
        return res.status(404).json({ message: "Competency not found" });
      }
    }

    await handlungsziel.update({
      name: name || handlungsziel.name,
      competency_id: competency_id || handlungsziel.competency_id,
      notwendige_kenntnisse: notwendige_kenntnisse !== undefined ? notwendige_kenntnisse : handlungsziel.notwendige_kenntnisse
    });

    const updatedHandlungsziel = await db.handlungsziel.findByPk(handlungszielId, {
      include: [
        {
          model: db.competency,
          as: "competency",
          attributes: ["id", "code", "title", "area", "areaTitle"]
        },
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ]
    });

    res.status(200).json({
      message: "Handlungsziel updated successfully",
      handlungsziel: updatedHandlungsziel
    });
  } catch (error) {
    console.error("Error updating handlungsziel:", error);
    res.status(500).json({ message: "Error updating handlungsziel" });
  }
};

export const deleteHandlungsziel = async (req, res) => {
  try {
    const { handlungszielId } = req.params;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    const handlungsziel = await db.handlungsziel.findByPk(handlungszielId);
    if (!handlungsziel) {
      return res.status(404).json({ message: "Handlungsziel not found" });
    }

    await handlungsziel.destroy();

    res.status(200).json({
      message: "Handlungsziel deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting handlungsziel:", error);
    res.status(500).json({ message: "Error deleting handlungsziel" });
  }
};