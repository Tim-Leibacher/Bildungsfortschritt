import db from "../models/index.js";

// Berechne abgeleitete Schedule-Werte
const calculateWeekData = (startWeek, endWeek, year = 2024) => {
  const week_range = startWeek === endWeek ? `KW ${startWeek}` : `KW ${startWeek}-${endWeek}`;

  const getDateFromWeek = (week, year) => {
    const jan4 = new Date(year, 0, 4);
    const startOfYear = new Date(jan4.getTime() - (jan4.getDay() - 1) * 24 * 60 * 60 * 1000);
    return new Date(startOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
  };

  const startDate = getDateFromWeek(startWeek, year);
  const endDate = getDateFromWeek(endWeek, year);
  endDate.setDate(endDate.getDate() + 6);

  let quarter;
  if (startWeek <= 13) quarter = "Q1";
  else if (startWeek <= 26) quarter = "Q2";
  else if (startWeek <= 39) quarter = "Q3";
  else quarter = "Q4";

  return {
    week_range,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    quarter
  };
};

const enrichScheduleWithCalculatedData = (schedule) => {
  const calculatedData = calculateWeekData(schedule.start_week, schedule.end_week, 2024 + (schedule.year - 1));
  return {
    ...schedule.toJSON(),
    week_range: calculatedData.week_range,
    start_date: calculatedData.start_date,
    end_date: calculatedData.end_date,
    quarter: calculatedData.quarter
  };
};

export const getAllModules = async (req, res) => {
  try {
    const modules = await db.modul.findAll({
      include: [
        {
          model: db.kompetenzbereich,
          as: "kompetenzbereiche",
          through: { attributes: [] },
          required: false
        },
        {
          model: db.leistungsziel,
          as: "leistungsziele",
          through: { attributes: [] },
          required: false
        },
        {
          model: db.lb,
          as: "lbs",
          required: false
        },
        {
          model: db.durchfuehrung,
          as: "durchfuehrungen",
          required: false
        }
      ],
      order: [["typ", "ASC"], ["name", "ASC"]]
    });

    res.status(200).json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ message: "Error fetching modules" });
  }
};

export const getModulesWithProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const modules = await db.modul.findAll({
      include: [
        {
          model: db.kompetenzbereich,
          as: "kompetenzbereiche",
          through: { attributes: [] },
          required: false
        },
        {
          model: db.leistungsziel,
          as: "leistungsziele",
          through: { attributes: [] },
          required: false
        },
        {
          model: db.lb,
          as: "lbs",
          required: false
        },
        {
          model: db.durchfuehrung,
          as: "durchfuehrungen",
          include: [
            {
              model: db.userModule,
              as: "userModules",
              where: { user_id: userId },
              required: false,
              attributes: ["status", "completed_date", "note"]
            }
          ],
          required: false
        }
      ],
      order: [["typ", "ASC"], ["name", "ASC"]]
    });

    const modulesWithProgress = modules.map(module => {
      const moduleJson = module.toJSON();

      // Sammle Progress-Daten aus allen Durchführungen
      let userProgress = null;
      if (moduleJson.durchfuehrungen && moduleJson.durchfuehrungen.length > 0) {
        for (const durchfuehrung of moduleJson.durchfuehrungen) {
          if (durchfuehrung.userModules && durchfuehrung.userModules.length > 0) {
            userProgress = durchfuehrung.userModules[0];
            break;
          }
        }
      }

      return {
        ...moduleJson,
        userProgress: userProgress
      };
    });

    res.status(200).json(modulesWithProgress);
  } catch (error) {
    console.error("Error fetching modules with progress:", error);
    res.status(500).json({ message: "Error fetching modules with progress" });
  }
};

