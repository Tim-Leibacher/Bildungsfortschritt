import React, { useState } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  CircleIcon,
  CalendarIcon,
} from "lucide-react";

const ModuleCard = ({ module, onToggleComplete, readonly = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const isCompleted = module.completed || false;
  const completedAt = module.completedAt;

  const handleToggleComplete = async () => {
    if (readonly || isLoading) return;

    setIsLoading(true);
    try {
      await onToggleComplete(module._id, isCompleted);
    } catch (error) {
      console.error("Error toggling module completion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "bfs":
        return "BFS";
      case "band":
        return "BAND";
      case "uk":
        return "ÜK";
      default:
        return type || "Unbekannt";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="card-title text-lg font-semibold">
                {module.code}
              </h3>
              <span className="badge badge-outline badge-sm">
                {getTypeName(module.type)}
              </span>
            </div>
            <h4 className="font-medium text-base-content mb-2">
              {module.title}
            </h4>
          </div>

          {!readonly && (
            <button
              onClick={handleToggleComplete}
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
