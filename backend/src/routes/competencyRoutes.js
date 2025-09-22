/**
 * =============================================================================
 * COMPETENCY ROUTES
 * =============================================================================
 * Bereitstellung von API-Endpunkten für Leistungsziele-Verwaltung
 * - Übersicht der Leistungsziele-Abdeckung (nur Berufsbildner)
 * - Leistungsziele nach Handlungskompetenzbereich
 * - Such- und Filterfunktionen
 * =============================================================================
 */

import express from "express";
import Competency from "../models/Competency.js";
import Modul from "../models/Modul.js";

const router = express.Router();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validiert den Handlungskompetenzbereich
 * @param {string} area - Bereichs-Bezeichnung (a-h)
 * @returns {boolean} Gültigkeit des Bereichs
 */
const isValidArea = (area) => {
  return area && /^[a-h]$/i.test(area);
};

/**
 * Erstellt Mapping zwischen Leistungszielen und Modulen
 * @param {Array} modules - Array von Modulen mit Leistungszielen
 * @returns {Object} Mapping-Objekt
 */
const createCompetencyModuleMapping = (modules) => {
  const mapping = {};
  const coveredCompetencies = new Set();

  modules.forEach((module) => {
    if (!Array.isArray(module.competencies)) return;

    module.competencies.forEach((competency) => {
      if (!competency?._id) return;

      const competencyId = competency._id.toString();

      if (!mapping[competencyId]) {
        mapping[competencyId] = [];
      }

      mapping[competencyId].push({
        _id: module._id,
        code: module.code,
        title: module.title,
        type: module.type,
      });

      coveredCompetencies.add(competencyId);
    });
  });

  return { mapping, coveredCompetencies };
};

/**
 * Berechnet Statistiken pro Handlungskompetenzbereich
 * @param {Array} competencies - Array aller Leistungsziele
 * @param {Set} coveredCompetencies - Set abgedeckter Leistungsziele
 * @returns {Object} Statistiken pro Bereich
 */
const calculateAreaStats = (competencies, coveredCompetencies) => {
  const areaStats = {};

  competencies.forEach((competency) => {
    const area = competency.area.toUpperCase();
    const competencyId = competency._id.toString();
    const isCovered = coveredCompetencies.has(competencyId);

    if (!areaStats[area]) {
      areaStats[area] = { total: 0, covered: 0, uncovered: 0, percentage: 0 };
    }

    areaStats[area].total++;
    if (isCovered) {
      areaStats[area].covered++;
    } else {
      areaStats[area].uncovered++;
    }
  });

  // Prozentsätze berechnen
  Object.keys(areaStats).forEach((area) => {
    const { total, covered } = areaStats[area];
    areaStats[area].percentage =
      total > 0 ? Math.round((covered / total) * 100) : 0;
  });

  return areaStats;
};

/**
 * Gruppiert Leistungsziele nach Bereichen mit Modul-Informationen
 * @param {Array} competencies - Array aller Leistungsziele
 * @param {Object} competencyMapping - Mapping zu Modulen
 * @returns {Object} Gruppierte Leistungsziele
 */
const groupCompetenciesByArea = (competencies, competencyMapping) => {
  const grouped = {};

  competencies.forEach((competency) => {
    const area = competency.area.toUpperCase();
    const competencyId = competency._id.toString();

    if (!grouped[area]) {
      grouped[area] = [];
    }

    const modules = competencyMapping[competencyId] || [];
    grouped[area].push({
      ...competency,
      modules,
      isCovered: modules.length > 0,
    });
  });

  return grouped;
};

/**
 * Erstellt Module-Übersicht mit Leistungszielen
 * @param {Array} modules - Array aller Module
 * @returns {Array} Module-Übersicht
 */
const createModuleOverview = (modules) => {
  return modules.map((module) => ({
    _id: module._id,
    code: module.code,
    title: module.title,
    type: module.type,
    competencyCount: Array.isArray(module.competencies)
      ? module.competencies.length
      : 0,
    competencies: Array.isArray(module.competencies)
      ? module.competencies.map((competency) => ({
          _id: competency._id,
          code: competency.code,
          title: competency.title,
          area: competency.area,
          taxonomy: competency.taxonomy,
        }))
      : [],
  }));
};

// =============================================================================
// ROUTES
// =============================================================================

/**
 * @route   GET /api/competencies/overview
 * @desc    Vollständige Übersicht aller Leistungsziele mit Abdeckungsstatistiken
 * @access  Private (nur Berufsbildner)
 */
