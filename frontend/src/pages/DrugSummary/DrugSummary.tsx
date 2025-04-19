import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import DrugSummaryForm from "./DrugSummaryForm.tsx";
import LoginMenuDropDown from "../../components/Header/LoginMenuDropDown";
import { useAuth } from "../Layout/authHooks.ts";
import { RootState } from "../../services/actions/types";
import { Link } from "react-router-dom";

interface LoginFormProps {
  isAuthenticated: boolean;
}

function DrugLookup({ isAuthenticated }: LoginFormProps) {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      if (
        location.pathname === "/login" ||
        location.pathname === "/resetpassword" ||
        location.pathname.includes("password") ||
        location.pathname.includes("reset")
      ) {
        setShowLoginMenu(false);
      } else {
        setShowLoginMenu(true);
      }
    }
  }, [isAuthenticated, location.pathname]);

  const handleLoginMenu = () => {
    setShowLoginMenu(!showLoginMenu);
  };

  useAuth();

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Fixed Header */}
      <header className="flex h-20 w-full items-center justify-between border-b border-gray-300 bg-white px-4 lg:px-8">
        <div className="w-1/6 flex-none">
          <span className="bg-gradient-to-r from-blue-500 via-blue-700 to-blue-300 bg-clip-text font-quicksand text-xl font-bold text-transparent lg:text-2xl xl:text-5xl">
            Balancer
          </span>
        </div>
        <nav className="flex flex-grow justify-center space-x-6 font-quicksand text-base text-lg font-semibold text-gray-500">
          <div className="mr-5 hover:border-emerald-600 hover:text-emerald-600 hover:no-underline">
            <Link
              to="/AdminPortal"
              className=" text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
            >
              Admin Portal
            </Link>
          </div>
        </nav>
        <div className="flex w-1/6 flex-none justify-end">
          {/* Add login menu logic here */}
          {!isAuthenticated && showLoginMenu && (
            <LoginMenuDropDown
              showLoginMenu={showLoginMenu}
              handleLoginMenu={handleLoginMenu}
            />
          )}
        </div>
      </header>

      {/* Content Area - takes remaining height */}
      <div className="flex-grow overflow-hidden">
        <DrugSummaryForm />
      </div>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const ConnectedDrugLookup = connect(mapStateToProps)(DrugLookup);
export default ConnectedDrugLookup;
