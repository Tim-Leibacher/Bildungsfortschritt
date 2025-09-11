// frontend/src/components/CompetencyCard.jsx
import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
} from "lucide-react";
import { competencyHelpers } from "../lib/api";

const CompetencyCard = ({ competency, showModules = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const taxonomyInfo = competencyHelpers.formatTaxonomy(competency.taxonomy);

  return (
    <div
      className={`card bg-base-100 shadow-sm border-l-4 transition-all duration-200 hover:shadow-md ${
        competency.isCovered ? "border-l-success" : "border-l-error"
      }`}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge badge-sm font-mono font-semibold">
                {competency.code}
              </span>
              <span
                className={`badge badge-sm ${
                  competency.isCovered ? "badge-success" : "badge-error"
                }`}
              >
                {competency.isCovered ? (
                  <>
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Abgedeckt
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-3 h-3 mr-1" />
                    Fehlend
                  </>
                )}
              </span>
              <span className="badge badge-outline badge-sm">
                {competency.taxonomy} - {taxonomyInfo.title}
              </span>
            </div>

            <h3 className="font-semibold text-base text-base-content mb-2">
              {competency.title}
            </h3>

            {competency.description && (
              <p className="text-sm text-base-content/70 mb-3">
                {competency.description}
              </p>
            )}
          </div>
        </div>

        {/* Module Information */}
        {showModules && competency.modules && competency.modules.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-base-content/80">
                Abgedeckt in {competency.modules.length} Modul
                {competency.modules.length !== 1 ? "en" : ""}:
              </span>
              {competency.modules.length > 2 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="btn btn-ghost btn-xs"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <div
              className={`flex flex-wrap gap-2 ${
                !isExpanded && competency.modules.length > 2
                  ? "max-h-12 overflow-hidden"
                  : ""
              }`}
            >
              {competency.modules.map((module, index) => (
                <div
                  key={index}
                  className={`badge badge-sm gap-1 ${
                    module.type === "BFS"
                      ? "badge-primary"
                      : module.type === "ÜK"
                      ? "badge-secondary"
                      : "badge-accent"
                  }`}
                >
                  <BookOpenIcon className="w-3 h-3" />
                  {module.code}
                </div>
              ))}
            </div>
          </div>
        )}

        {showModules &&
          (!competency.modules || competency.modules.length === 0) && (
            <div className="mt-3 p-3 bg-error/10 rounded-lg border border-error/20">
              <p className="text-sm text-error">
                ⚠️ Dieses Leistungsziel wird von keinem Modul abgedeckt
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default CompetencyCard;
