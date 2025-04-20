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
    <header className="flex h-20 w-full items-center justify-between border-b border-gray-300 bg-white px-4 lg:px-8">
      <nav className="flex flex-grow justify-center space-x-6 font-quicksand text-base text-lg font-semibold text-gray-500">
        <div className=" hover:border-emerald-600 hover:text-emerald-600 hover:no-underline space-x-4">
          <Link
            to="/"
            className="text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
          >
            Home
          </Link>
          <Link
            to="/AdminPortal"
            className="text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
          >
            Admin Portal
          </Link>
        </div>
      </nav>
      {/* Add login menu logic here */}
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
