import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CircleIcon,
} from "lucide-react";

const ProgressCard = ({ area, areaData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "text-error";
    if (percentage < 70) return "text-warning";
    return "text-success";
  };

  const getProgressBgColor = (percentage) => {
    if (percentage < 30) return "bg-error";
    if (percentage < 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="card-title text-lg font-semibold text-base-content mb-2">
              {area}
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-base-content/70">
                {areaData.completed} von {areaData.total} Kompetenzen
              </div>
              <div
                className={`text-sm font-semibold ${getProgressColor(
                  areaData.percentage
                )}`}
              >
                {Math.round(areaData.percentage)}%
              </div>
            </div>
            <div className="w-full bg-base-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressBgColor(
                  areaData.percentage
                )}`}
                style={{ width: `${areaData.percentage}%` }}
              ></div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
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
