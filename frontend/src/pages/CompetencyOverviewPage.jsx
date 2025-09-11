// frontend/src/pages/CompetencyOverviewPage.jsx
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

  // Daten laden
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const response = await competencyAPI.getCompetencyOverview();
        setOverviewData(response.data);
      } catch (error) {
        console.error("Error fetching competency overview:", error);
        toast.error("Fehler beim Laden der Leistungsziele-Übersicht");
      } finally {
        setLoading(false);
      }
    };

    if (user?.isBB) {
      fetchOverviewData();
    }
  }, [user]);

  // Daten aktualisieren
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await competencyAPI.getCompetencyOverview();
      setOverviewData(response.data);
      toast.success("Daten erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Fehler beim Aktualisieren der Daten");
    } finally {
      setLoading(false);
    }
  };

  // Filter und Suche
  const getFilteredAreas = () => {
    if (!overviewData) return {};

    const { competenciesByArea } = overviewData;
    const filteredAreas = {};

    Object.keys(competenciesByArea).forEach((area) => {
      let areaCompetencies = competenciesByArea[area];

      // Status Filter
      if (filterStatus === "covered") {
        areaCompetencies = areaCompetencies.filter((c) => c.isCovered);
      } else if (filterStatus === "missing") {
        areaCompetencies = areaCompetencies.filter((c) => !c.isCovered);
      }

      // Suchfilter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        areaCompetencies = areaCompetencies.filter(
          (c) =>
            c.code.toLowerCase().includes(searchLower) ||
            c.title.toLowerCase().includes(searchLower) ||
            c.description?.toLowerCase().includes(searchLower)
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

    return filteredAreas;
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!overviewData) return;

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
      overviewData.competenciesByArea[area].forEach((competency) => {
        csvData.push([
          area,
          competency.code,
          competency.title,
          competency.description || "",
          competency.taxonomy,
          competency.isCovered ? "Abgedeckt" : "Fehlend",
          competency.modules?.map((m) => m.code).join("; ") || "",
        ]);
      });
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

  const filteredAreas = getFilteredAreas();
  const { overview, areaStats } = overviewData;

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
              {overview.totalCompetencies}
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-success">
              <CheckCircle2Icon className="size-8" />
            </div>
            <div className="stat-title">Abgedeckt</div>
            <div className="stat-value text-success">
              {overview.coveredCount}
            </div>
            <div className="stat-desc">
              {overview.coveragePercentage}% abgedeckt
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-error">
              <AlertTriangleIcon className="size-8" />
            </div>
            <div className="stat-title">Fehlend</div>
            <div className="stat-value text-error">
              {overview.uncoveredCount}
            </div>
            <div className="stat-desc">
              {100 - overview.coveragePercentage}% fehlend
            </div>
          </div>

          <div className="stat bg-base-100 shadow-sm rounded-lg">
            <div className="stat-figure text-info">
              <TrendingUpIcon className="size-8" />
            </div>
            <div className="stat-title">Fortschritt</div>
            <div className="stat-value text-info">
              {overview.coveragePercentage}%
            </div>
            <div className="w-full bg-base-200 rounded-full h-2 mt-2">
              <div
                className="bg-info h-2 rounded-full transition-all duration-500"
                style={{ width: `${overview.coveragePercentage}%` }}
              ></div>
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

              {/* Bereichsfilter */}
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
                    {Object.keys(areaStats).map((area) => {
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
                                className={`badge badge-${areaInfo.color} badge-sm`}
                              >
                                {areaInfo.code}
                              </span>
                              <span className="text-sm">{areaInfo.title}</span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bereichs-Übersichten */}
        <div className="space-y-6">
          {Object.keys(filteredAreas)
            .sort() // Alphabetische Sortierung
            .map((area) => (
              <AreaOverview
                key={area}
                area={area}
                competencies={filteredAreas[area]}
                stats={areaStats[area]}
              />
            ))}
        </div>

        {Object.keys(filteredAreas).length === 0 && (
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
