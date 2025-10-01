import db from "../models/index.js";

export const getAllLeistungsziele = async (req, res) => {
  try {
    const leistungsziele = await db.leistungsziel.findAll({
      include: [
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ],
      order: [["competency_area", "ASC"], ["sequence_number", "ASC"]]
    });

    res.status(200).json(leistungsziele);
  } catch (error) {
    console.error("Error fetching leistungsziele:", error);
    res.status(500).json({ message: "Error fetching leistungsziele" });
  }
};

export const getLeistungszieleByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const leistungsziele = await db.leistungsziel.findAll({
      where: { module_id: moduleId },
      order: [["competency_area", "ASC"], ["sequence_number", "ASC"]]
    });

    res.status(200).json(leistungsziele);
  } catch (error) {
    console.error("Error fetching leistungsziele for module:", error);
    res.status(500).json({ message: "Error fetching leistungsziele for module" });
  }
};

export const getLeistungszieleByCompetencyArea = async (req, res) => {
  try {
    const { competencyArea } = req.params;

    const leistungsziele = await db.leistungsziel.findAll({
      where: { competency_area: competencyArea },
      include: [
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ],
      order: [["sequence_number", "ASC"]]
    });

    res.status(200).json(leistungsziele);
  } catch (error) {
    console.error("Error fetching leistungsziele for competency area:", error);
    res.status(500).json({ message: "Error fetching leistungsziele for competency area" });
  }
};

export const createLeistungsziel = async (req, res) => {
  try {
    const { competency_area, sequence_number, name, taxonomie_stufe, module_id } = req.body;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    // Validate that the module is BAND type
    const module = await db.modul.findByPk(module_id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    if (module.type !== "BAND") {
      return res.status(400).json({
        message: "Leistungsziele can only be created for BAND modules"
      });
    }

    // Check if the ID already exists (competency_area.sequence_number)
    const existingId = `${competency_area}.${sequence_number}`;
    const existingLeistungsziel = await db.leistungsziel.findByPk(existingId);

    if (existingLeistungsziel) {
      return res.status(409).json({
        message: `Leistungsziel with ID ${existingId} already exists`
      });
    }

    // Validate taxonomie_stufe
    if (!["K1", "K2", "K3", "K4", "K5"].includes(taxonomie_stufe)) {
      return res.status(400).json({
        message: "Invalid taxonomie_stufe. Must be K1, K2, K3, K4, or K5"
      });
    }

    const leistungsziel = await db.leistungsziel.create({
      competency_area,
      sequence_number,
      name,
      taxonomie_stufe,
      module_id
    });

    const createdLeistungsziel = await db.leistungsziel.findByPk(leistungsziel.id, {
      include: [
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ]
    });

    res.status(201).json({
      message: "Leistungsziel created successfully",
      leistungsziel: createdLeistungsziel
    });
  } catch (error) {
    console.error("Error creating leistungsziel:", error);
    res.status(500).json({ message: "Error creating leistungsziel" });
  }
};

export const updateLeistungsziel = async (req, res) => {
  try {
    const { leistungszielId } = req.params;
    const { competency_area, sequence_number, name, taxonomie_stufe } = req.body;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    const leistungsziel = await db.leistungsziel.findByPk(leistungszielId);
    if (!leistungsziel) {
      return res.status(404).json({ message: "Leistungsziel not found" });
    }

    // If competency_area or sequence_number is being updated, check for conflicts
    if ((competency_area && competency_area !== leistungsziel.competency_area) ||
        (sequence_number && sequence_number !== leistungsziel.sequence_number)) {

      const newCompetencyArea = competency_area || leistungsziel.competency_area;
      const newSequenceNumber = sequence_number || leistungsziel.sequence_number;
      const newId = `${newCompetencyArea}.${newSequenceNumber}`;

      if (newId !== leistungszielId) {
        const existingLeistungsziel = await db.leistungsziel.findByPk(newId);
        if (existingLeistungsziel) {
          return res.status(409).json({
            message: `Leistungsziel with ID ${newId} already exists`
          });
        }
      }
    }

    // Validate taxonomie_stufe if provided
    if (taxonomie_stufe && !["K1", "K2", "K3", "K4", "K5"].includes(taxonomie_stufe)) {
      return res.status(400).json({
        message: "Invalid taxonomie_stufe. Must be K1, K2, K3, K4, or K5"
      });
    }

    await leistungsziel.update({
      competency_area: competency_area || leistungsziel.competency_area,
      sequence_number: sequence_number || leistungsziel.sequence_number,
      name: name || leistungsziel.name,
      taxonomie_stufe: taxonomie_stufe || leistungsziel.taxonomie_stufe
    });

    const updatedLeistungsziel = await db.leistungsziel.findByPk(leistungsziel.id, {
      include: [
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ]
    });

    res.status(200).json({
      message: "Leistungsziel updated successfully",
      leistungsziel: updatedLeistungsziel
    });
  } catch (error) {
    console.error("Error updating leistungsziel:", error);
    res.status(500).json({ message: "Error updating leistungsziel" });
  }
};

export const deleteLeistungsziel = async (req, res) => {
  try {
    const { leistungszielId } = req.params;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    const leistungsziel = await db.leistungsziel.findByPk(leistungszielId);
    if (!leistungsziel) {
      return res.status(404).json({ message: "Leistungsziel not found" });
    }

    await leistungsziel.destroy();

    res.status(200).json({
      message: "Leistungsziel deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting leistungsziel:", error);
    res.status(500).json({ message: "Error deleting leistungsziel" });
  }
};