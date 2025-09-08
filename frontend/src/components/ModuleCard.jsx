import React, { useState } from "react";
import {
  CheckCircleIcon,
  CircleIcon,
  BookOpenIcon,
  ClockIcon,
  CalendarIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

const ModuleCard = ({
  module,
  isCompleted,
  completedAt,
  onToggleComplete,
  canEdit = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!canEdit) return;

    setIsLoading(true);
    try {
      await onToggleComplete(module._id, isCompleted);
      toast.success(
        isCompleted
          ? "Modul als nicht abgeschlossen markiert"
          : "Modul als abgeschlossen markiert"
      );
    } catch (error) {
      console.error("Error toggling module completion:", error);
      toast.error("Fehler beim Aktualisieren des Moduls");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "BFS":
        return "badge-primary";
      case "BAND":
        return "badge-secondary";
      case "ÜK":
        return "badge-accent";
      default:
        return "badge-neutral";
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "BFS":
        return "Berufsfachschule";
      case "BAND":
        return "Betrieb";
      case "ÜK":
        return "Überbetrieblicher Kurs";
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200 ${
        isCompleted ? "border-l-4 border-success" : "border-l-4 border-base-300"
      }`}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="card-title text-lg font-bold text-base-content">
                {module.code}
              </h3>
              <div className={`badge ${getTypeColor(module.type)} badge-sm`}>
                {module.type}
              </div>
            </div>
            <h4 className="text-base font-medium text-base-content/80 mb-2">
              {module.title}
            </h4>
          </div>

          {canEdit && (
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={`btn btn-sm ${
                isCompleted ? "btn-success" : "btn-outline btn-neutral"
              } ${isLoading ? "loading" : ""}`}
            >
              {!isLoading &&
                (isCompleted ? (
                  <CheckCircleIcon className="size-4" />
                ) : (
                  <CircleIcon className="size-4" />
                ))}
              {isCompleted ? "Abgeschlossen" : "Als abgeschlossen markieren"}
            </button>
          )}
        </div>

        {/* Description */}
        {module.description && (
          <p className="text-sm text-base-content/70 mb-4 line-clamp-3">
            {module.description}
          </p>
        )}

        {/* Module Info */}
        <div className="flex flex-wrap gap-4 text-sm text-base-content/60 mb-4">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4" />
            <span>{getTypeName(module.type)}</span>
          </div>

          {module.duration && (
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4" />
              <span>{module.duration} Wochen</span>
            </div>
          )}

          {module.competencies && module.competencies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {module.competencies.length} Kompetenzen
              </span>
            </div>
          )}
        </div>

        {/* Completion Status */}
        {isCompleted && completedAt && (
          <div className="alert alert-success py-2 px-3">
            <CheckCircleIcon className="size-4" />
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4" />
              <span>Abgeschlossen am {formatDate(completedAt)}</span>
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {module.prerequisites && module.prerequisites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-base-200">
            <div className="text-xs text-base-content/60 mb-2">
              Voraussetzungen:
            </div>
            <div className="flex flex-wrap gap-1">
              {module.prerequisites.map((prereq, index) => (
                <span key={index} className="badge badge-outline badge-xs">
                  {prereq.code || prereq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
