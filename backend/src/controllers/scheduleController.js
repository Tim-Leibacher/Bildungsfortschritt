import db from "../models/index.js";

const ModuleSchedule = db.moduleSchedule;
const Module = db.modul;
const ModuleScheduleModules = db.sequelize.models.module_schedule_modules;

// Hilfsfunktionen für Kalenderberechnungen
const calculateWeekData = (startWeek, endWeek, year = 2024) => {
  // KW-Bereich erstellen
  const week_range = startWeek === endWeek ? `KW ${startWeek}` : `KW ${startWeek}-${endWeek}`;

  // Berechne Start- und Enddatum basierend auf ISO-Wochen
  const getDateFromWeek = (week, year) => {
    const jan4 = new Date(year, 0, 4); // 4. Januar ist immer in KW 1
    const startOfYear = new Date(jan4.getTime() - (jan4.getDay() - 1) * 24 * 60 * 60 * 1000);
    return new Date(startOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
  };

  const startDate = getDateFromWeek(startWeek, year);
  const endDate = getDateFromWeek(endWeek, year);
  endDate.setDate(endDate.getDate() + 6); // Sonntag der End-Woche

  // Quartal basierend auf Start-Woche berechnen
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

// Berechne abgeleitete Werte für Schedule-Objekte
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

// Alle Zeitplan-Einträge für ein bestimmtes Jahr abrufen
export const getScheduleByYear = async (req, res) => {
  try {
    const { year } = req.params;

    const schedules = await ModuleSchedule.findAll({
      where: { year: parseInt(year) },
      attributes: ["id", "year", "start_week", "end_week", "module_context", "type", "notes"],
      include: [{
        model: Module,
        as: "modules",
        attributes: ["id", "name", "type", "wahlmodul"]
      }],
      order: [
        ["start_week", "ASC"],
        ["module_context", "ASC"]
      ]
    });

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Keine Zeitplan-Daten für Jahr ${year} gefunden`
      });
    }

    // Daten für Frontend-Timeline strukturieren
    const timelineData = {};

    schedules.forEach(schedule => {
      // Berechne abgeleitete Werte dynamisch
      const enrichedSchedule = enrichScheduleWithCalculatedData(schedule);
      const weekKey = enrichedSchedule.week_range;

      if (!timelineData[weekKey]) {
        timelineData[weekKey] = {
          week: enrichedSchedule.week_range,
          start_week: enrichedSchedule.start_week,
          end_week: enrichedSchedule.end_week,
          start_date: enrichedSchedule.start_date,
          end_date: enrichedSchedule.end_date,
          quarter: enrichedSchedule.quarter,
          type: enrichedSchedule.type,
          band: null,
          bfs: [],
          uek: [],
          notes: enrichedSchedule.notes
        };
      }

      // Module nach Kontext zuordnen
      const moduleNames = schedule.modules.map(m => m.name);

      switch (schedule.module_context) {
        case "BAND":
          timelineData[weekKey].band = {
            modules: moduleNames,
            notes: schedule.notes
          };
          break;
        case "BFS":
          timelineData[weekKey].bfs = moduleNames;
          break;
        case "ÜK":
          timelineData[weekKey].uek = moduleNames;
          break;
      }
    });

    // Timeline als Array zurückgeben
    const timeline = Object.values(timelineData).sort((a, b) => a.start_week - b.start_week);

    res.status(200).json({
      success: true,
      data: timeline,
      year: parseInt(year),
      count: timeline.length
    });

  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden des Zeitplans",
      error: error.message
    });
  }
};

// Alle verfügbaren Jahre abrufen
export const getAvailableYears = async (req, res) => {
  try {
    const years = await ModuleSchedule.findAll({
      attributes: ["year"],
      group: ["year"],
      order: [["year", "ASC"]]
    });

    const yearList = years.map(y => y.year);

    res.status(200).json({
      success: true,
      data: yearList
    });

  } catch (error) {
    console.error("Error fetching available years:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der verfügbaren Jahre",
      error: error.message
    });
  }
};

// Zeitplan-Einträge für bestimmte Kalenderwochen abrufen
export const getScheduleByWeeks = async (req, res) => {
  try {
    const { startWeek, endWeek, year } = req.query;

    const whereClause = {};

    if (year) {
      whereClause.year = parseInt(year);
    }

    if (startWeek && endWeek) {
      whereClause.start_week = {
        [db.Sequelize.Op.gte]: parseInt(startWeek)
      };
      whereClause.end_week = {
        [db.Sequelize.Op.lte]: parseInt(endWeek)
      };
    }

    const schedules = await ModuleSchedule.findAll({
      where: whereClause,
      attributes: ["id", "year", "start_week", "end_week", "module_context", "type", "notes"],
      include: [{
        model: Module,
        as: "modules",
        attributes: ["id", "name", "type", "wahlmodul"]
      }],
      order: [
        ["year", "ASC"],
        ["start_week", "ASC"],
        ["module_context", "ASC"]
      ]
    });

    // Berechne abgeleitete Werte dynamisch
    const enrichedSchedules = schedules.map(schedule => enrichScheduleWithCalculatedData(schedule));

    res.status(200).json({
      success: true,
      data: enrichedSchedules,
      count: enrichedSchedules.length
    });

  } catch (error) {
    console.error("Error fetching schedule by weeks:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden des Zeitplans nach Wochen",
      error: error.message
    });
  }
};

// Zeitplan-Einträge für ein bestimmtes Modul abrufen
export const getScheduleByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const schedules = await ModuleSchedule.findAll({
      attributes: ["id", "year", "start_week", "end_week", "module_context", "type", "notes"],
      include: [{
        model: Module,
        as: "modules",
        where: { id: parseInt(moduleId) },
        attributes: ["id", "name", "type", "wahlmodul"]
      }],
      order: [["start_week", "ASC"]]
    });

    // Berechne abgeleitete Werte dynamisch
    const enrichedSchedules = schedules.map(schedule => enrichScheduleWithCalculatedData(schedule));

    res.status(200).json({
      success: true,
      data: enrichedSchedules
    });

  } catch (error) {
    console.error("Error fetching schedule by module:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden des Modul-Zeitplans",
      error: error.message
    });
  }
};

// Neuen Zeitplan-Eintrag für ein Modul erstellen
export const createModuleSchedule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { year, start_week, end_week, module_context = "BAND", type = "active", notes = "" } = req.body;

    // Erstelle Zeitplan-Eintrag (nur essentielle Daten)
    const schedule = await ModuleSchedule.create({
      year,
      start_week,
      end_week,
      module_context,
      type,
      notes
    });

    // Verknüpfe Modul mit Zeitplan
    await ModuleScheduleModules.create({
      module_id: parseInt(moduleId),
      schedule_id: schedule.id
    });

    // Berechne abgeleitete Werte für Response
    const enrichedSchedule = enrichScheduleWithCalculatedData(schedule);

    res.status(201).json({
      success: true,
      data: enrichedSchedule,
      message: "Zeitplan-Eintrag erfolgreich erstellt"
    });

  } catch (error) {
    console.error("Error creating module schedule:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen des Zeitplan-Eintrags",
      error: error.message
    });
  }
};

// Zeitplan-Eintrag aktualisieren
export const updateModuleSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { year, start_week, end_week, module_context, type, notes } = req.body;

    const schedule = await ModuleSchedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Zeitplan-Eintrag nicht gefunden"
      });
    }

    // Update nur essentielle Daten
    const updateData = {
      year,
      start_week,
      end_week,
      module_context,
      type,
      notes
    };

    await schedule.update(updateData);

    // Berechne abgeleitete Werte für Response
    const enrichedSchedule = enrichScheduleWithCalculatedData(schedule);

    res.status(200).json({
      success: true,
      data: enrichedSchedule,
      message: "Zeitplan-Eintrag erfolgreich aktualisiert"
    });

  } catch (error) {
    console.error("Error updating module schedule:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Aktualisieren des Zeitplan-Eintrags",
      error: error.message
    });
  }
};

// Zeitplan-Eintrag löschen
export const deleteModuleSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await ModuleSchedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Zeitplan-Eintrag nicht gefunden"
      });
    }

    // Lösche Verknüpfungen zuerst
    await ModuleScheduleModules.destroy({
      where: { schedule_id: scheduleId }
    });

    // Lösche Zeitplan-Eintrag
    await schedule.destroy();

    res.status(200).json({
      success: true,
      message: "Zeitplan-Eintrag erfolgreich gelöscht"
    });

  } catch (error) {
    console.error("Error deleting module schedule:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Löschen des Zeitplan-Eintrags",
      error: error.message
    });
  }
};