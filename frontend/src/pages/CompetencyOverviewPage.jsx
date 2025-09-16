import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  TargetIcon,
  BarChart3Icon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import AreaOverview from "../components/AreaOverview";
import { competencyAPI, competencyHelpers } from "../lib/api";

// ========================================
// INITIAL STATE
// ========================================

const INITIAL_FILTER_STATE = {
  searchTerm: "",
  filterStatus: "all", // all, covered, missing
  selectedAreas: new Set(),
};

// ========================================
// MAIN COMPONENT
// ========================================

const CompetencyOverviewPage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // State Management
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTER_STATE);

  // ========================================
  // ACCESS CONTROL
  // ========================================

  // Überprüfung der Berechtigung
  useEffect(() => {
    if (!user?.isBB) {
      toast.error("Zugriff verweigert - nur für Berufsbildner");
      navigate("/dashboard");
    }
  }, [user?.isBB, navigate]);

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchOverviewData = useCallback(async () => {
    if (!user?.isBB) return;

    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching competency overview...");

      const response = await competencyAPI.getCompetencyOverview();

      console.log("📦 Full API Response:", {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });

      console.log("📦 Raw response.data:", response.data);

      // Robuste Datenvalidierung
      if (!response || !response.data) {
        throw new Error("Keine Daten in der Server-Antwort");
      }

      const { data } = response;

      console.log("🔍 Analyzing data structure:");
      console.log("- data type:", typeof data);
      console.log("- data keys:", Object.keys(data));
      console.log("- data.overview exists:", !!data.overview);
      console.log("- data.areaStats exists:", !!data.areaStats);
      console.log(
        "- data.competenciesByArea exists:",
        !!data.competenciesByArea
      );

      // Wenn data.overview nicht existiert, schaue in data selbst
      let processedData;

      if (data.overview && data.areaStats && data.competenciesByArea) {
        // Normale Struktur: { data: { overview: ..., areaStats: ..., competenciesByArea: ... } }
        processedData = data;
        console.log("✅ Using normal structure");
      } else if (
        data.totalCompetencies !== undefined ||
        data.coveredCount !== undefined
      ) {
        // Flache Struktur: Daten sind direkt in data
        processedData = {
          overview: {
            totalCompetencies: data.totalCompetencies || 0,
            coveredCount: data.coveredCount || 0,
            uncoveredCount: data.uncoveredCount || 0,
            coveragePercentage: data.coveragePercentage || 0,
          },
          areaStats: data.areaStats || {},
          competenciesByArea: data.competenciesByArea || {},
          modules: data.modules || [],
        };
        console.log("✅ Using flattened structure");
      } else {
        console.log("❌ Unrecognized data structure:", data);
        throw new Error("Unbekannte Datenstruktur vom Server");
      }

      console.log("✅ Final processed data:", {
        overview: processedData.overview,
        areaStatsCount: Object.keys(processedData.areaStats).length,
        competencyAreasCount: Object.keys(processedData.competenciesByArea)
          .length,
        modulesCount: processedData.modules?.length || 0,
      });

      setOverviewData(processedData);
    } catch (fetchError) {
      console.error("❌ Error fetching competency overview:", fetchError);

      const errorMessage =
        fetchError.response?.data?.message ||
        fetchError.message ||
        "Fehler beim Laden der Leistungsziele-Übersicht";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.isBB]);

  // ========================================
  // FILTER LOGIC
  // ========================================

  const filteredAreas = useMemo(() => {
    if (!overviewData?.competenciesByArea) {
      return {};
    }

    const { competenciesByArea } = overviewData;
    const { searchTerm, filterStatus, selectedAreas } = filters;
    const result = {};

    try {
      Object.keys(competenciesByArea).forEach((area) => {
        const areaCompetencies = competenciesByArea[area];

        // Validiere dass areaCompetencies ein Array ist
        if (!Array.isArray(areaCompetencies)) {
          console.warn(
            `⚠️ Area ${area} has invalid competencies data:`,
            areaCompetencies
          );
          return;
        }

        // Filter anwenden
        let filtered = areaCompetencies;

        // Status Filter
        if (filterStatus === "covered") {
          filtered = filtered.filter((c) => c?.isCovered === true);
        } else if (filterStatus === "missing") {
          filtered = filtered.filter((c) => c?.isCovered !== true);
        }

        // Suchfilter
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c?.code?.toLowerCase().includes(searchLower) ||
              c?.title?.toLowerCase().includes(searchLower) ||
              c?.description?.toLowerCase().includes(searchLower)
          );
        }

        // Bereichsfilter
        if (selectedAreas.size > 0 && !selectedAreas.has(area)) {
          return;
        }

        // Nur nicht-leere Bereiche hinzufügen
        if (filtered.length > 0) {
          result[area] = filtered;
        }
      });
    } catch (filterError) {
      console.error("❌ Error filtering areas:", filterError);
      return {};
    }

    return result;
  }, [overviewData?.competenciesByArea, filters]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleRefresh = useCallback(async () => {
    await fetchOverviewData();
    if (!error) {
      toast.success("Daten erfolgreich aktualisiert");
    }
  }, [fetchOverviewData, error]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearchChange = useCallback(
    (searchTerm) => {
      handleFilterChange({ searchTerm });
    },
    [handleFilterChange]
  );

  const handleStatusChange = useCallback(
    (filterStatus) => {
      handleFilterChange({ filterStatus });
    },
    [handleFilterChange]
  );

  const toggleAreaSelection = useCallback((area) => {
    setFilters((prev) => {
      const newSelectedAreas = new Set(prev.selectedAreas);
      if (newSelectedAreas.has(area)) {
        newSelectedAreas.delete(area);
      } else {
        newSelectedAreas.add(area);
      }
      return { ...prev, selectedAreas: newSelectedAreas };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  // ========================================
  // CSV EXPORT
  // ========================================

  const handleExportCSV = useCallback(() => {
    if (!overviewData?.competenciesByArea) {
      toast.error("Keine Daten zum Exportieren verfügbar");
      return;
    }

    try {
      const csvData = [
        [
          "Bereich",
          "Code",
          "Titel",
          "Beschreibung",
          "Taxonomie",
          "Status",
          "Module",
        ],
      ];

      Object.keys(overviewData.competenciesByArea).forEach((area) => {
        const areaCompetencies = overviewData.competenciesByArea[area];

        if (Array.isArray(areaCompetencies)) {
          areaCompetencies.forEach((competency) => {
            const modules = Array.isArray(competency?.modules)
              ? competency.modules.map((m) => m?.code).join("; ")
              : "";

            csvData.push([
              area || "",
              competency?.code || "",
              competency?.title || "",
              competency?.description || "",
              competency?.taxonomy || "",
              competency?.isCovered ? "Abgedeckt" : "Fehlend",
              modules,
            ]);
          });
        }
      });

      const csvContent = csvData
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `leistungsziele_uebersicht_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();

      toast.success("CSV-Export erfolgreich");
    } catch (exportError) {
      console.error("❌ CSV Export failed:", exportError);
      toast.error("Fehler beim Exportieren der CSV-Datei");
    }
  }, [overviewData?.competenciesByArea]);

  // ========================================
  // RENDER CONDITIONS
  // ========================================

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center text-primary py-10">
            <span className="loading loading-spinner loading-lg"></span>
            <div className="mt-4">Lade Leistungsziele-Übersicht...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !overviewData) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center py-12">
            <AlertTriangleIcon className="size-16 text-error mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Fehler beim Laden
            </h3>
            <p className="text-base-content/70 mb-4">
              {error || "Die Daten konnten nicht geladen werden"}
            </p>
            <button className="btn btn-primary" onClick={handleRefresh}>
              <RefreshCwIcon className="size-4" />
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Data validation
  const { overview, areaStats } = overviewData;
  if (!overview || !areaStats) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center py-12">
            <AlertTriangleIcon className="size-16 text-warning mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Unvollständige Daten
            </h3>
            <p className="text-base-content/70 mb-4">
              Die geladenen Daten sind unvollständig
            </p>
            <button className="btn btn-primary" onClick={handleRefresh}>
              <RefreshCwIcon className="size-4" />
              Daten neu laden
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-base-content mb-2 flex items-center gap-3">
                <TargetIcon className="size-8 text-primary" />
                Leistungsziele-Übersicht
              </h1>
              <p className="text-base-content/70">
                Vollständige Übersicht aller Leistungsziele und deren Abdeckung
                durch Module
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="btn btn-ghost btn-sm"
                disabled={loading}
              >
                <RefreshCwIcon className="size-4" />
              </button>
              <button
                onClick={handleExportCSV}
                className="btn btn-primary btn-sm"
              >
                <DownloadIcon className="size-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-primary">
              <TargetIcon className="size-8" />
            </div>
            <div className="stat-title">Gesamt Leistungsziele</div>
            <div className="stat-value text-primary">
              {overview.totalCompetencies || 0}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-success">
              <CheckCircle2Icon className="size-8" />
            </div>
            <div className="stat-title">Abgedeckt</div>
            <div className="stat-value text-success">
              {overview.coveredCount || 0}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-error">
              <AlertTriangleIcon className="size-8" />
            </div>
            <div className="stat-title">Fehlend</div>
            <div className="stat-value text-error">
              {overview.uncoveredCount || 0}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-info">
              <TrendingUpIcon className="size-8" />
            </div>
            <div className="stat-title">Abdeckung</div>
            <div className="stat-value text-info">
              {overview.coveragePercentage || 0}%
            </div>
            <div className="stat-desc">
              <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                <div
                  className="bg-info h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overview.coveragePercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="form-control">
                <div className="input-group">
                  <span>
                    <SearchIcon className="size-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Leistungsziele suchen..."
                    className="input input-bordered flex-1"
                    value={filters.searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={filters.filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="all">Alle Status</option>
                  <option value="covered">Nur Abgedeckte</option>
                  <option value="missing">Nur Fehlende</option>
                </select>
              </div>

              {/* Area Filter */}
              <div className="form-control">
                <div className="dropdown dropdown-end w-full">
                  <label tabIndex={0} className="btn btn-outline w-full">
                    <FilterIcon className="size-4" />
                    Bereiche (
                    {filters.selectedAreas.size > 0
                      ? filters.selectedAreas.size
                      : "Alle"}
                    )
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50"
                  >
                    {areaStats &&
                      Object.keys(areaStats).map((area) => {
                        const areaInfo = competencyHelpers.formatArea(area);
                        return (
                          <li key={area}>
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={filters.selectedAreas.has(area)}
                                onChange={() => toggleAreaSelection(area)}
                              />
                              <span className="flex items-center gap-2">
                                <span
                                  className={`badge badge-${areaInfo.color} badge-sm`}
                                >
                                  {areaInfo.code}
                                </span>
                                <span className="text-sm">
                                  {areaInfo.title}
                                </span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            {(filters.searchTerm ||
              filters.filterStatus !== "all" ||
              filters.selectedAreas.size > 0) && (
              <div className="flex justify-end mt-4">
                <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {filteredAreas && Object.keys(filteredAreas).length > 0 ? (
            Object.keys(filteredAreas)
              .sort()
              .map((area) => (
                <AreaOverview
                  key={area}
                  area={area}
                  competencies={filteredAreas[area]}
                  stats={areaStats[area]}
                />
              ))
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="size-16 text-base-content/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-base-content mb-2">
                Keine Ergebnisse gefunden
              </h3>
              <p className="text-base-content/70 mb-4">
                Versuchen Sie andere Suchbegriffe oder Filter.
              </p>
              <button className="btn btn-primary" onClick={resetFilters}>
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetencyOverviewPage;
