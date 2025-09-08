import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  UserIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  CalendarIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import ProgressCard from "../components/ProgressCard";
import { userAPI } from "../lib/api";

const StudentDetailPage = ({ user, onLogout }) => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is a Berufsbildner
    if (!user.isBB) {
      navigate("/");
      return;
    }

    const fetchStudentProgress = async () => {
      try {
        const res = await userAPI.getUserProgress(studentId);
        setStudentProgress(res.data);
      } catch (error) {
        console.error("Error fetching student progress:", error);
        toast.error("Fehler beim Laden der Lernendendaten");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentProgress();
    }
  }, [studentId, user, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRecentCompletedModules = () => {
    if (!studentProgress?.user.completedModules) return [];

    return studentProgress.user.completedModules
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center text-primary py-10">
            <span className="loading loading-spinner loading-lg"></span>
            <div className="mt-4">Lade Lernendendaten...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentProgress) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center py-12">
            <UserIcon className="size-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Lernender nicht gefunden
            </h3>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const student = studentProgress.user;
  const recentModules = getRecentCompletedModules();

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Back Button */}
        <button className="btn btn-ghost mb-6" onClick={() => navigate("/")}>
          <ArrowLeftIcon className="size-5" />
          Zurück zum Dashboard
        </button>

        {/* Student Header */}
        <div className="card bg-base-100 shadow-sm mb-8">
          <div className="card-body">
            <div className="flex items-center gap-6">
              <div className="avatar">
                <div className="w-24 rounded-full bg-base-200 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-base-content/60" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-base-content mb-2">
                  {student.firstName} {student.lastName}
                </h1>
                <div className="flex items-center gap-4 text-base-content/70">
                  <div className="flex items-center gap-2">
                    <GraduationCapIcon className="size-5" />
                    <span>Lehrjahr: {student.lehrjahr || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-5" />
                    <span>E-Mail: {student.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="stats shadow mb-8 w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <TrendingUpIcon className="size-8" />
            </div>
            <div className="stat-title">Gesamtfortschritt</div>
            <div className="stat-value text-primary">
              {studentProgress.overallProgress.percentage}%
            </div>
            <div className="stat-desc">
              {studentProgress.overallProgress.completed} von{" "}
              {studentProgress.overallProgress.total} Kompetenzen
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <UserIcon className="size-8" />
            </div>
            <div className="stat-title">Abgeschlossene Module</div>
            <div className="stat-value text-secondary">
              {student.completedModules?.length || 0}
            </div>
            <div className="stat-desc">Module erfolgreich abgeschlossen</div>
          </div>

          <div className="stat">
            <div className="stat-title">Aktuelle Leistung</div>
            <div className="stat-value">
              {studentProgress.overallProgress.percentage >= 70
                ? "Sehr gut"
                : studentProgress.overallProgress.percentage >= 50
                ? "Gut"
                : studentProgress.overallProgress.percentage >= 30
                ? "Befriedigend"
                : "Verbesserung nötig"}
            </div>
            <div className="stat-desc">Basierend auf Gesamtfortschritt</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress by Areas */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-base-content mb-6">
              Fortschritt nach Kompetenzbereichen
            </h2>
            <div className="space-y-6">
              {Object.entries(studentProgress.progress).map(
                ([area, areaData]) => (
                  <ProgressCard key={area} area={area} areaData={areaData} />
                )
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-base-content mb-6">
              Zuletzt abgeschlossene Module
            </h2>

            {recentModules.length === 0 ? (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body text-center">
                  <GraduationCapIcon className="size-12 text-base-content/20 mx-auto mb-4" />
                  <p className="text-base-content/70">
                    Noch keine Module abgeschlossen
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentModules.map((completedModule, index) => (
                  <div key={index} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {completedModule.module?.code ||
                              "Unbekanntes Modul"}
                          </h4>
                          <p className="text-sm text-base-content/70">
                            {completedModule.module?.title ||
                              "Titel nicht verfügbar"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-base-content/60">
                            {formatDate(completedModule.completedAt)}
                          </div>
                          <div className="badge badge-success badge-sm">
                            Abgeschlossen
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
