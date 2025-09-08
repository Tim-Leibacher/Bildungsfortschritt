import { BookOpenIcon, UserIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const Navbar = ({ user, onLogout }) => {
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
            <Link to="/modules" className="btn btn-primary">
              <BookOpenIcon className="size-5" />
              <span>Module</span>
            </Link>
            {user && (
              <div className="dropdown dropdown-end">
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
