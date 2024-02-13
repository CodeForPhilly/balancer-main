import { useState, useRef, useEffect, Fragment } from "react";
import accountLogo from "../../assets/account.svg";
import { Link, useNavigate } from "react-router-dom";
import LoginMenuDropDown from "./LoginMenuDropDown";
import "../../components/Header/header.css";
import Chat from "./Chat";
import { FeatureMenuDropDown } from "./FeatureMenuDropDown";
import MdNavBar from "./MdNavBar";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../services/actions/types";
import { logout, AppDispatch } from "../../services/actions/auth";

interface LoginFormProps {
  isAuthenticated: boolean;
}

const Header = (props: LoginFormProps) => {
  const { isAuthenticated } = props;
  const navigate = useNavigate();
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const dropdownRef = useRef(null);
  let delayTimeout: number | null = null;
  const [showChat, setShowChat] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const logout_user = () => {
    dispatch(logout());
    setRedirect(false);
  };

  const guestLinks = () => (
    <nav
      onClick={handleLoginMenu}
      className=" flex w-full cursor-pointer items-center  justify-center "
    >
      <img src={accountLogo} alt="logo" className="mr-5 h-5  object-contain " />
      <span className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline">
        Sign in
      </span>
    </nav>
  );

  const authLinks = () => (
    <nav
      onClick={logout_user}
      className=" ml-40  flex w-full cursor-pointer items-center"
    >
      <img src={accountLogo} alt="logo" className="mr-5 h-5  object-contain " />
      <span className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline">
        Sign out
      </span>
    </nav>
  );

  const handleLoginMenu = () => {
    setShowLoginMenu(!showLoginMenu);
  };

  const handleMouseEnter = () => {
    if (delayTimeout !== null) {
      clearTimeout(delayTimeout);
    }
    setShowFeaturesMenu(true);
  };

  const handleMouseLeave = () => {
    delayTimeout = setTimeout(() => {
      setShowFeaturesMenu(false);
    }, 300) as unknown as number; // Adjust the delay time as needed
  };

  useEffect(() => {
    return () => {
      if (delayTimeout !== null) {
        clearTimeout(delayTimeout);
      }
    };
  }, [delayTimeout]);

  return (
    <header className="fixed w-full items-center">
      <div className="hidden h-8 w-full items-center justify-center border-b border-gray-300 bg-blue-100 text-center text-sm font-light text-gray-500 md:flex">
        This app is currently in its beta testing phase. The information and
        tools provided herein are intended for general informational purposes
        only and should NOT be construed as medical advice, diagnosis, or
        treatment.
      </div>
      <div className="flex h-9 w-full items-center justify-center border-b border-gray-300 bg-blue-100 text-center text-sm font-light text-gray-500 md:hidden ">
        App is in beta; Do not use info as medical advice.
      </div>
      <div
        className={
          "xl:px-50 mx-auto hidden h-20 items-center justify-between border-b border-gray-300 bg-white  px-4 sm:px-6 md:px-8 lg:flex lg:px-8 2xl:px-56"
        }
      >
        <Link to="/">
          <span className="header_logo text-xl font-bold md:ml-72 md:mr-36">
            Balancer
          </span>
        </Link>
        <nav className="flex w-full items-center justify-center font-satoshi text-base">
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={dropdownRef}
            className=""
          >
            <span
              className={` mr-9 text-black ${
                showFeaturesMenu
                  ? "mx-4 cursor-pointer border-b-2 border-blue-600 hover:border-b-2 hover:border-blue-600 hover:no-underline"
                  : "mx-4 cursor-pointer hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
              }`}
            >
              Features
              <span
                className={` ${
                  showFeaturesMenu
                    ? "absolute ml-1.5 rotate-180 transition-transform duration-300"
                    : "absolute ml-1.5 "
                }`}
              >
                &#8593;
              </span>
            </span>
            {showFeaturesMenu && <FeatureMenuDropDown />}
          </div>
          <>
            <Link
              to="/about"
              className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
            >
              About
            </Link>
            <Link
              to="/help"
              className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
            >
              Help
            </Link>
            <Link
              to="/feedback"
              className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
            >
              Leave Feedback
            </Link>
            {redirect ? navigate("/") : <Fragment></Fragment>}
            <LoginMenuDropDown
              showLoginMenu={showLoginMenu}
              handleLoginMenu={handleLoginMenu}
            />
            {isAuthenticated && (
              <Chat showChat={showChat} setShowChat={setShowChat} />
            )}
            {/* <Chat showChat={showChat} setShowChat={setShowChat} /> */}
          </>
        </nav>

        {isAuthenticated ? authLinks() : guestLinks()}
      </div>
      <MdNavBar isAuthenticated={isAuthenticated} />
    </header>
  );
};

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const ConnectedLayout = connect(mapStateToProps)(Header);
export default ConnectedLayout;
