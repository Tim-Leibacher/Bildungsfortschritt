// frontend/src/components/Navbar.jsx - Erweiterte Navigation
import { BookOpenIcon, UserIcon, TargetIcon } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  // Bestimme primäre Navigation basierend auf aktueller Seite und Benutzerrolle
  const getPrimaryNavigation = () => {
    const currentPath = location.pathname;

    if (user.isBB) {
      // Berufsbildner Navigation
      if (currentPath === "/dashboard") {
        return [
          { route: "/modules", text: "Module", icon: BookOpenIcon },
          {
            route: "/competency-overview",
            text: "Leistungsziele",
            icon: TargetIcon,
          },
        ];
      } else if (currentPath === "/modules") {
        return [
          { route: "/dashboard", text: "Meine Lernenden", icon: UserIcon },
          {
            route: "/competency-overview",
            text: "Leistungsziele",
            icon: TargetIcon,
          },
        ];
      } else if (currentPath === "/competency-overview") {
        return [
          { route: "/dashboard", text: "Meine Lernenden", icon: UserIcon },
          { route: "/modules", text: "Module", icon: BookOpenIcon },
        ];
      } else {
        // Fallback für andere Seiten
        return [
          { route: "/dashboard", text: "Dashboard", icon: UserIcon },
          { route: "/modules", text: "Module", icon: BookOpenIcon },
          {
            route: "/competency-overview",
            text: "Leistungsziele",
            icon: TargetIcon,
          },
        ];
      }
    } else {
      // Lernender Navigation
      if (currentPath === "/modules") {
        return [
          { route: "/dashboard", text: "Meine Übersicht", icon: UserIcon },
        ];
      } else {
        return [{ route: "/modules", text: "Module", icon: BookOpenIcon }];
      }
    }
  };

  const navigationItems = getPrimaryNavigation();

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-3xl font-bold text-primary font-mono tracking-tight hover:text-primary-focus transition-colors"
          >
            Bildungsfortschritt
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {/* Primary Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.route;

                return (
                  <Link
                    key={index}
                    to={item.route}
                    className={`btn btn-sm gap-2 transition-all ${
                      isActive ? "btn-primary" : "btn-ghost hover:btn-primary"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{item.text}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className="dropdown dropdown-end md:hidden">
              <label tabIndex={0} className="btn btn-ghost btn-sm">
                <BookOpenIcon className="size-5" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50"
              >
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <Link to={item.route} className="gap-2">
                        <Icon className="size-4" />
                        {item.text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* User Dropdown */}
            {user && (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar hover:bg-base-200"
                >
                  <div className="w-10 rounded-full">
                    <UserIcon className="w-full h-full p-2" />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-56"
                >
                  {/* User Info */}
                  <li className="menu-title">
                    <span className="font-semibold">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs badge badge-sm badge-outline">
                      {user.isBB ? "Berufsbildner" : "Lernender"}
                    </span>
                  </li>

                  <li>
                    <hr className="my-2" />
                  </li>

                  {/* Navigation Links */}
                  <li>
                    <Link to="/dashboard" className="gap-2">
                      <UserIcon className="size-4" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/modules" className="gap-2">
                      <BookOpenIcon className="size-4" />
                      Module
                    </Link>
                  </li>

                  {/* Berufsbildner-spezifische Links */}
                  {user.isBB && (
                    <li>
                      <Link to="/competency-overview" className="gap-2">
                        <TargetIcon className="size-4" />
                        Leistungsziele
                      </Link>
                    </li>
                  )}

                  <li>
                    <hr className="my-2" />
                  </li>

                  {/* Logout */}
                  <li>
                    <button
                      onClick={onLogout}
                      className="text-error hover:bg-error/10"
                    >
                      Abmelden
                    </button>
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