router.get("/overview", async (req, res) => {
  try {
    // 1. Daten aus der Datenbank laden
    const [allCompetencies, allModules] = await Promise.all([
      Competency.find({}).sort({ area: 1, code: 1 }).lean(),
      Modul.find({})
        .populate("competencies", "code title area taxonomy")
        .lean(),
    ]);

    // 2. Leere Antwort wenn keine Daten vorhanden
    if (allCompetencies.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalCompetencies: 0,
            coveredCount: 0,
            uncoveredCount: 0,
            coveragePercentage: 0,
          },
          areaStats: {},
          competenciesByArea: {},
          modules: [],
          metadata: {
            generatedAt: new Date().toISOString(),
            totalAreas: 0,
          },
        },
        message: "Keine Leistungsziele gefunden",
      });
    }

    // 3. Mapping zwischen Leistungszielen und Modulen erstellen
    const { mapping: competencyMapping, coveredCompetencies } =
      createCompetencyModuleMapping(allModules);

    // 4. Gesamtstatistiken berechnen
    const totalCompetencies = allCompetencies.length;
    const coveredCount = coveredCompetencies.size;
    const uncoveredCount = totalCompetencies - coveredCount;
    const coveragePercentage = Math.round(
      (coveredCount / totalCompetencies) * 100
    );

    // 5. Statistiken pro Handlungskompetenzbereich
    const areaStats = calculateAreaStats(allCompetencies, coveredCompetencies);

    // 6. Leistungsziele nach Bereichen gruppieren
    const competenciesByArea = groupCompetenciesByArea(
      allCompetencies,
      competencyMapping
    );

    // 7. Module-Übersicht erstellen
    const moduleOverview = createModuleOverview(allModules);

    // 8. Response-Daten zusammenstellen
    const responseData = {
      overview: {
        totalCompetencies,
        coveredCount,
        uncoveredCount,
        coveragePercentage,
      },
      areaStats,
      competenciesByArea,
      modules: moduleOverview,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalAreas: Object.keys(areaStats).length,
      },
    };

    // Erfolgreiche Antwort senden
    res.status(200).json({
      success: true,
      data: responseData,
      message: "Leistungsziele-Übersicht erfolgreich geladen",
    });
  } catch (error) {
    // Fehlerbehandlung
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Leistungsziele-Übersicht",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
});

/**
 * @route   GET /api/competencies/area/:area
 * @desc    Leistungsziele eines spezifischen Handlungskompetenzbereichs
 * @access  Private (alle authentifizierten Benutzer)
 * @param   {string} area - Handlungskompetenzbereich (a-h)
 */
router.get("/area/:area", async (req, res) => {
  try {
    const { area } = req.params;

    // Bereichs-Validierung
    if (!isValidArea(area)) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger Bereich. Erlaubt sind: a-h",
      });
    }

    // Leistungsziele des Bereichs laden
    const competencies = await Competency.find({
      area: area.toLowerCase(),
    })
      .sort({ code: 1 })
      .lean();

    // Module laden, die diese Leistungsziele abdecken
    const modules = await Modul.find({
      competencies: { $in: competencies.map((c) => c._id) },
    })
      .populate("competencies", "code title")
      .lean();

    // Mapping zwischen Leistungszielen und Modulen erstellen
    const competencyModuleMap = {};
    modules.forEach((module) => {
      if (!Array.isArray(module.competencies)) return;

      module.competencies.forEach((comp) => {
        const compId = comp._id.toString();
        if (!competencyModuleMap[compId]) {
          competencyModuleMap[compId] = [];
        }
        competencyModuleMap[compId].push({
          _id: module._id,
          code: module.code,
          title: module.title,
          type: module.type,
        });
      });
    });

    // Leistungsziele mit Modul-Informationen anreichern
    const enrichedCompetencies = competencies.map((comp) => ({
      ...comp,
      modules: competencyModuleMap[comp._id.toString()] || [],
      isCovered: !!competencyModuleMap[comp._id.toString()],
    }));

    res.status(200).json({
      success: true,
      data: enrichedCompetencies,
      message: `Leistungsziele für Bereich ${area.toUpperCase()} erfolgreich geladen`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Leistungsziele",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
});

/**
 * @route   GET /api/competencies
 * @desc    Alle Leistungsziele (optional mit Suchparametern)
 * @access  Private (alle authentifizierten Benutzer)
 * @query   {string} search - Suchbegriff für Titel/Beschreibung
 * @query   {string} area - Filter nach Handlungskompetenzbereich
 * @query   {string} taxonomy - Filter nach Taxonomie-Stufe
 */
router.get("/", async (req, res) => {
  try {
    const { search, area, taxonomy } = req.query;
    const filter = {};

    // Filter aufbauen
    if (area && isValidArea(area)) {
      filter.area = area.toLowerCase();
    }

    if (taxonomy) {
      filter.taxonomy = taxonomy.toUpperCase();
    }

    // Basis-Query
    let query = Competency.find(filter).sort({ area: 1, code: 1 });

    // Textsuche hinzufügen
    if (search && search.trim().length >= 2) {
      const searchRegex = new RegExp(search.trim(), "i");
      query = query.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { code: searchRegex },
        ],
      });
    }

    const competencies = await query.lean();

    res.status(200).json({
      success: true,
      data: competencies,
      message: `${competencies.length} Leistungsziele gefunden`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Leistungsziele",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
});

/**
 * @route   GET /api/competencies/:id
 * @desc    Einzelnes Leistungsziel mit Details
 * @access  Private (alle authentifizierten Benutzer)
 * @param   {string} id - Leistungsziel-ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const competency = await Competency.findById(id).lean();

    if (!competency) {
      return res.status(404).json({
        success: false,
        message: "Leistungsziel nicht gefunden",
      });
    }

    // Module laden, die dieses Leistungsziel abdecken
    const modules = await Modul.find({
      competencies: id,
    })
      .select("code title type description duration")
      .lean();

    const enrichedCompetency = {
      ...competency,
      modules,
      isCovered: modules.length > 0,
    };

    res.status(200).json({
      success: true,
      data: enrichedCompetency,
      message: "Leistungsziel erfolgreich geladen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden des Leistungsziels",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
});

export default router;
