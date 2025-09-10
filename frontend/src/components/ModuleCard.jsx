import React, { useState } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  CircleIcon,
  CalendarIcon,
  GraduationCapIcon,
  LayersIcon,
  StarIcon,
  ArrowRightIcon,
} from "lucide-react";

const ModuleCard = ({
  module,
  isCompleted,
  completedAt,
  onToggleComplete,
  canEdit = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getTypeName = (type) => {
    const types = {
      BFS: "Berufsfachschule",
      ÜK: "Überbetrieblicher Kurs",
      BAND: "Betriebliche Ausbildung",
      default: "Modul",
    };
    return types[type] || types.default;
  };

  const getTypeIcon = (type) => {
    const icons = {
      BFS: "🎓",
      ÜK: "🏢",
      BAND: "💼",
      default: "📚",
    };
    return icons[type] || icons.default;
  };

  const getTypeColor = (type) => {
    const colors = {
      BFS: "primary",
      ÜK: "secondary",
      BAND: "accent",
      default: "neutral",
    };
    return colors[type] || colors.default;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDifficultyStars = (competencyCount) => {
    if (competencyCount <= 2) return 1;
    if (competencyCount <= 4) return 2;
    if (competencyCount <= 6) return 3;
    if (competencyCount <= 8) return 4;
    return 5;
  };

  // ✅ Korrigierte handleToggleClick Funktion
  const handleToggleClick = async () => {
    if (!onToggleComplete || !canEdit) return;

    setIsLoading(true);
    try {
      // Call parent function and wait for completion
      await onToggleComplete(module._id);
    } catch (error) {
      console.error("Error in ModuleCard toggle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative">
      {/* Moderne Karte mit Enhanced Styling */}
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] ${
          isCompleted
            ? "bg-success/5 border-success/20 shadow-lg shadow-success/10 hover:shadow-xl hover:shadow-success/20"
            : "bg-base-200/80 backdrop-blur-xl border-base-300/50 shadow-xl hover:shadow-2xl hover:border-primary/30"
        }`}
      >
        {/* Status Indicator */}
        <div
          className={`absolute top-0 left-0 w-full h-1 ${
            isCompleted
              ? "bg-gradient-to-r from-success to-success/60"
              : "bg-gradient-to-r from-base-300 to-base-300/30"
          }`}
        />

        {/* Success Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1 px-3 py-1 bg-success text-success-content rounded-full text-xs font-semibold shadow-lg">
              <CheckCircleIcon className="w-3 h-3" />
              Abgeschlossen
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Type Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl bg-${getTypeColor(
                  module.type
                )}/10 border border-${getTypeColor(module.type)}/20`}
              >
                <span className="text-2xl">{getTypeIcon(module.type)}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-base-content">
                    {module.code}
                  </h3>
                  <div
                    className={`px-2 py-1 rounded-md text-xs font-semibold bg-${getTypeColor(
                      module.type
                    )}/20 text-${getTypeColor(module.type)}`}
                  >
                    {module.type}
                  </div>
                </div>
                <h4 className="text-sm font-medium text-base-content/80 line-clamp-2">
                  {module.title}
                </h4>
              </div>
            </div>
          </div>

          {/* Description */}
          {module.description && (
            <div className="mb-4">
              <p className="text-sm text-base-content/70 line-clamp-3">
                {module.description}
              </p>
            </div>
          )}

          {/* Module Meta Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              {/* Type */}
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <LayersIcon className="w-4 h-4" />
                <span>{getTypeName(module.type)}</span>
              </div>

              {/* Duration */}
              {module.duration && (
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <ClockIcon className="w-4 h-4" />
                  <span>{module.duration} Wochen</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {/* Competencies Count */}
              {module.competencies && module.competencies.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>{module.competencies.length} Kompetenzen</span>
                </div>
              )}

              {/* Difficulty Stars */}
              {module.competencies && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-3 h-3 ${
                        i < getDifficultyStars(module.competencies.length)
                          ? "text-warning fill-current"
                          : "text-base-content/20"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-base-content/60 ml-1">
                    Schwierigkeit
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Completion Status */}
          {isCompleted && completedAt && (
            <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 text-sm text-success">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-medium">
                  Abgeschlossen am {formatDate(completedAt)}
                </span>
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {module.prerequisites && module.prerequisites.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-base-100/50 border border-base-300/30">
              <div className="text-xs font-medium text-base-content/70 mb-2">
                Voraussetzungen:
              </div>
              <div className="flex flex-wrap gap-1">
                {module.prerequisites.map((prereq, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-neutral/20 text-neutral-content text-xs rounded-md font-mono"
                  >
                    {prereq.code || prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-base-300/30">
            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content"
            >
              Details
              <ArrowRightIcon
                className={`w-4 h-4 transition-transform duration-300 ${
                  showDetails ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Complete Toggle */}
            {canEdit && onToggleComplete && (
              <button
                onClick={handleToggleClick}
                disabled={isLoading}
                className={`btn btn-sm gap-2 transition-all duration-300 ${
                  isCompleted ? "btn-success" : "btn-outline hover:btn-primary"
                } ${isLoading ? "loading" : ""}`}
              >
                {!isLoading &&
                  (isCompleted ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <CircleIcon className="w-4 h-4" />
                  ))}
                {isCompleted ? "Abgeschlossen" : "Als abgeschlossen markieren"}
              </button>
            )}
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-base-300/30 space-y-3 animate-in slide-in-from-top-2 duration-300">
              {/* Full Description */}
              {module.description && (
                <div>
                  <h5 className="text-sm font-semibold text-base-content mb-2">
                    Beschreibung:
                  </h5>
                  <p className="text-sm text-base-content/70">
                    {module.description}
                  </p>
                </div>
              )}

              {/* Competencies List */}
              {module.competencies && module.competencies.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-base-content mb-2">
                    Zugehörige Kompetenzen:
                  </h5>
                  <div className="space-y-2">
                    {module.competencies.map((comp, index) => (
                      <div
                        key={index}
                        className="text-xs text-base-content/60 font-mono"
                      >
                        {typeof comp === "string"
                          ? comp
                          : comp.code || `Kompetenz ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objectives */}
              <div className="p-3 rounded-lg bg-info/5 border border-info/20">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCapIcon className="w-4 h-4 text-info" />
                  <span className="text-sm font-medium text-info">
                    Lernziele
                  </span>
                </div>
                <p className="text-xs text-base-content/60">
                  Nach Abschluss dieses Moduls können Sie die vermittelten
                  Kompetenzen praktisch anwenden und entsprechende
                  Aufgabenstellungen eigenständig lösen.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
