// backend/src/routes/competencyRoutes.js - Erweiterte Competency Routes

import express from "express";
import Competency from "../models/Competency.js";
import Modul from "../models/Modul.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Bestehende Routes (falls vorhanden)
// ... bestehende Routes hier ...

/**
 * @route   GET /api/competencies/overview
 * @desc    Get competency coverage overview for Berufsbildner
 * @access  Private (Berufsbildner only)
 */
router.get("/overview", authenticate, authorize("BB"), async (req, res) => {
  try {
    // 1. Alle Leistungsziele laden
    const allCompetencies = await Competency.find({})
      .sort({ area: 1, code: 1 })
      .lean();

    // 2. Alle Module mit ihren Leistungszielen laden
    const allModules = await Modul.find({})
      .populate("competencies", "code title area")
      .lean();

    // 3. Mapping: Welche Leistungsziele werden von welchen Modulen abgedeckt
    const competencyModuleMapping = {};
    const coveredCompetencies = new Set();

    allModules.forEach((module) => {
      module.competencies.forEach((competency) => {
        const competencyId = competency._id.toString();

        if (!competencyModuleMapping[competencyId]) {
          competencyModuleMapping[competencyId] = [];
        }

        competencyModuleMapping[competencyId].push({
          code: module.code,
          title: module.title,
          type: module.type,
        });

        coveredCompetencies.add(competencyId);
      });
    });

    // 4. Gruppierung nach Handlungskompetenzbereichen
    const competenciesByArea = {};
    allCompetencies.forEach((competency) => {
      const area = competency.area.toUpperCase();
      if (!competenciesByArea[area]) {
        competenciesByArea[area] = [];
      }

      const competencyId = competency._id.toString();
      const isCovered = coveredCompetencies.has(competencyId);

      competenciesByArea[area].push({
        ...competency,
        isCovered,
        modules: competencyModuleMapping[competencyId] || [],
        moduleCount: competencyModuleMapping[competencyId]?.length || 0,
      });
    });

    // 5. Statistiken berechnen
    const totalCompetencies = allCompetencies.length;
    const coveredCount = coveredCompetencies.size;
    const uncoveredCount = totalCompetencies - coveredCount;
    const coveragePercentage = Math.round(
      (coveredCount / totalCompetencies) * 100
    );

    // 6. Statistiken pro Bereich
    const areaStats = {};
    Object.keys(competenciesByArea).forEach((area) => {
      const areaCompetencies = competenciesByArea[area];
      const areaCovered = areaCompetencies.filter((c) => c.isCovered).length;
      const areaTotal = areaCompetencies.length;

      areaStats[area] = {
        total: areaTotal,
        covered: areaCovered,
        uncovered: areaTotal - areaCovered,
        percentage:
          areaTotal > 0 ? Math.round((areaCovered / areaTotal) * 100) : 0,
      };
    });

    // 7. Response zusammenstellen
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCompetencies,
          coveredCount,
          uncoveredCount,
          coveragePercentage,
        },
        areaStats,
        competenciesByArea,
        modules: allModules.map((module) => ({
          code: module.code,
          title: module.title,
          type: module.type,
          competencyCount: module.competencies.length,
          competencies: module.competencies.map((c) => ({
            code: c.code,
            title: c.title,
            area: c.area,
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Error in competency overview:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Leistungsziele-Übersicht",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/competencies/area/:area
 * @desc    Get competencies by area with module information
 * @access  Private
 */
router.get("/area/:area", authenticate, async (req, res) => {
  try {
    const { area } = req.params;

    const competencies = await Competency.find({
      area: area.toLowerCase(),
    }).sort({ code: 1 });

    // Finde Module die diese Leistungsziele abdecken
    const modules = await Modul.find({
      competencies: { $in: competencies.map((c) => c._id) },
    }).populate("competencies", "code title");

    // Mapping erstellen
    const competencyModuleMap = {};
    modules.forEach((module) => {
      module.competencies.forEach((comp) => {
        const compId = comp._id.toString();
        if (!competencyModuleMap[compId]) {
          competencyModuleMap[compId] = [];
        }
        competencyModuleMap[compId].push({
          code: module.code,
          title: module.title,
          type: module.type,
        });
      });
    });

    const enrichedCompetencies = competencies.map((comp) => ({
      ...comp.toObject(),
      modules: competencyModuleMap[comp._id.toString()] || [],
      isCovered: !!competencyModuleMap[comp._id.toString()],
    }));

    res.status(200).json({
      success: true,
      data: enrichedCompetencies,
    });
  } catch (error) {
    console.error("Error fetching competencies by area:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Leistungsziele",
    });
  }
});

export default router;
