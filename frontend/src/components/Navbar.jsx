import { BookOpenIcon, UserIcon } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  // Bestimme Button-Text und Route basierend auf aktueller Seite
  const getNavigationConfig = () => {
    const isOnModulesPage = location.pathname === "/modules";

    if (isOnModulesPage) {
      // Auf Module-Seite → zurück zu Dashboard/Detailansicht
      if (user.isBB) {
        return {
          route: "/dashboard",
          text: "Meine Lernenden",
        };
      } else {
        return {
          route: `/student/${user._id}`, // oder "/dashboard" wenn Lernende auf Dashboard bleiben sollen
          text: "Meine Ansicht",
        };
      }
    } else {
      // Auf Dashboard/Student-Seite → zu Modulen
      return {
        route: "/modules",
        text: "Module",
      };
    }
  };

  const navConfig = getNavigationConfig();

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-3xl font-bold text-primary font-mono tracking-tight"
          >
            Bildungsfortschritt
          </Link>
          <div className="flex items-center gap-4">
            <Link to={navConfig.route} className="btn btn-primary">
              <BookOpenIcon className="size-5" />
              <span>{navConfig.text}</span>
            </Link>
            {user && (
              <div className="dropdown dropdown-end">
                {/* Rest des bestehenden User-Dropdown Codes... */}
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-10 rounded-full">
                    <UserIcon className="w-full h-full p-2" />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li className="menu-title">
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs">
                      {user.isBB ? "Berufsbildner" : "Lernender"}
                    </span>
                  </li>
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/modules">Module</Link>
                  </li>
                  <li>
                    <hr />
                  </li>
                  <li>
                    <button onClick={onLogout}>Abmelden</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