export const updateModuleProgress = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { durchfuehrungId, status, note } = req.body;
    const userId = req.user.id;

    if (!["enrolled", "in_progress", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Wenn keine durchfuehrungId angegeben, versuche die erste zu finden
    let targetDurchfuehrungId = durchfuehrungId;
    if (!targetDurchfuehrungId) {
      const durchfuehrung = await db.durchfuehrung.findOne({
        where: { modul_id: moduleId }
      });
      if (!durchfuehrung) {
        return res.status(404).json({ message: "No Durchführung found for this module" });
      }
      targetDurchfuehrungId = durchfuehrung.id;
    }

    // Wenn status "enrolled" ist und es einen UserModule-Eintrag gibt, lösche ihn
    if (status === "enrolled") {
      await db.userModule.destroy({
        where: {
          user_id: userId,
          durchfuehrung_id: targetDurchfuehrungId
        }
      });

      res.status(200).json({
        message: "Module progress reset successfully",
        userModule: null
      });
      return;
    }

    const [userModule, created] = await db.userModule.findOrCreate({
      where: {
        user_id: userId,
        durchfuehrung_id: targetDurchfuehrungId
      },
      defaults: {
        status: status,
        note: note || null,
        completed_date: status === "completed" ? new Date() : null
      }
    });

    if (!created) {
      await userModule.update({
        status: status,
        note: note || null,
        completed_date: status === "completed" ? new Date() : userModule.completed_date
      });
    }

    res.status(200).json({
      message: "Module progress updated successfully",
      userModule: userModule
    });
  } catch (error) {
    console.error("Error updating module progress:", error);
    res.status(500).json({ message: "Error updating module progress" });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;

    const module = await db.modul.findByPk(moduleId, {
      include: [
        {
          model: db.kompetenzbereich,
          as: "kompetenzbereiche",
          through: { attributes: [] },
          required: false
        },
        {
          model: db.leistungsziel,
          as: "leistungsziele",
          through: { attributes: [] },
          required: false
        },
        {
          model: db.lb,
          as: "lbs",
          required: false
        },
        {
          model: db.durchfuehrung,
          as: "durchfuehrungen",
          include: [
            {
              model: db.userModule,
              as: "userModules",
              where: { user_id: userId },
              required: false,
              attributes: ["status", "completed_date", "note"]
            }
          ],
          required: false
        }
      ]
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const moduleJson = module.toJSON();

    // Sammle Progress-Daten aus allen Durchführungen
    let userProgress = null;
    if (moduleJson.durchfuehrungen && moduleJson.durchfuehrungen.length > 0) {
      for (const durchfuehrung of moduleJson.durchfuehrungen) {
        if (durchfuehrung.userModules && durchfuehrung.userModules.length > 0) {
          userProgress = durchfuehrung.userModules[0];
          break;
        }
      }
    }

    const moduleWithProgress = {
      ...moduleJson,
      userProgress: userProgress
    };

    res.status(200).json(moduleWithProgress);
  } catch (error) {
    console.error("Error fetching module:", error);
    res.status(500).json({ message: "Error fetching module" });
  }
};

export const getModuleStudents = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const coachId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(coachId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    // Finde alle Durchführungen für dieses Modul
    const durchfuehrungen = await db.durchfuehrung.findAll({
      where: { modul_id: moduleId }
    });

    const durchfuehrungIds = durchfuehrungen.map(d => d.id);

    // Get all students assigned to this coach
    const students = await db.user.findAll({
      where: { coach_id: coachId },
      include: [
        {
          model: db.userModule,
          as: "userModules",
          where: { durchfuehrung_id: durchfuehrungIds },
          required: false,
          attributes: ["status", "completed_date", "note", "durchfuehrung_id"]
        }
      ],
      attributes: ["id", "email", "lehrjahr", "fachrichtung"]
    });

    const studentsWithProgress = students.map(student => ({
      ...student.toJSON(),
      moduleProgress: student.userModules?.[0] || null
    }));

    res.status(200).json(studentsWithProgress);
  } catch (error) {
    console.error("Error fetching module students:", error);
    res.status(500).json({ message: "Error fetching module students" });
  }
};

export const updateStudentModuleProgress = async (req, res) => {
  try {
    const { moduleId, studentId } = req.params;
    const { durchfuehrungId, status, note } = req.body;
    const coachId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(coachId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    // Check if student is assigned to this coach
    const student = await db.user.findOne({
      where: { id: studentId, coach_id: coachId }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found or not assigned to you" });
    }

    if (!["enrolled", "in_progress", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Wenn keine durchfuehrungId angegeben, versuche die erste zu finden
    let targetDurchfuehrungId = durchfuehrungId;
    if (!targetDurchfuehrungId) {
      const durchfuehrung = await db.durchfuehrung.findOne({
        where: { modul_id: moduleId }
      });
      if (!durchfuehrung) {
        return res.status(404).json({ message: "No Durchführung found for this module" });
      }
      targetDurchfuehrungId = durchfuehrung.id;
    }

    // Handle status "enrolled" (reset)
    if (status === "enrolled") {
      await db.userModule.destroy({
        where: {
          user_id: studentId,
          durchfuehrung_id: targetDurchfuehrungId
        }
      });

      res.status(200).json({
        message: "Student module progress reset successfully",
        userModule: null
      });
      return;
    }

    const [userModule, created] = await db.userModule.findOrCreate({
      where: {
        user_id: studentId,
        durchfuehrung_id: targetDurchfuehrungId
      },
      defaults: {
        status: status,
        note: note || null,
        completed_date: status === "completed" ? new Date() : null
      }
    });

    if (!created) {
      await userModule.update({
        status: status,
        note: note || null,
        completed_date: status === "completed" ? new Date() : userModule.completed_date
      });
    }

    res.status(200).json({
      message: "Student module progress updated successfully",
      userModule: userModule
    });
  } catch (error) {
    console.error("Error updating student module progress:", error);
    res.status(500).json({ message: "Error updating student module progress" });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { name, beschreibung, typ, wahlmodul } = req.body;
    const userId = req.user.id;

    // Check if user is a coach (BB)
    const user = await db.user.findByPk(userId);
    const roles = await user.getRoles();
    const isBB = roles.some(role => role.name === "bb");

    if (!isBB) {
      return res.status(403).json({ message: "Access denied. BB role required." });
    }

    const module = await db.modul.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Only allow editing BAND modules
    if (module.typ !== "BAND") {
      return res.status(403).json({ message: "Only BAND modules can be edited" });
    }

    await module.update({
      name: name || module.name,
      beschreibung: beschreibung !== undefined ? beschreibung : module.beschreibung,
      typ: typ || module.typ,
      wahlmodul: wahlmodul !== undefined ? wahlmodul : module.wahlmodul
    });

    res.status(200).json({
      message: "Module updated successfully",
      module: module
    });
  } catch (error) {
    console.error("Error updating module:", error);
    res.status(500).json({ message: "Error updating module" });
  }
};