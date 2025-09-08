import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CircleIcon,
  TrendingUpIcon,
  BookOpenIcon,
} from "lucide-react";

const ProgressCard = ({ area, areaData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "text-error";
    if (percentage < 70) return "text-warning";
    return "text-success";
  };

  const getProgressGradient = (percentage) => {
    if (percentage < 30) return "from-error/20 to-error";
    if (percentage < 70) return "from-warning/20 to-warning";
    return "from-success/20 to-success";
  };

  const getAreaIcon = (areaCode) => {
    const icons = {
      a: "🎯",
      b: "🔧",
      c: "🔒",
      d: "📊",
      e: "💼",
      f: "🌐",
      g: "⚡",
      h: "🚀",
      default: "📚",
    };
    return icons[areaCode] || icons.default;
  };

  const getAreaName = (areaCode) => {
    const names = {
      a: "Projektmanagement",
      b: "Entwicklung",
      c: "Sicherheit",
      d: "Datenmanagement",
      e: "Business",
      f: "Netzwerk",
      g: "App-Entwicklung",
      h: "Deployment",
      default: "Kompetenzbereich",
    };
    return names[areaCode] || names.default;
  };

  return (
    <div className="group">
      {/* Moderne Karte mit Glasmorphismus */}
      <div className="relative overflow-hidden bg-base-200/80 backdrop-blur-xl border border-base-300/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01]">
        {/* Gradient Overlay für visuellen Effekt */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-6">
          {/* Header mit Icon und Titel */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-2xl">{getAreaIcon(area)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-base-content mb-1">
                  {getAreaName(area)}
                </h3>
                <div className="text-sm text-base-content/60">
                  Handlungskompetenzbereich {area?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Expand Button */}
            <button
              className="btn btn-ghost btn-sm btn-circle hover:btn-primary transition-all duration-300"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronRightIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Statistiken */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-base-100/50 rounded-xl p-4 border border-base-300/30">
              <div className="flex items-center gap-2 mb-2">
                <BookOpenIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-base-content/70">
                  Fortschritt
                </span>
              </div>
              <div className="text-2xl font-bold text-base-content">
                {areaData.completed}
                <span className="text-base text-base-content/60">
                  /{areaData.total}
                </span>
              </div>
            </div>

            <div className="bg-base-100/50 rounded-xl p-4 border border-base-300/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-base-content/70">
                  Prozent
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${getProgressColor(
                  areaData.percentage
                )}`}
              >
                {Math.round(areaData.percentage)}%
              </div>
            </div>
          </div>

          {/* Moderner Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-base-content/80">
                Gesamtfortschritt
              </span>
              <span
                className={`font-bold ${getProgressColor(areaData.percentage)}`}
              >
                {Math.round(areaData.percentage)}%
              </span>
            </div>

            <div className="relative h-3 bg-base-300/50 rounded-full overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-base-300/30 to-base-300/60" />

              {/* Progress mit Gradient */}
              <div
                className={`h-full bg-gradient-to-r ${getProgressGradient(
                  areaData.percentage
                )} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${areaData.percentage}%` }}
              >
                {/* Glimmer Effekt */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
            </div>
          </div>

          {/* Expandable Content */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-base-300/30 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-accent" />
                </div>
                <h4 className="font-semibold text-base-content">
                  Einzelne Kompetenzen
                </h4>
              </div>

              <div className="grid gap-3">
                {areaData.competencies?.map((competency) => (
                  <div
                    key={competency._id}
                    className="group/item flex items-center gap-3 p-3 rounded-xl bg-base-100/30 border border-base-300/20 hover:bg-base-100/50 hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Status Icon */}
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        competency.completed
                          ? "bg-success border-success text-success-content"
                          : "border-base-content/30 group-hover/item:border-primary/50"
                      }`}
                    >
                      {competency.completed ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <CircleIcon className="w-3 h-3" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                          {competency.code}
                        </span>
                        {competency.taxonomy && (
                          <span className="font-mono text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-md">
                            {competency.taxonomy}
                          </span>
                        )}
                      </div>
                      <h5 className="font-medium text-sm text-base-content mb-1 truncate">
                        {competency.title}
                      </h5>
                      {competency.description && (
                        <p className="text-xs text-base-content/60 line-clamp-2">
                          {competency.description}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    {competency.completed && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 bg-success/20 text-success text-xs font-medium rounded-md">
                          Abgeschlossen
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
