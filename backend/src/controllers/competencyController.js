// ============================================================================
// COMPETENCY CONTROLLER - PostgreSQL/Sequelize Version
// ============================================================================

// TODO: Implement proper Sequelize versions when competency system is developed

// export const getAllCompetencies = async (req, res) => {
//   try {
//     const db = (await import("../models/index.js")).default;
//     const competencies = await db.competency.findAll({
//       order: [["area", "ASC"], ["code", "ASC"]]
//     });
//     res.status(200).json(competencies);
//   } catch (error) {
//     console.error("Error fetching competencies:", error);
//     res.status(500).json({ message: "Error fetching competencies" });
//   }
// };

// export const getCompetenciesByArea = async (req, res) => {
//   try {
//     const { area } = req.params;
//     const db = (await import("../models/index.js")).default;
//     const competencies = await db.competency.findAll({
//       where: { area },
//       order: [["code", "ASC"]]
//     });
//     res.status(200).json(competencies);
//   } catch (error) {
//     console.error("Error fetching competencies by area:", error);
//     res.status(500).json({ message: "Error fetching competencies by area" });
//   }
// };

export const getAllCompetencies = async (req, res) => {
  try {
    const db = (await import("../models/index.js")).default;
    const competencies = await db.competency.findAll({
      order: [["area", "ASC"], ["code", "ASC"]]
    });

    res.status(200).json(competencies);
  } catch (error) {
    console.error("Error fetching competencies:", error);
    res.status(500).json({ message: "Error fetching competencies" });
  }
};

export const getCompetenciesByArea = async (req, res) => {
  try {
    const { area } = req.params;
    const db = (await import("../models/index.js")).default;
    const competencies = await db.competency.findAll({
      where: { area },
      order: [["code", "ASC"]]
    });

    res.status(200).json(competencies);
  } catch (error) {
    console.error("Error fetching competencies by area:", error);
    res.status(500).json({ message: "Error fetching competencies by area" });
  }
};

export const createCompetency = (req, res) => {
  res.status(501).json({ message: "Competency creation not yet implemented" });
};