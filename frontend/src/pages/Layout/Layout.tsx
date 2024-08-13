// Layout.tsx
import { ReactNode, useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoginMenuDropDown from "../../components/Header/LoginMenuDropDown";
import { connect } from "react-redux";
import { useAuth } from "./authHooks.ts";
import { RootState } from "../../services/actions/types";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

interface LoginFormProps {
  isAuthenticated: boolean;
}

export const Layout = ({
  children,
  isAuthenticated,
}: LayoutProps & LoginFormProps): JSX.Element => {
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
  const resetForm = () => {
    resetForm();
  };
  useAuth();
  return (
    <main>
      <div className="main">
        <div className="gradient" />
      </div>
      <div className="relative z-10 mx-auto flex w-full flex-col items-center">
        {!isAuthenticated && showLoginMenu && (
          <LoginMenuDropDown
            showLoginMenu={showLoginMenu}
            handleLoginMenu={handleLoginMenu}
          />
        )}
        <Header  
        resetForm={resetForm}
        />
        {children}
        <Footer />
      </div>
    </main>
  );
};

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const ConnectedLayout = connect(mapStateToProps)(Layout);
export default ConnectedLayout;
