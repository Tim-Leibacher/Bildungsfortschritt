// frontend/src/components/AreaOverview.jsx
import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  BarChart3Icon,
  AlertTriangleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { competencyHelpers } from "../lib/api";
import CompetencyCard from "./CompetencyCard";

const AreaOverview = ({ area, competencies, stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const areaInfo = competencyHelpers.formatArea(area);

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const progressColor = getProgressColor(stats.percentage);

  return (
    <div className="card bg-base-100 shadow-sm mb-6">
      {/* Area Header */}
      <div
        className="card-header p-4 cursor-pointer hover:bg-base-200/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDownIcon className="w-5 h-5 text-base-content/60" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-base-content/60" />
              )}
              <div
                className={`badge badge-lg badge-${areaInfo.color} font-mono font-bold`}
              >
                {areaInfo.code}
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-base-content">
                {areaInfo.title}
              </h2>
              <p className="text-sm text-base-content/70 mt-1">
                {areaInfo.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress Stats */}
            <div className="text-right">
              <div className="text-sm text-base-content/60">
                {stats.covered} von {stats.total} Leistungszielen
              </div>
              <div className={`text-lg font-bold text-${progressColor}`}>
                {stats.percentage}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-32">
              <div className="w-full bg-base-200 rounded-full h-3">
                <div
                  className={`bg-${progressColor} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${stats.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Status Icon */}
            <div>
              {stats.percentage === 100 ? (
                <CheckCircle2Icon className="w-6 h-6 text-success" />
              ) : stats.percentage >= 70 ? (
                <BarChart3Icon className="w-6 h-6 text-warning" />
              ) : (
                <AlertTriangleIcon className="w-6 h-6 text-error" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="card-body pt-0">
          <div className="divider my-2"></div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stat bg-success/10 rounded-lg p-4">
              <div className="stat-figure text-success">
                <CheckCircle2Icon className="w-8 h-8" />
              </div>
              <div className="stat-title text-success">Abgedeckt</div>
              <div className="stat-value text-2xl text-success">
                {stats.covered}
              </div>
            </div>

            <div className="stat bg-error/10 rounded-lg p-4">
              <div className="stat-figure text-error">
                <AlertTriangleIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-error">Fehlend</div>
              <div className="stat-value text-2xl text-error">
                {stats.uncovered}
              </div>
            </div>

            <div className="stat bg-info/10 rounded-lg p-4">
              <div className="stat-figure text-info">
                <BarChart3Icon className="w-8 h-8" />
              </div>
              <div className="stat-title text-info">Gesamt</div>
              <div className="stat-value text-2xl text-info">{stats.total}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="tabs tabs-boxed mb-4">
            <input
              type="radio"
              name={`area-${area}-tab`}
              className="tab"
              defaultChecked
            />
            <div className="tab">Alle ({stats.total})</div>

            <input type="radio" name={`area-${area}-tab`} className="tab" />
            <div className="tab">Abgedeckt ({stats.covered})</div>

            <input type="radio" name={`area-${area}-tab`} className="tab" />
            <div className="tab">Fehlend ({stats.uncovered})</div>
          </div>

          {/* Competencies List */}
          <div className="space-y-3">
            {competencies
              .sort((a, b) => {
                // Erst nach Status (fehlende zuerst), dann nach Code
                if (a.isCovered !== b.isCovered) {
                  return a.isCovered ? 1 : -1;
                }
                return a.code.localeCompare(b.code);
              })
              .map((competency) => (
                <CompetencyCard
                  key={competency._id}
                  competency={competency}
                  showModules={true}
                />
              ))}
          </div>

          {competencies.length === 0 && (
            <div className="text-center py-8 text-base-content/60">
              <BarChart3Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Leistungsziele in diesem Bereich gefunden.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AreaOverview;
