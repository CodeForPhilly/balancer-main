import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginMenuDropDown from "../../components/Header/LoginMenuDropDown.tsx";
import { useAuth } from "./authHooks.ts";

interface LoginFormProps {
  isAuthenticated: boolean;
}

const Header: React.FC<LoginFormProps> = ({ isAuthenticated }) => {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // only show the login menu on non‑auth pages
    if (!isAuthenticated) {
      const path = location.pathname;
      const isAuthPage =
        path === "/login" ||
        path === "/resetpassword" ||
        path.includes("password") ||
        path.includes("reset");

      setShowLoginMenu(!isAuthPage);
    }
  }, [isAuthenticated, location.pathname]);

  const handleLoginMenu = () => {
    setShowLoginMenu((prev) => !prev);
  };

  useAuth();

  return (
    <header
      className="flex  w-full items-center justify-between border-b border-blue-300 bg-white p-4 lg:px-8"
      style={{ height: "43px", minHeight: "43px", maxHeight: "43px" }}
    >
      <div className="flex-grow"></div>
      <nav className="flex items-center space-x-2 font-quicksand text-sm font-medium">
        <div className=" hover:border-emerald-600 hover:text-emerald-600 hover:no-underline space-x-4">
          <Link
            to="/"
            className="px-3 py-1.5 text-gray-700 bg-sky-100 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/AdminPortal"
            className="px-3 py-1.5 text-gray-700 bg-sky-100 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200"
          >
            Admin Portal
          </Link>
        </div>
      </nav>
      {!isAuthenticated && showLoginMenu && (
        <div className="flex w-1/6 flex-none justify-end">
          <LoginMenuDropDown
            showLoginMenu={showLoginMenu}
            handleLoginMenu={handleLoginMenu}
          />
        </div>
      )}
    </header>
  );
};

export default Header;
