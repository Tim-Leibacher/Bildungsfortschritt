import { UserIcon, GraduationCapIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const StudentCard = ({ student }) => {
  // Calculate overall progress
  const calculateProgress = () => {
    if (!student.progress) return 0;

    const totalCompetencies = Object.values(student.progress).reduce(
      (sum, area) => sum + area.total,
      0
    );
    const completedCompetencies = Object.values(student.progress).reduce(
      (sum, area) => sum + area.completed,
      0
    );

    return totalCompetencies > 0
      ? Math.round((completedCompetencies / totalCompetencies) * 100)
      : 0;
  };

  const progress = calculateProgress();

  const getProgressColor = (progress) => {
    if (progress < 30) return "text-error";
    if (progress < 70) return "text-warning";
    return "text-success";
  };

  const getProgressBgColor = (progress) => {
    if (progress < 30) return "bg-error";
    if (progress < 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <Link
      to={`/student/${student._id}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-solid border-primary"
    >
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full bg-base-200 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-base-content/60" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="card-title text-base-content">
              {student.firstName} {student.lastName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <GraduationCapIcon className="size-4" />
              <span>Lehrjahr: {student.lehrjahr || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <span>
                Module abgeschlossen: {student.completedModules?.length || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Fortschritt</span>
            <span className={`text-sm font-bold ${getProgressColor(progress)}`}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-base-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressBgColor(
                progress
              )}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StudentCard;
