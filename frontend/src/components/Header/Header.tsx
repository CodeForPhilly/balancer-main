// import { useState, useRef, useEffect, Fragment } from "react";
import { useState, Fragment } from "react";
import accountLogo from "../../assets/account.svg";
import { Link, useNavigate } from "react-router-dom";
import LoginMenuDropDown from "./LoginMenuDropDown";
import "../../components/Header/header.css";
import Chat from "./Chat";
// import { FeatureMenuDropDown } from "./FeatureMenuDropDown";
import MdNavBar from "./MdNavBar";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../services/actions/types";
import { logout, AppDispatch } from "../../services/actions/auth";
// import { HiChevronDown } from "react-icons/hi";

interface LoginFormProps {
  isAuthenticated: boolean;
  isSuperuser: boolean;
}

const Header = (props: LoginFormProps) => {
  const { isAuthenticated } = props;
  const { isSuperuser } = props;
  const navigate = useNavigate();
  // const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  // const dropdownRef = useRef(null);
  // let delayTimeout: number | null = null;
  const [showChat, setShowChat] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const logout_user = () => {
    dispatch(logout());
    setRedirect(false);
  };

  const guestLinks = () => (
    <nav onClick={handleLoginMenu} className=" flex cursor-pointer  ">
      <img src={accountLogo} alt="logo" className="mr-5 h-5  object-contain " />
      <span className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline">
        Sign in
      </span>
    </nav>
  );

  const authLinks = () => (
    <nav onClick={logout_user} className="  flex  cursor-pointer ">
      <img src={accountLogo} alt="logo" className="mr-5 h-5  object-contain " />
      <span className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline">
        Sign out
      </span>
    </nav>
  );

  const handleLoginMenu = () => {
    setShowLoginMenu(!showLoginMenu);
  };

  // const handleMouseEnter = () => {
  //   if (delayTimeout !== null) {
  //     clearTimeout(delayTimeout);
  //   }
  //   setShowFeaturesMenu(true);
  // };

  // const handleMouseLeave = () => {
  //   delayTimeout = setTimeout(() => {
  //     setShowFeaturesMenu(false);
  //   }, 300) as unknown as number; // Adjust the delay time as needed
  // };

  // useEffect(() => {
  //   return () => {
  //     if (delayTimeout !== null) {
  //       clearTimeout(delayTimeout);
  //     }
  //   };
  // }, [delayTimeout]);

  return (
    <header className="z10 fixed w-full items-center ">
      <div className="hidden w-full items-center justify-center border-b border-gray-300 bg-blue-100 p-1 text-center text-sm font-light text-gray-500 lg:flex">
        <p className="">
          This app is currently in its beta testing phase. The information and
          tools provided herein are intended for general informational purposes
          only and should NOT be construed as medical advice, diagnosis, or
          treatment.
        </p>
      </div>
      <div className="flex items-center justify-center border-b border-gray-300 bg-blue-100 p-1 text-center text-sm font-light text-gray-500 lg:hidden ">
        App is in beta; Do not use info as medical advice.
      </div>
      <div
        className={
          "  hidden h-20  w-full items-center justify-between border-b border-gray-300 bg-white px-96 md:px-20 lg:flex xl:px-60"
        }
      >
        <Link to="/">
          <span className="bg-gradient-to-r  from-blue-500 via-blue-700 to-blue-300 bg-clip-text font-quicksand text-xl font-bold text-transparent lg:text-5xl ">
            Balancer
          </span>
        </Link>
        <nav className="flex font-satoshi text-base lg:gap-2 xl:gap-5">
          {/* <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={dropdownRef}
            className=""
          >
            <span
              className={` mr-9 font-bold text-black ${
                showFeaturesMenu
                  ? "mx-4 cursor-pointer border-b-2 border-blue-600 hover:border-b-2 hover:border-blue-600 hover:text-blue-600 hover:no-underline"
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
                <HiChevronDown className="inline-block" />
              </span>
            </span>
            {showFeaturesMenu && <FeatureMenuDropDown />}
          </div> */}
          <Link
            to="/"
            className="mr-5 font-bold text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
          >
            Medication Suggester
          </Link>
          <>
            <Link
              to="/medications"
              className="mr-5 font-bold text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
            >
              Medication List
            </Link>
            <Link
              to="/about"
              className="mr-5 font-bold text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
            >
              About
            </Link>
            <Link
              to="/help"
              className="mr-5 font-bold text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
            >
              Help
            </Link>
            <Link
              to="/feedback"
              className="mr-5 font-bold text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
            >
              Leave Feedback
            </Link>
            {isSuperuser && (
              <Link
                to="/adminportal"
                className="mr-5 font-bold text-black hover:border-blue-600 hover:text-blue-600 hover:no-underline"
              >
                Admin Portal
              </Link>
            )}
            {redirect ? navigate("/") : <Fragment></Fragment>}
          </>
        </nav>
        <LoginMenuDropDown
          showLoginMenu={showLoginMenu}
          handleLoginMenu={handleLoginMenu}
        />
        {isAuthenticated && (
          <Chat showChat={showChat} setShowChat={setShowChat} />
        )}
        {/* <Chat showChat={showChat} setShowChat={setShowChat} /> */}
        {isAuthenticated ? authLinks() : guestLinks()}
      </div>
      <MdNavBar isAuthenticated={isAuthenticated} />
    </header>
  );
};

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isSuperuser: state.auth.isSuperuser,
});

const ConnectedLayout = connect(mapStateToProps)(Header);
export default ConnectedLayout;
