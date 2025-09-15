// frontend/src/pages/CompetencyOverviewPage.jsx - GEFIXT
import React, { useEffect, useState } from "react";
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

const CompetencyOverviewPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, covered, missing
  const [selectedAreas, setSelectedAreas] = useState(new Set());

  // Überprüfung ob Benutzer Berufsbildner ist
  useEffect(() => {
    if (!user?.isBB) {
      toast.error("Zugriff verweigert - nur für Berufsbildner");
      navigate("/dashboard");
      return;
    }
  }, [user, navigate]);

  // Daten laden - GEFIXT: Dependency Array präzisiert
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const response = await competencyAPI.getCompetencyOverview();

        // GEFIXT: Validierung der Response-Struktur
        if (response?.data) {
          setOverviewData(response.data);
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (error) {
        console.error("Error fetching competency overview:", error);
        toast.error("Fehler beim Laden der Leistungsziele-Übersicht");
        setOverviewData(null); // GEFIXT: Explizit auf null setzen
      } finally {
        setLoading(false);
      }
    };

    // GEFIXT: Nur einmal laden wenn user.isBB true ist
    if (user?.isBB && !overviewData && !loading) {
      fetchOverviewData();
    }
  }, [user?.isBB]); // GEFIXT: Entfernt überflüssige Dependencies

  // Daten aktualisieren
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await competencyAPI.getCompetencyOverview();

      // GEFIXT: Validierung der Response-Struktur
      if (response?.data) {
        setOverviewData(response.data);
        toast.success("Daten erfolgreich aktualisiert");
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Fehler beim Aktualisieren der Daten");
    } finally {
      setLoading(false);
    }
  };

  // Filter und Suche - GEFIXT: Robust gegen undefined/null
  const getFilteredAreas = () => {
    // GEFIXT: Defensive Programmierung - frühe Rückgabe bei fehlenden Daten
    if (!overviewData?.competenciesByArea) {
      console.warn("overviewData oder competenciesByArea ist undefined");
      return {};
    }

    const { competenciesByArea } = overviewData;
    const filteredAreas = {};

    // GEFIXT: Zusätzliche Validierung
    if (typeof competenciesByArea !== "object" || competenciesByArea === null) {
      console.error(
        "competenciesByArea ist kein gültiges Objekt:",
        competenciesByArea
      );
      return {};
    }

    try {
      Object.keys(competenciesByArea).forEach((area) => {
        let areaCompetencies = competenciesByArea[area];

        // GEFIXT: Validierung dass areaCompetencies ein Array ist
        if (!Array.isArray(areaCompetencies)) {
          console.warn(
            `areaCompetencies für Bereich ${area} ist kein Array:`,
            areaCompetencies
          );
          return; // Diesen Bereich überspringen
        }

        // Status Filter
        if (filterStatus === "covered") {
          areaCompetencies = areaCompetencies.filter((c) => c?.isCovered);
        } else if (filterStatus === "missing") {
          areaCompetencies = areaCompetencies.filter((c) => !c?.isCovered);
        }

        // Suchfilter
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          areaCompetencies = areaCompetencies.filter(
            (c) =>
              c?.code?.toLowerCase().includes(searchLower) ||
              c?.title?.toLowerCase().includes(searchLower) ||
              c?.description?.toLowerCase().includes(searchLower)
          );
        }

        // Bereichsfilter
        if (selectedAreas.size > 0 && !selectedAreas.has(area)) {
          return; // Bereich überspringen
        }

        if (areaCompetencies.length > 0) {
          filteredAreas[area] = areaCompetencies;
        }
      });
    } catch (error) {
      console.error("Fehler beim Filtern der Bereiche:", error);
      return {};
    }

    return filteredAreas;
  };

  // CSV Export - GEFIXT: Defensive Programmierung
  const handleExportCSV = () => {
    if (!overviewData?.competenciesByArea) {
      toast.error("Keine Daten zum Exportieren verfügbar");
      return;
    }

    try {
      const csvData = [];
      csvData.push([
        "Bereich",
        "Code",
        "Titel",
        "Beschreibung",
        "Taxonomie",
        "Status",
        "Module",
      ]);

      Object.keys(overviewData.competenciesByArea).forEach((area) => {
        const areaCompetencies = overviewData.competenciesByArea[area];
        if (Array.isArray(areaCompetencies)) {
          areaCompetencies.forEach((competency) => {
            csvData.push([
              area,
              competency?.code || "",
              competency?.title || "",
              competency?.description || "",
              competency?.taxonomy || "",
              competency?.isCovered ? "Abgedeckt" : "Fehlend",
              competency?.modules?.map((m) => m?.code).join("; ") || "",
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
    } catch (error) {
      console.error("Fehler beim CSV Export:", error);
      toast.error("Fehler beim Exportieren der CSV-Datei");
    }
  };

  // Bereich Toggle
  const toggleAreaSelection = (area) => {
    const newSelection = new Set(selectedAreas);
    if (newSelection.has(area)) {
      newSelection.delete(area);
    } else {
      newSelection.add(area);
    }
    setSelectedAreas(newSelection);
  };

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

  if (!overviewData) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center py-12">
            <AlertTriangleIcon className="size-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Keine Daten verfügbar
            </h3>
            <button className="btn btn-primary" onClick={handleRefresh}>
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GEFIXT: Defensive Programmierung für die Render-Phase
  const filteredAreas = getFilteredAreas();
  const { overview, areaStats } = overviewData;

  // GEFIXT: Validierung der benötigten Daten vor Rendering
  if (!overview || !areaStats) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center py-12">
            <AlertTriangleIcon className="size-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Unvollständige Daten
            </h3>
            <p className="text-base-content/70 mb-4">
              Die geladenen Daten sind unvollständig.
            </p>
            <button className="btn btn-primary" onClick={handleRefresh}>
              Daten neu laden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Header */}
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
                disabled={!overviewData?.competenciesByArea}
              >
                <DownloadIcon className="size-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Gesamtstatistiken */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-primary">
              <TargetIcon className="size-8" />
            </div>
            <div className="stat-title">Gesamt Leistungsziele</div>
            <div className="stat-value text-primary">
              {overview?.totalCompetencies || 0}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-success">
              <CheckCircle2Icon className="size-8" />
            </div>
            <div className="stat-title">Abgedeckt</div>
            <div className="stat-value text-success">
              {overview?.coveredCount || 0}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-error">
              <AlertTriangleIcon className="size-8" />
            </div>
            <div className="stat-title">Fehlend</div>
            <div className="stat-value text-error">
              {overview?.uncoveredCount || 0}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-info">
              <TrendingUpIcon className="size-8" />
            </div>
            <div className="stat-title">Abdeckung</div>
            <div className="stat-value text-info">
              {overview?.coveragePercentage || 0}%
            </div>
            <div className="stat-desc">
              <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                <div
                  className="bg-info h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overview?.coveragePercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter und Suche */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Suche */}
              <div className="form-control">
                <div className="input-group">
                  <span>
                    <SearchIcon className="size-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Leistungsziele suchen..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Alle Status</option>
                  <option value="covered">Nur Abgedeckte</option>
                  <option value="missing">Nur Fehlende</option>
                </select>
              </div>

              {/* Bereichsfilter - GEFIXT: Defensive Programmierung */}
              <div className="form-control">
                <div className="dropdown dropdown-end w-full">
                  <label tabIndex={0} className="btn btn-outline w-full">
                    <FilterIcon className="size-4" />
                    Bereiche (
                    {selectedAreas.size > 0 ? selectedAreas.size : "Alle"})
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50"
                  >
                    {/* GEFIXT: Sichere Iteration über areaStats */}
                    {areaStats && typeof areaStats === "object" ? (
                      Object.keys(areaStats).map((area) => {
                        const areaInfo = competencyHelpers.formatArea(area);
                        return (
                          <li key={area}>
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={selectedAreas.has(area)}
                                onChange={() => toggleAreaSelection(area)}
                              />
                              <span className="flex items-center gap-2">
                                <span
                                  className={`badge badge-${
                                    areaInfo?.color || "neutral"
                                  } badge-sm`}
                                >
                                  {areaInfo?.code || area}
                                </span>
                                <span className="text-sm">
                                  {areaInfo?.title || area}
                                </span>
                              </span>
                            </label>
                          </li>
                        );
                      })
                    ) : (
                      <li>
                        <span className="text-sm text-base-content/60">
                          Keine Bereiche verfügbar
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bereichs-Übersichten - GEFIXT: Sichere Iteration */}
        <div className="space-y-6">
          {filteredAreas && Object.keys(filteredAreas).length > 0
            ? Object.keys(filteredAreas)
                .sort() // Alphabetische Sortierung
                .map((area) => (
                  <AreaOverview
                    key={area}
                    area={area}
                    competencies={filteredAreas[area]}
                    stats={areaStats?.[area]}
                  />
                ))
            : null}
        </div>

        {/* Keine Ergebnisse */}
        {filteredAreas && Object.keys(filteredAreas).length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="size-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Keine Ergebnisse gefunden
            </h3>
            <p className="text-base-content/70 mb-4">
              Versuchen Sie andere Suchbegriffe oder Filter.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setSelectedAreas(new Set());
              }}
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyOverviewPage;
