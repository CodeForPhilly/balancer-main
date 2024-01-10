// Layout.tsx
import { ReactNode, useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoginMenuDropDown from "../../components/Header/LoginMenuDropDown";
import { connect } from "react-redux";
import { useAuth } from "./AuthHooks";
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
    // console.log(isAuthenticated);
    if (!isAuthenticated) {
      setShowLoginMenu(true);
    }
    if (location.pathname === "/login" && !isAuthenticated) {
      setShowLoginMenu(false);
    } else if (location.pathname === "/resetpassword" && !isAuthenticated) {
      setShowLoginMenu(false);
    } else if (!isAuthenticated) {
      setShowLoginMenu(true);
    }
  }, [isAuthenticated, location.pathname]);

  const handleLoginMenu = () => {
    setShowLoginMenu(!showLoginMenu);
  };

  useAuth();
  return (
    <main>
      <div className="main">
        <div className="gradient" />
      </div>
      <div className="container">
        {!isAuthenticated && (
          <LoginMenuDropDown
            showLoginMenu={showLoginMenu}
            handleLoginMenu={handleLoginMenu}
          />
        )}
        <Header />
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
