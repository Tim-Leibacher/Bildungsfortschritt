import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { UserIcon, UsersIcon, TrendingUpIcon } from "lucide-react";

import Navbar from "../components/Navbar";
import StudentCard from "../components/StudentCard";
import ProgressCard from "../components/ProgressCard";
import { userAPI } from "../lib/api";

const Dashboard = ({ user, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.isBB) {
          // Berufsbildner: Fetch assigned students
          const studentsRes = await userAPI.getAssignedStudents();
          setStudents(studentsRes.data);
        } else {
          // Lernender: Fetch own progress
          const progressRes = await userAPI.getUserProgress();
          setUserProgress(progressRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Fehler beim Laden der Daten");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="text-center text-primary py-10">
            <span className="loading loading-spinner loading-lg"></span>
            <div className="mt-4">Lade Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Willkommen, {user.firstName}!
          </h1>
          <p className="text-base-content/70">
            {user.isBB
              ? "Hier ist eine Übersicht Ihrer Lernenden und deren Fortschritt."
              : "Hier ist eine Übersicht Ihres Lernfortschritts."}
          </p>
        </div>

        {user.isBB ? (
          // Berufsbildner Dashboard
          <>
            <div className="stats shadow mb-8">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <UsersIcon className="size-8" />
                </div>
                <div className="stat-title">Lernende</div>
                <div className="stat-value text-primary">{students.length}</div>
                <div className="stat-desc">Ihnen zugewiesen</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary">
                  <TrendingUpIcon className="size-8" />
                </div>
                <div className="stat-title">Durchschnittlicher Fortschritt</div>
                <div className="stat-value text-secondary">
                  {students.length > 0
                    ? Math.round(
                        students.reduce(
                          (acc, student) =>
                            acc +
                            ((student.completedModules?.length || 0) / 20) *
                              100,
                          0
                        ) / students.length
                      )
                    : 0}
                  %
                </div>
                <div className="stat-desc">Ihrer Lernenden</div>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="size-16 text-base-content/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-base-content mb-2">
                  Keine Lernenden zugewiesen
                </h3>
                <p className="text-base-content/70">
                  Es sind Ihnen noch keine Lernenden zugewiesen worden.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-base-content mb-6">
                  Meine Lernenden
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <StudentCard key={student._id} student={student} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          // Lernender Dashboard
          <>
            {userProgress && (
              <>
                <div className="stats shadow mb-8">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <UserIcon className="size-8" />
                    </div>
                    <div className="stat-title">Gesamtfortschritt</div>
                    <div className="stat-value text-primary">
                      {userProgress.overallProgress.percentage}%
                    </div>
                    <div className="stat-desc">
                      {userProgress.overallProgress.completed} von{" "}
                      {userProgress.overallProgress.total} Kompetenzen
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <TrendingUpIcon className="size-8" />
                    </div>
                    <div className="stat-title">Abgeschlossene Module</div>
                    <div className="stat-value text-secondary">
                      {userProgress.user.completedModules?.length || 0}
                    </div>
                    <div className="stat-desc">
                      Module erfolgreich abgeschlossen
                    </div>
                  </div>

                  {userProgress.user.lehrjahr && (
                    <div className="stat">
                      <div className="stat-title">Lehrjahr</div>
                      <div className="stat-value">
                        {userProgress.user.lehrjahr}
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-base-content mb-6">
                  Kompetenzbereiche
                </h2>
                <div className="space-y-6">
                  {Object.entries(userProgress.progress).map(
                    ([area, areaData]) => (
                      <ProgressCard
                        key={area}
                        area={area}
                        areaData={areaData}
                      />
                    )
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
