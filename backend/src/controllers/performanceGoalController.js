import db from "../models/index.js";

const Leistungsziel = db.leistungsziel;
const Modul = db.modul;
const Kompetenzbereich = db.kompetenzbereich;
const ModulePerformanceGoal = db.modulePerformanceGoal;

// Alle Leistungsziele mit zugeordneten Modulen abrufen
export const getAllPerformanceGoalsWithModules = async (req, res) => {
  try {
    const leistungsziele = await Leistungsziel.findAll({
      include: [
        {
          model: Kompetenzbereich,
          as: "kompetenzbereich",
          attributes: ["id", "titel", "beschreibung"]
        },
        {
          model: Modul,
          as: "module",
          attributes: ["id", "name", "typ", "wahlmodul"],
          through: {
            attributes: [] // Keine through-table Attribute
          },
          required: false
        }
      ],
      order: [
        ["kompetenzbereich_id", "ASC"],
        ["id", "ASC"]
      ]
    });

    // Gruppiere nach Kompetenzbereichen
    const groupedGoals = leistungsziele.reduce((acc, goal) => {
      const kompetenzbereichId = goal.kompetenzbereich?.id || "unknown";
      if (!acc[kompetenzbereichId]) {
        acc[kompetenzbereichId] = {
          kompetenzbereich: goal.kompetenzbereich,
          goals: []
        };
      }
      acc[kompetenzbereichId].goals.push(goal);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: Object.values(groupedGoals),
      count: leistungsziele.length
    });

  } catch (error) {
    console.error("Error fetching performance goals:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Leistungsziele",
      error: error.message
    });
  }
};

// Nur BAND-relevante Leistungsziele abrufen
export const getBandPerformanceGoals = async (req, res) => {
  try {
    // Hole alle Leistungsziele mit ihren Kompetenzbereichen und BAND-Modulen
    const leistungsziele = await Leistungsziel.findAll({
      include: [
        {
          model: Kompetenzbereich,
          as: "kompetenzbereich",
          attributes: ["id", "titel", "beschreibung"],
          required: true
        },
        {
          model: Modul,
          as: "module",
          attributes: ["id", "name", "typ", "wahlmodul", "lehrjahr"],
          required: false, // LEFT JOIN - auch Goals ohne Module anzeigen
          through: {
            attributes: [],
            where: {} // Empty where to avoid Sequelize issues
          }
        }
      ],
      order: [
        ["kompetenzbereich_id", "ASC"],
        ["id", "ASC"]
      ]
    });

    // Filtere BAND-Module nach dem Fetch (wegen Sequelize-Limitierung mit where in many-to-many)
    const processedGoals = leistungsziele.map(goal => {
      const goalJson = goal.toJSON();
      // Filtere nur BAND-Module
      if (goalJson.module) {
        goalJson.module = goalJson.module.filter(m => m.typ === "BAND");
      }
      return goalJson;
    });

    // Gruppiere nach Kompetenzbereichen
    const groupedGoals = processedGoals.reduce((acc, goal) => {
      const kompetenzbereichId = goal.kompetenzbereich?.id || "unknown";
      if (!acc[kompetenzbereichId]) {
        acc[kompetenzbereichId] = {
          kompetenzbereich: goal.kompetenzbereich,
          goals: [],
          unassignedGoals: [],
          assignedGoals: []
        };
      }

      // Separiere zugewiesene und nicht zugewiesene Ziele
      if (goal.module && goal.module.length > 0) {
        acc[kompetenzbereichId].assignedGoals.push(goal);
      } else {
        acc[kompetenzbereichId].unassignedGoals.push(goal);
      }

      acc[kompetenzbereichId].goals.push(goal);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: Object.values(groupedGoals),
      count: processedGoals.length
    });

  } catch (error) {
    console.error("Error fetching BAND performance goals:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der BAND-Leistungsziele",
      error: error.message
    });
  }
};

// Leistungsziel einem Modul zuordnen
export const assignGoalToModule = async (req, res) => {
  try {
    const { goalId, moduleId } = req.body;

    // Prüfe ob Zuordnung bereits existiert
    const existingAssignment = await ModulePerformanceGoal.findOne({
      where: {
        performance_goal_id: goalId,
        module_id: moduleId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Leistungsziel ist bereits diesem Modul zugeordnet"
      });
    }

    // Erstelle neue Zuordnung
    await ModulePerformanceGoal.create({
      performance_goal_id: goalId,
      module_id: moduleId
    });

    res.status(201).json({
      success: true,
      message: "Leistungsziel erfolgreich zugeordnet"
    });

  } catch (error) {
    console.error("Error assigning goal to module:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Zuordnen des Leistungsziels",
      error: error.message
    });
  }
};

// Leistungsziel von Modul entfernen
export const removeGoalFromModule = async (req, res) => {
  try {
    const { goalId, moduleId } = req.body;

    const deleted = await ModulePerformanceGoal.destroy({
      where: {
        performance_goal_id: goalId,
        module_id: moduleId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: "Zuordnung nicht gefunden"
      });
    }

    res.status(200).json({
      success: true,
      message: "Leistungsziel erfolgreich entfernt"
    });

  } catch (error) {
    console.error("Error removing goal from module:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Entfernen des Leistungsziels",
      error: error.message
    });
  }
};

// Neues BAND-Modul erstellen
export const createBandModule = async (req, res) => {
  try {
    const { name, beschreibung = "", wahlmodul = false, lehrjahr = 1, fachrichtungen = ["Appli"] } = req.body;

    const modul = await Modul.create({
      name,
      beschreibung,
      typ: "BAND",
      wahlmodul,
      lehrjahr,
      fachrichtungen
    });

    res.status(201).json({
      success: true,
      data: modul,
      message: "BAND-Modul erfolgreich erstellt"
    });

  } catch (error) {
    console.error("Error creating BAND module:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen des Moduls",
      error: error.message
    });
  }
};