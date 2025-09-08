import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { SearchIcon, FilterIcon, BookOpenIcon } from "lucide-react";

import Navbar from "../components/Navbar";
import ModuleCard from "../components/ModuleCard";
import { moduleAPI, userAPI } from "../lib/api";

const ModulesPage = ({ user, onLogout }) => {
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showCompleted, setShowCompleted] = useState("all");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        if (user && !user.isBB) {
          // Lernende: Get modules with progress
          const res = await moduleAPI.getModulesWithProgress();
          setModules(res.data);
        } else {
          // Berufsbildner: Get all modules (readonly)
          const res = await moduleAPI.getAllModules();
          setModules(
            res.data.map((module) => ({ ...module, completed: false }))
          );
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
        toast.error("Fehler beim Laden der Module");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user]);

  useEffect(() => {
    // Filter modules based on search term, type, and completion status
    let filtered = modules.filter((module) => {
      const matchesSearch =
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (module.description &&
          module.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType =
        selectedType === "all" || module.type === selectedType;

      const matchesCompletion =
        showCompleted === "all" ||
        (showCompleted === "completed" && module.completed) ||
        (showCompleted === "pending" && !module.completed);

      return matchesSearch && matchesType && matchesCompletion;
    });

    setFilteredModules(filtered);
  }, [modules, searchTerm, selectedType, showCompleted]);

  const handleToggleComplete = async (moduleId, isCurrentlyCompleted) => {
    if (isCurrentlyCompleted) {
      await userAPI.unmarkModuleAsCompleted(moduleId);
    } else {
      await userAPI.markModuleAsCompleted(moduleId);
    }

    // Update local state
    setModules((prevModules) =>
      prevModules.map((module) =>
        module._id === moduleId
          ? {
              ...module,
              completed: !isCurrentlyCompleted,
              completedAt: !isCurrentlyCompleted
                ? new Date().toISOString()
                : null,
            }
          : module
      )
    );
  };

  const getCompletionStats = () => {
    const completed = modules.filter((m) => m.completed).length;
    const total = modules.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center text-primary py-10">
            <span className="loading loading-spinner loading-lg"></span>
            <div className="mt-4">Lade Module...</div>
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
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Module Übersicht
          </h1>
          <p className="text-base-content/70">
            {user.isBB
              ? "Übersicht aller verfügbaren Module."
              : "Hier können Sie Ihre abgeschlossenen Module verwalten."}
          </p>
        </div>

        {/* Stats */}
        {!user.isBB && (
          <div className="stats shadow mb-8">
            <div className="stat">
              <div className="stat-figure text-primary">
                <BookOpenIcon className="size-8" />
              </div>
              <div className="stat-title">Abgeschlossene Module</div>
              <div className="stat-value text-primary">{stats.completed}</div>
              <div className="stat-desc">von {stats.total} Modulen</div>
            </div>

            <div className="stat">
              <div className="stat-title">Fortschritt</div>
              <div className="stat-value">{stats.percentage}%</div>
              <div className="stat-desc">
                <div className="w-full bg-base-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="input-group">
                  <span>
                    <SearchIcon className="size-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Module suchen..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Alle Typen</option>
                  <option value="BFS">BFS</option>
                  <option value="BAND">BAND</option>
                  <option value="ÜK">ÜK</option>
                </select>
              </div>

              {/* Completion Filter */}
              {!user.isBB && (
                <div className="form-control">
                  <select
                    className="select select-bordered"
                    value={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.value)}
                  >
                    <option value="all">Alle Module</option>
                    <option value="completed">Abgeschlossen</option>
                    <option value="pending">Ausstehend</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-base-content/70">
            {filteredModules.length} von {modules.length} Modulen
          </div>
          {(searchTerm ||
            selectedType !== "all" ||
            showCompleted !== "all") && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setShowCompleted("all");
              }}
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        {/* Module Grid */}
        {filteredModules.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="size-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Keine Module gefunden
            </h3>
            <p className="text-base-content/70">
              {modules.length === 0
                ? "Es sind noch keine Module verfügbar."
                : "Versuchen Sie, Ihre Suchkriterien anzupassen."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module._id}
                module={module}
                isCompleted={module.completed}
                completedAt={module.completedAt}
                onToggleComplete={handleToggleComplete}
                canEdit={!user.isBB} // Only students can mark modules as completed
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulesPage;
