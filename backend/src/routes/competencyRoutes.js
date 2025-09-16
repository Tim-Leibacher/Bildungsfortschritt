// backend/src/routes/competencyRoutes.js
import express from "express";
import Competency from "../models/Competency.js";
import Modul from "../models/Modul.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/debug", authenticate, authorize("BB"), async (req, res) => {
  try {
    console.log("🔍 DEBUG: Testing response structure...");

    const testData = {
      overview: {
        totalCompetencies: 45,
        coveredCount: 38,
        uncoveredCount: 7,
        coveragePercentage: 84,
      },
      areaStats: {
        A: { total: 5, covered: 4, uncovered: 1, percentage: 80 },
        B: { total: 2, covered: 2, uncovered: 0, percentage: 100 },
      },
      competenciesByArea: {
        A: [
          {
            _id: "test123",
            code: "A1.1",
            title: "Test Kompetenz",
            isCovered: true,
            modules: [],
          },
        ],
      },
    };

    console.log("📤 Sending test response:", testData);

    res.status(200).json({
      success: true,
      data: testData,
      message: "Debug test",
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// KORRIGIERTE OVERVIEW ROUTE
// ============================================================================

router.get("/overview", authenticate, authorize("BB"), async (req, res) => {
  try {
    console.log("🔍 Starting competency overview generation...");

    // 1. Alle Leistungsziele laden
    const allCompetencies = await Competency.find({})
      .sort({ area: 1, code: 1 })
      .lean();

    console.log(`📊 Found ${allCompetencies.length} competencies`);

    // 2. Alle Module mit ihren Leistungszielen laden
    const allModules = await Modul.find({})
      .populate("competencies", "code title area taxonomy")
      .lean();

    console.log(`📚 Found ${allModules.length} modules`);

    // Early return if no data
    if (!allCompetencies.length) {
      const emptyResponse = {
        overview: {
          totalCompetencies: 0,
          coveredCount: 0,
          uncoveredCount: 0,
          coveragePercentage: 0,
        },
        areaStats: {},
        competenciesByArea: {},
        modules: [],
      };

      console.log("📤 Sending empty response:", emptyResponse);

      return res.status(200).json({
        success: true,
        data: emptyResponse,
        message: "Keine Leistungsziele gefunden",
      });
    }

    // 3. Mapping: Welche Leistungsziele werden von welchen Modulen abgedeckt
    const competencyModuleMapping = {};
    const coveredCompetencies = new Set();

    allModules.forEach((module) => {
      if (Array.isArray(module.competencies)) {
        module.competencies.forEach((competency) => {
          if (competency && competency._id) {
            const competencyId = competency._id.toString();

            if (!competencyModuleMapping[competencyId]) {
              competencyModuleMapping[competencyId] = [];
            }

            competencyModuleMapping[competencyId].push({
              _id: module._id,
              code: module.code,
              title: module.title,
              type: module.type,
            });

            coveredCompetencies.add(competencyId);
          }
        });
      }
    });

    console.log(`🔗 Mapped ${coveredCompetencies.size} covered competencies`);

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
        _id: competency._id,
        code: competency.code,
        title: competency.title,
        description: competency.description,
        area: competency.area,
        taxonomy: competency.taxonomy,
        isCovered,
        modules: competencyModuleMapping[competencyId] || [],
        moduleCount: competencyModuleMapping[competencyId]?.length || 0,
      });
    });

    console.log(
      `📋 Grouped into ${Object.keys(competenciesByArea).length} areas`
    );

    // 5. Statistiken berechnen
    const totalCompetencies = allCompetencies.length;
    const coveredCount = coveredCompetencies.size;
    const uncoveredCount = totalCompetencies - coveredCount;
    const coveragePercentage =
      totalCompetencies > 0
        ? Math.round((coveredCount / totalCompetencies) * 100)
        : 0;

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

    // 7. Module Overview
    const moduleOverview = allModules.map((module) => ({
      _id: module._id,
      code: module.code,
      title: module.title,
      type: module.type,
      competencyCount: Array.isArray(module.competencies)
        ? module.competencies.length
        : 0,
      competencies: Array.isArray(module.competencies)
        ? module.competencies.map((c) => ({
            _id: c._id,
            code: c.code,
            title: c.title,
            area: c.area,
            taxonomy: c.taxonomy,
          }))
        : [],
    }));

    // 8. Response zusammenstellen - KRITISCH: Korrekte Struktur!
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
    };

    console.log("📤 FINAL RESPONSE STRUCTURE:");
    console.log(
      "- overview:",
      !!responseData.overview,
      Object.keys(responseData.overview || {})
    );
    console.log(
      "- areaStats:",
      !!responseData.areaStats,
      Object.keys(responseData.areaStats || {})
    );
    console.log(
      "- competenciesByArea:",
      !!responseData.competenciesByArea,
      Object.keys(responseData.competenciesByArea || {})
    );
    console.log("- modules count:", responseData.modules?.length || 0);

    console.log("✅ Overview generated successfully:", {
      totalCompetencies,
      coveredCount,
      areasCount: Object.keys(areaStats).length,
    });

    // WICHTIG: Die Response-Struktur muss genau so sein!
    const finalResponse = {
      success: true,
      data: responseData,
      message: "Leistungsziele-Übersicht erfolgreich geladen",
    };

    console.log("📤 Sending final response with structure:", {
      hasSuccess: !!finalResponse.success,
      hasData: !!finalResponse.data,
      dataKeys: finalResponse.data ? Object.keys(finalResponse.data) : [],
    });

    res.status(200).json(finalResponse);
  } catch (error) {
    console.error("❌ Error in competency overview:", error);
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
 * @route   GET /api/competencies/overview
 * @desc    Get competency coverage overview for Berufsbildner
 * @access  Private (Berufsbildner only)
 */
router.get("/overview", authenticate, authorize("BB"), async (req, res) => {
  try {
    console.log("🔍 Starting competency overview generation...");

    // 1. Alle Leistungsziele laden
    const allCompetencies = await Competency.find({})
      .sort({ area: 1, code: 1 })
      .lean();

    console.log(`📊 Found ${allCompetencies.length} competencies`);

    // 2. Alle Module mit ihren Leistungszielen laden
    const allModules = await Modul.find({})
      .populate("competencies", "code title area taxonomy")
      .lean();

    console.log(`📚 Found ${allModules.length} modules`);

    // Early return if no data
    if (!allCompetencies.length) {
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
        },
        message: "Keine Leistungsziele gefunden",
      });
    }

    // 3. Mapping: Welche Leistungsziele werden von welchen Modulen abgedeckt
    const competencyModuleMapping = {};
    const coveredCompetencies = new Set();

    allModules.forEach((module) => {
      if (Array.isArray(module.competencies)) {
        module.competencies.forEach((competency) => {
          if (competency && competency._id) {
            const competencyId = competency._id.toString();

            if (!competencyModuleMapping[competencyId]) {
              competencyModuleMapping[competencyId] = [];
            }

            competencyModuleMapping[competencyId].push({
              _id: module._id,
              code: module.code,
              title: module.title,
              type: module.type,
            });

            coveredCompetencies.add(competencyId);
          }
        });
      }
    });

    console.log(`🔗 Mapped ${coveredCompetencies.size} covered competencies`);

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
        _id: competency._id,
        code: competency.code,
        title: competency.title,
        description: competency.description,
        area: competency.area,
        taxonomy: competency.taxonomy,
        isCovered,
        modules: competencyModuleMapping[competencyId] || [],
        moduleCount: competencyModuleMapping[competencyId]?.length || 0,
      });
    });

    console.log(
      `📋 Grouped into ${Object.keys(competenciesByArea).length} areas`
    );

    // 5. Statistiken berechnen
    const totalCompetencies = allCompetencies.length;
    const coveredCount = coveredCompetencies.size;
    const uncoveredCount = totalCompetencies - coveredCount;
    const coveragePercentage =
      totalCompetencies > 0
        ? Math.round((coveredCount / totalCompetencies) * 100)
        : 0;

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

    // 7. Module Overview
    const moduleOverview = allModules.map((module) => ({
      _id: module._id,
      code: module.code,
      title: module.title,
      type: module.type,
      competencyCount: Array.isArray(module.competencies)
        ? module.competencies.length
        : 0,
      competencies: Array.isArray(module.competencies)
        ? module.competencies.map((c) => ({
            _id: c._id,
            code: c.code,
            title: c.title,
            area: c.area,
            taxonomy: c.taxonomy,
          }))
        : [],
    }));

    // 8. Response zusammenstellen - KRITISCH: Korrekte Struktur!
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

    console.log("✅ Overview generated successfully:", {
      totalCompetencies,
      coveredCount,
      areasCount: Object.keys(areaStats).length,
    });

    // WICHTIG: success: true und data-Struktur muss stimmen!
    res.status(200).json({
      success: true,
      data: responseData,
      message: "Leistungsziele-Übersicht erfolgreich geladen",
    });
  } catch (error) {
    console.error("❌ Error in competency overview:", error);
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
 * @desc    Get competencies by area with module information
 * @access  Private
 */
router.get("/area/:area", authenticate, async (req, res) => {
  try {
    const { area } = req.params;

    if (!area || !/^[a-h]$/i.test(area)) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger Bereich. Erlaubt sind: a-h",
      });
    }

    const competencies = await Competency.find({
      area: area.toLowerCase(),
    })
      .sort({ code: 1 })
      .lean();

    const modules = await Modul.find({
      competencies: { $in: competencies.map((c) => c._id) },
    })
      .populate("competencies", "code title")
      .lean();

    const competencyModuleMap = {};
    modules.forEach((module) => {
      if (Array.isArray(module.competencies)) {
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
      }
    });

    const enrichedCompetencies = competencies.map((comp) => ({
      ...comp,
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
