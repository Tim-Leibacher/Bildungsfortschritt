import db from "../models/index.js";

export const getAllLBs = async (req, res) => {
  try {
    const lbs = await db.lb.findAll({
      include: [
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ],
      order: [["module_id", "ASC"], ["nr", "ASC"]]
    });

    res.status(200).json(lbs);
  } catch (error) {
    console.error("Error fetching LBs:", error);
    res.status(500).json({ message: "Error fetching LBs" });
  }
};

export const getLBsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const lbs = await db.lb.findAll({
      where: { module_id: moduleId },
      order: [["nr", "ASC"]]
    });

    // Calculate total weight to validate if it equals 100%
    const totalWeight = lbs.reduce((sum, lb) => sum + parseFloat(lb.gewichtung), 0);

    res.status(200).json({
      lbs,
      totalWeight,
      isComplete: Math.abs(totalWeight - 100) < 0.01 // Allow for small floating point differences
    });
  } catch (error) {
    console.error("Error fetching LBs for module:", error);
    res.status(500).json({ message: "Error fetching LBs for module" });
  }
};

export const createLB = async (req, res) => {
  try {
    const { nummer, gewichtung, beschreibung, module_id } = req.body;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    // Validate module exists
    const module = await db.modul.findByPk(module_id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Validate gewichtung is a valid percentage
    if (gewichtung < 0 || gewichtung > 100) {
      return res.status(400).json({
        message: "Gewichtung must be between 0 and 100 percent"
      });
    }

    // Check if LB number already exists for this module
    const existingLB = await db.lb.findOne({
      where: { module_id, nummer }
    });

    if (existingLB) {
      return res.status(409).json({
        message: `LB ${nummer} already exists for this module`
      });
    }

    // Check if total weight would exceed 100%
    const existingLBs = await db.lb.findAll({
      where: { module_id }
    });

    const currentTotalWeight = existingLBs.reduce((sum, lb) => sum + parseFloat(lb.gewichtung), 0);
    const newTotalWeight = currentTotalWeight + parseFloat(gewichtung);

    if (newTotalWeight > 100.01) { // Allow small floating point differences
      return res.status(400).json({
        message: `Total weight would exceed 100%. Current total: ${currentTotalWeight.toFixed(2)}%, trying to add: ${gewichtung}%`
      });
    }

    const lb = await db.lb.create({
      nummer,
      gewichtung,
      beschreibung,
      module_id
    });

    const createdLB = await db.lb.findByPk(lb.id, {
      include: [
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ]
    });

    res.status(201).json({
      message: "LB created successfully",
      lb: createdLB,
      newTotalWeight: newTotalWeight.toFixed(2)
    });
  } catch (error) {
    console.error("Error creating LB:", error);
    res.status(500).json({ message: "Error creating LB" });
  }
};

export const updateLB = async (req, res) => {
  try {
    const { lbId } = req.params;
    const { nummer, gewichtung, beschreibung } = req.body;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    const lb = await db.lb.findByPk(lbId);
    if (!lb) {
      return res.status(404).json({ message: "LB not found" });
    }

    // If nummer is being updated, check for conflicts
    if (nummer && nummer !== lb.nummer) {
      const existingLB = await db.lb.findOne({
        where: { module_id: lb.module_id, nummer }
      });

      if (existingLB) {
        return res.status(409).json({
          message: `LB ${nummer} already exists for this module`
        });
      }
    }

    // If gewichtung is being updated, validate total weight
    if (gewichtung !== undefined) {
      if (gewichtung < 0 || gewichtung > 100) {
        return res.status(400).json({
          message: "Gewichtung must be between 0 and 100 percent"
        });
      }

      // Check if total weight would exceed 100%
      const existingLBs = await db.lb.findAll({
        where: { module_id: lb.module_id }
      });

      const currentTotalWeight = existingLBs
        .filter(otherLB => otherLB.id !== lb.id)
        .reduce((sum, otherLB) => sum + parseFloat(otherLB.gewichtung), 0);

      const newTotalWeight = currentTotalWeight + parseFloat(gewichtung);

      if (newTotalWeight > 100.01) { // Allow small floating point differences
        return res.status(400).json({
          message: `Total weight would exceed 100%. Current total (excluding this LB): ${currentTotalWeight.toFixed(2)}%, trying to set: ${gewichtung}%`
        });
      }
    }

    await lb.update({
      nummer: nummer || lb.nummer,
      gewichtung: gewichtung !== undefined ? gewichtung : lb.gewichtung,
      beschreibung: beschreibung || lb.beschreibung
    });

    const updatedLB = await db.lb.findByPk(lbId, {
      include: [
        {
          model: db.modul,
          as: "module",
          attributes: ["id", "name", "type"]
        }
      ]
    });

    // Calculate new total weight
    const allLBs = await db.lb.findAll({
      where: { module_id: lb.module_id }
    });
    const totalWeight = allLBs.reduce((sum, otherLB) => sum + parseFloat(otherLB.gewichtung), 0);

    res.status(200).json({
      message: "LB updated successfully",
      lb: updatedLB,
      totalWeight: totalWeight.toFixed(2)
    });
  } catch (error) {
    console.error("Error updating LB:", error);
    res.status(500).json({ message: "Error updating LB" });
  }
};

export const deleteLB = async (req, res) => {
  try {
    const { lbId } = req.params;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    const lb = await db.lb.findByPk(lbId);
    if (!lb) {
      return res.status(404).json({ message: "LB not found" });
    }

    const moduleId = lb.module_id;
    await lb.destroy();

    // Calculate remaining total weight
    const remainingLBs = await db.lb.findAll({
      where: { module_id: moduleId }
    });
    const remainingTotalWeight = remainingLBs.reduce((sum, otherLB) => sum + parseFloat(otherLB.gewichtung), 0);

    res.status(200).json({
      message: "LB deleted successfully",
      remainingTotalWeight: remainingTotalWeight.toFixed(2)
    });
  } catch (error) {
    console.error("Error deleting LB:", error);
    res.status(500).json({ message: "Error deleting LB" });
  }
};