import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CircleIcon,
} from "lucide-react";
import React, { useState } from "react";

const ProgressCard = ({ area, areaData, areaNames }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAreaName = (areaCode) => {
    const names = {
      a: "Begleiten von ICT-Projekten",
      b: "Unterstützen und Beraten im ICT-Umfeld",
      c: "Aufbauen und Pflegen von digitalen Daten",
      d: "Implementieren von Sicherheitsrichtlinien",
      e: "Installieren und Konfigurieren von Betriebssystemen und Applikationen",
      f: "Implementieren von Netzinfrastrukturen",
      g: "Entwickeln von Applikationen",
      h: "Ausliefern und Betreiben von Applikationen",
    };
    return names[areaCode] || `Kompetenzbereich ${areaCode.toUpperCase()}`;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30)
      return {
        bg: "bg-error",
        text: "text-error",
        border: "border-error",
        badge: "badge-error",
      };
    if (percentage < 70)
      return {
        bg: "bg-warning",
        text: "text-warning",
        border: "border-warning",
        badge: "badge-warning",
      };
    return {
      bg: "bg-success",
      text: "text-success",
      border: "border-success",
      badge: "badge-success",
    };
  };

  const colors = getProgressColor(areaData.percentage);

  return (
    <div
      className={`card bg-base-100 border-2 ${colors.border} transition-all duration-200`}
    >
      <div className="card-body">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`badge ${colors.badge} badge-lg font-mono`}>
                {area.toUpperCase()}
              </div>
              <h3 className="card-title text-lg">{getAreaName(area)}</h3>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-base-content/70">
                  Fortschritt:
                </span>
                <span className={`font-bold ${colors.text}`}>
                  {areaData.completed}/{areaData.total} ({areaData.percentage}%)
                </span>
              </div>
            </div>

            <div className="w-full bg-base-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${colors.bg}`}
                style={{ width: `${areaData.percentage}%` }}
              ></div>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm">
            {isExpanded ? (
              <ChevronDownIcon className="size-5" />
            ) : (
              <ChevronRightIcon className="size-5" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <h4 className="font-semibold text-base-content mb-3">
              Einzelne Kompetenzen:
            </h4>
            <div className="space-y-2">
              {areaData.competencies.map((competency) => (
                <div
                  key={competency._id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-base-50"
                >
                  {competency.completed ? (
                    <CheckCircleIcon className="size-5 text-success flex-shrink-0" />
                  ) : (
                    <CircleIcon className="size-5 text-base-content/40 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        {competency.code}
                      </span>
                      <span
                        className={`badge badge-xs ${
                          competency.completed
                            ? "badge-success"
                            : "badge-neutral"
                        }`}
                      >
                        {competency.taxonomy}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80 truncate">
                      {competency.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
